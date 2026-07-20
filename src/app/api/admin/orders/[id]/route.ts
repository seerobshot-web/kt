import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { getSquareClient, getSquareLocationId } from '@/lib/square';
import { serializeBigInt } from '@/lib/serialize';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const client = getSquareClient();
    const result = await client.orders.get({ orderId: id });
    return NextResponse.json(serializeBigInt({ order: result.order }));
  } catch (err: any) {
    console.error('Admin order detail error:', err);
    return NextResponse.json({ error: err?.message || 'Failed to load order.' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const newState = body?.state;
  if (!['COMPLETED', 'CANCELED'].includes(newState)) {
    return NextResponse.json({ error: 'state must be COMPLETED or CANCELED.' }, { status: 422 });
  }

  try {
    const client = getSquareClient();
    const current = await client.orders.get({ orderId: id });
    if (!current.order) return NextResponse.json({ error: 'Order not found.' }, { status: 404 });

    const result = await client.orders.update({
      orderId: id,
      order: {
        locationId: getSquareLocationId(),
        version: current.order.version,
        state: newState,
      },
      idempotencyKey: randomUUID(),
    });
    return NextResponse.json(serializeBigInt({ order: result.order }));
  } catch (err: any) {
    console.error('Admin order status update error:', err);
    return NextResponse.json({ error: err?.message || 'Failed to update order.' }, { status: 500 });
  }
}
