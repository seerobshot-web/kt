import { NextRequest, NextResponse } from 'next/server';
import { getSquareClient, getSquareLocationId } from '@/lib/square';
import { serializeBigInt } from '@/lib/serialize';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const client = getSquareClient();
    const [customerResult, ordersResult] = await Promise.all([
      client.customers.get({ customerId: id }),
      client.orders.search({
        locationIds: [getSquareLocationId()],
        query: { filter: { customerFilter: { customerIds: [id] } } },
      }),
    ]);

    const orders = ordersResult.orders ?? [];
    const withPickup = orders.map((o) => ({
      order: o,
      pickupAt: o.fulfillments?.[0]?.pickupDetails?.pickupAt || null,
    }));

    const completed = withPickup.filter((o) => o.order.state === 'COMPLETED');
    const lastOrder = completed.sort((a, b) => (b.pickupAt || '').localeCompare(a.pickupAt || ''))[0]?.order || null;

    const now = new Date().toISOString();
    const upcomingOpen = withPickup.filter((o) => o.order.state === 'OPEN' && o.pickupAt && o.pickupAt >= now);
    const nextOrder = upcomingOpen.sort((a, b) => (a.pickupAt || '').localeCompare(b.pickupAt || ''))[0]?.order || null;

    return NextResponse.json(
      serializeBigInt({
        customer: customerResult.customer,
        orders,
        lastOrder,
        nextOrder,
      })
    );
  } catch (err: any) {
    console.error('Admin customer detail error:', err);
    return NextResponse.json({ error: err?.message || 'Failed to load customer.' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  try {
    const client = getSquareClient();
    const result = await client.customers.update({
      customerId: id,
      givenName: body?.givenName,
      familyName: body?.familyName,
      emailAddress: body?.email,
      phoneNumber: body?.phone,
    });
    return NextResponse.json(serializeBigInt({ customer: result.customer }));
  } catch (err: any) {
    console.error('Admin customer update error:', err);
    return NextResponse.json({ error: err?.message || 'Failed to update customer.' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const client = getSquareClient();
    await client.customers.delete({ customerId: id });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Admin customer archive error:', err);
    return NextResponse.json({ error: err?.message || 'Failed to archive customer.' }, { status: 500 });
  }
}
