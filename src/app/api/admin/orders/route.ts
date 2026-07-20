import { NextRequest, NextResponse } from 'next/server';
import { getSquareClient, getSquareLocationId } from '@/lib/square';
import { serializeBigInt } from '@/lib/serialize';

export async function GET(req: NextRequest) {
  const state = req.nextUrl.searchParams.get('state');
  try {
    const client = getSquareClient();
    const result = await client.orders.search({
      locationIds: [getSquareLocationId()],
      query: state ? { filter: { stateFilter: { states: [state as any] } } } : undefined,
      limit: 100,
    });

    const orders = (result.orders ?? []).slice().sort((a, b) => {
      const aAt = a.fulfillments?.[0]?.pickupDetails?.pickupAt || '';
      const bAt = b.fulfillments?.[0]?.pickupDetails?.pickupAt || '';
      return aAt.localeCompare(bAt);
    });

    return NextResponse.json(serializeBigInt({ orders }));
  } catch (err: any) {
    console.error('Admin orders list error:', err);
    return NextResponse.json({ error: err?.message || 'Failed to load orders.' }, { status: 500 });
  }
}
