import { NextRequest, NextResponse } from 'next/server';
import { getSquareClient } from '@/lib/square';
import { chargeOrder, readOrderBalance, recordOrderPayment } from '@/lib/squareOrders';
import { serializeBigInt } from '@/lib/serialize';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const sourceId = body?.sourceId;
  if (!sourceId) {
    return NextResponse.json({ error: 'sourceId is required.' }, { status: 422 });
  }

  try {
    const client = getSquareClient();
    const current = await client.orders.get({ orderId: id });
    if (!current.order) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });

    const { remainingCents } = readOrderBalance(current.order);
    if (remainingCents <= 0) {
      return NextResponse.json({ error: 'This order has no remaining balance.' }, { status: 422 });
    }

    // Charged as a standalone payment (not attached to order_id) since
    // Square requires an order-attached payment to equal the full order
    // total — see the accounting note in src/lib/squareOrders.ts.
    const payment = await chargeOrder({
      orderId: id,
      sourceId,
      amountCents: remainingCents,
      attachToOrder: false,
    });
    const order = await recordOrderPayment(id, remainingCents);

    return NextResponse.json(serializeBigInt({ success: true, payment, order }));
  } catch (err: any) {
    console.error('Admin collect-balance error:', err);
    const detail = err?.body?.errors?.[0]?.detail || err?.message;
    return NextResponse.json({ error: detail || 'Failed to collect payment.' }, { status: 402 });
  }
}

