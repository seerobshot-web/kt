import { NextRequest, NextResponse } from 'next/server';
import { getSquareClient } from '@/lib/square';
import { chargeOrder } from '@/lib/squareOrders';
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
    const balance = current.order?.netAmountDueMoney?.amount;
    if (!balance || balance <= BigInt(0)) {
      return NextResponse.json({ error: 'This order has no remaining balance.' }, { status: 422 });
    }

    const payment = await chargeOrder({
      orderId: id,
      sourceId,
      amountCents: Number(balance),
      autocomplete: true,
    });

    return NextResponse.json(serializeBigInt({ success: true, payment }));
  } catch (err: any) {
    console.error('Admin collect-balance error:', err);
    const detail = err?.body?.errors?.[0]?.detail || err?.message;
    return NextResponse.json({ error: detail || 'Failed to collect payment.' }, { status: 402 });
  }
}
