import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { computeSubtotalCents } from '@/lib/catalog';
import { upsertCustomer, createPickupOrder, chargeOrder } from '@/lib/squareOrders';
import { isValidPickupSelection } from '@/lib/pickup';
import { sendOrderNotificationEmail } from '@/lib/mailer';
import { isSquareConfigured } from '@/lib/square';

const TakePaymentSchema = z.object({
  customer: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(10),
    pickupDate: z.string().min(1),
    pickupDay: z.enum(['friday', 'saturday']),
  }),
  items: z.array(z.object({ id: z.string(), quantity: z.number().int().min(1) })).min(1),
  sourceId: z.string().min(1),
  depositOnly: z.boolean().optional().default(false),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = TakePaymentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Please check the order details and try again.' }, { status: 422 });
  }
  const { customer, items, sourceId, depositOnly } = parsed.data;

  if (!isValidPickupSelection(customer.pickupDate, customer.pickupDay)) {
    return NextResponse.json({ success: false, error: 'That pickup date is outside the current selectable window.' }, { status: 422 });
  }

  let subtotalCents: number;
  try {
    subtotalCents = computeSubtotalCents(items);
  } catch {
    return NextResponse.json({ success: false, error: 'This order contains an item that is no longer on the menu.' }, { status: 422 });
  }

  if (!isSquareConfigured()) {
    return NextResponse.json({ success: false, error: 'Square is not configured yet.' }, { status: 500 });
  }

  const amountCents = depositOnly ? Math.round(subtotalCents / 2) : subtotalCents;

  try {
    const customerId = await upsertCustomer(customer);
    const order = await createPickupOrder({
      customerId,
      items,
      pickupDateISO: customer.pickupDate,
      pickupDay: customer.pickupDay,
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      totalCents: subtotalCents,
      depositCents: depositOnly ? amountCents : undefined,
    });
    const payment = await chargeOrder({
      orderId: order.id!,
      sourceId,
      amountCents,
      buyerEmail: customer.email,
      attachToOrder: !depositOnly,
    });

    sendOrderNotificationEmail({ customer, items, subtotalCents: amountCents, paymentId: payment.id, orderId: order.id }).catch((err) => {
      console.error('Order email failed (payment succeeded):', err);
    });

    return NextResponse.json({ success: true, paymentId: payment.id, orderId: order.id, amountChargedCents: amountCents, totalCents: subtotalCents });
  } catch (err: any) {
    console.error('Take-payment error:', err);
    const detail = err?.body?.errors?.[0]?.detail || err?.message;
    return NextResponse.json({ success: false, error: detail || 'The card could not be charged.' }, { status: 402 });
  }
}
