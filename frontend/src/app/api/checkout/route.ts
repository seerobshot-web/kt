import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { computeSubtotalCents } from '@/lib/catalog';
import { upsertCustomer, createPickupOrder, chargeOrder } from '@/lib/squareOrders';
import { isValidPickupSelection } from '@/lib/pickup';
import { sendOrderNotificationEmail } from '@/lib/mailer';
import { isSquareConfigured } from '@/lib/square';

const CheckoutSchema = z.object({
  customer: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(10),
    pickupDate: z.string().min(1),
    pickupDay: z.enum(['friday', 'saturday']),
  }),
  items: z.array(z.object({ id: z.string(), quantity: z.number().int().min(1) })).min(1),
  sourceId: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = CheckoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Please check your details and try again.' }, { status: 422 });
  }
  const { customer, items, sourceId } = parsed.data;

  if (!isValidPickupSelection(customer.pickupDate, customer.pickupDay)) {
    return NextResponse.json(
      { success: false, error: 'That pickup date is no longer available. Please refresh the page and choose a current date.' },
      { status: 422 }
    );
  }

  let subtotalCents: number;
  try {
    subtotalCents = computeSubtotalCents(items);
  } catch {
    return NextResponse.json(
      { success: false, error: 'Your cart contains an item that is no longer on the menu. Please rebuild your cart.' },
      { status: 422 }
    );
  }

  if (!isSquareConfigured()) {
    return NextResponse.json(
      { success: false, error: 'Payment is not configured yet. Please contact us to complete your order.' },
      { status: 500 }
    );
  }

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
    });
    const payment = await chargeOrder({
      orderId: order.id!,
      sourceId,
      amountCents: subtotalCents,
      buyerEmail: customer.email,
      autocomplete: true,
    });

    sendOrderNotificationEmail({ customer, items, subtotalCents, paymentId: payment.id, orderId: order.id }).catch((err) => {
      console.error('Order email failed (payment succeeded):', err);
    });

    return NextResponse.json({ success: true, paymentId: payment.id, orderId: order.id });
  } catch (err: any) {
    console.error('Checkout error:', err);
    const detail = err?.body?.errors?.[0]?.detail || err?.errors?.[0]?.detail || err?.message;
    return NextResponse.json(
      { success: false, error: detail || 'Your card could not be charged. Please check your details and try again.' },
      { status: 402 }
    );
  }
}
