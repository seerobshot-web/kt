import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSquareClient, getSquareLocationId, isSquareConfigured } from '@/lib/square';
import { upsertCustomer, createCustomOrder, createAndPublishInvoice } from '@/lib/squareOrders';
import { serializeBigInt } from '@/lib/serialize';

const CreateInvoiceSchema = z.object({
  customer: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().min(10),
  }),
  lineItems: z
    .array(
      z.object({
        name: z.string().min(1),
        quantity: z.number().int().min(1),
        priceCents: z.number().int().min(1),
      })
    )
    .min(1),
  dueDate: z.string().min(1), // YYYY-MM-DD
  title: z.string().max(255).optional(),
  description: z.string().max(2000).optional(),
});

export async function GET() {
  if (!isSquareConfigured()) {
    return NextResponse.json({ error: 'Square is not configured yet.' }, { status: 500 });
  }
  try {
    const client = getSquareClient();
    const result = await client.invoices.list({ locationId: getSquareLocationId(), limit: 50 });
    return NextResponse.json(serializeBigInt({ invoices: result.data ?? [] }));
  } catch (err: any) {
    console.error('Admin invoices list error:', err);
    return NextResponse.json({ error: err?.message || 'Failed to load invoices.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = CreateInvoiceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Please check the invoice details and try again.' }, { status: 422 });
  }
  const { customer, lineItems, dueDate, title, description } = parsed.data;

  if (!isSquareConfigured()) {
    return NextResponse.json({ success: false, error: 'Square is not configured yet.' }, { status: 500 });
  }

  try {
    const customerId = await upsertCustomer(customer);
    const order = await createCustomOrder({ customerId, items: lineItems });
    const invoice = await createAndPublishInvoice({
      orderId: order.id!,
      customerId,
      dueDate,
      title,
      description,
    });

    return NextResponse.json(serializeBigInt({ success: true, orderId: order.id, invoice }));
  } catch (err: any) {
    console.error('Admin create invoice error:', err);
    const detail = err?.body?.errors?.[0]?.detail || err?.errors?.[0]?.detail || err?.message;
    return NextResponse.json({ success: false, error: detail || 'Failed to create invoice.' }, { status: 500 });
  }
}
