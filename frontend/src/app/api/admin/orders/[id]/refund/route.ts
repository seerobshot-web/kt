import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { getSquareClient } from '@/lib/square';
import { serializeBigInt } from '@/lib/serialize';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const paymentId = body?.paymentId;
  const amountCents = Number(body?.amountCents);
  const reason = body?.reason || `Refund for order ${id}`;

  if (!paymentId || !amountCents || amountCents <= 0) {
    return NextResponse.json({ error: 'paymentId and a positive amountCents are required.' }, { status: 422 });
  }

  try {
    const client = getSquareClient();
    const result = await client.refunds.refundPayment({
      idempotencyKey: randomUUID(),
      paymentId,
      amountMoney: { amount: BigInt(amountCents), currency: 'USD' },
      reason,
    });
    return NextResponse.json(serializeBigInt({ refund: result.refund }));
  } catch (err: any) {
    console.error('Admin refund error:', err);
    const detail = err?.body?.errors?.[0]?.detail || err?.message;
    return NextResponse.json({ error: detail || 'Failed to issue refund.' }, { status: 402 });
  }
}
