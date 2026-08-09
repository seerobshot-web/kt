import { NextRequest, NextResponse } from 'next/server';
import { DateTime } from 'luxon';
import { getSquareClient } from '@/lib/square';
import { readOrderBalance } from '@/lib/squareOrders';
import { TIME_ZONE } from '@/lib/pickup';

// Public by design (no admin auth) — the return page needs to poll this
// right after a customer pays, before they'd ever have an admin session.
// The order id itself acts as the access token: it's a long Square-assigned
// id from a redirect URL we generated, not a guessable sequential value, and
// the response only exposes what the customer already knows (their own
// order's name/pickup/total), never other customers' data.
export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get('orderId');
  if (!orderId) {
    return NextResponse.json({ error: 'orderId is required.' }, { status: 422 });
  }

  try {
    const client = getSquareClient();
    const result = await client.orders.get({ orderId });
    const order = result.order;
    if (!order) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    const { totalCents, remainingCents } = readOrderBalance(order);
    const recipient = order.fulfillments?.[0]?.pickupDetails?.recipient;
    const pickupAt = order.fulfillments?.[0]?.pickupDetails?.pickupAt;

    return NextResponse.json({
      paid: order.state === 'COMPLETED' && remainingCents <= 0,
      state: order.state,
      customerName: recipient?.displayName || null,
      pickupLabel: pickupAt ? DateTime.fromISO(pickupAt).setZone(TIME_ZONE).toFormat("cccc, LLLL d 'at' h:mm a") : null,
      totalCents,
    });
  } catch (err: any) {
    console.error('Checkout status error:', err);
    return NextResponse.json({ error: 'Failed to look up order.' }, { status: 500 });
  }
}
