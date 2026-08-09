import { NextRequest, NextResponse } from 'next/server';
import { WebhooksHelper } from 'square';
import { getSquareClient } from '@/lib/square';
import { recordOrderPayment } from '@/lib/squareOrders';
import { sendOrderConfirmationEmail } from '@/lib/mailer';

// Square calls this endpoint directly (no browser session, no cookies), so
// the only thing standing between this route and a forged request is the
// HMAC signature Square computes over the exact request body + this URL.
// Configure the matching URL + signature key on the webhook subscription in
// the Square Developer Dashboard (Webhooks > Signature Key).
export async function POST(req: NextRequest) {
  const notificationUrl = process.env.SQUARE_WEBHOOK_NOTIFICATION_URL;
  const signatureKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;
  const signatureHeader = req.headers.get('x-square-hmacsha256-signature');

  if (!notificationUrl || !signatureKey) {
    console.error('Square webhook received but SQUARE_WEBHOOK_NOTIFICATION_URL/SQUARE_WEBHOOK_SIGNATURE_KEY are not configured.');
    return NextResponse.json({ error: 'Webhook not configured.' }, { status: 500 });
  }
  if (!signatureHeader) {
    return NextResponse.json({ error: 'Missing signature.' }, { status: 401 });
  }

  const requestBody = await req.text();
  const isValid = await WebhooksHelper.verifySignature({ requestBody, signatureHeader, signatureKey, notificationUrl });
  if (!isValid) {
    console.error('Square webhook signature verification failed.');
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 401 });
  }

  const event = JSON.parse(requestBody);

  try {
    if (event.type === 'payment.created' || event.type === 'payment.updated') {
      await handlePaymentEvent(event.data?.object?.payment);
    }
  } catch (err) {
    // Square retries on non-2xx, but a bug in our handling shouldn't cause
    // Square to hammer this endpoint indefinitely — log and ack instead.
    console.error('Square webhook handling error:', err);
  }

  return NextResponse.json({ received: true });
}

async function handlePaymentEvent(payment: any) {
  if (!payment || payment.status !== 'COMPLETED' || !payment.order_id) return;
  const orderId = payment.order_id;

  const client = getSquareClient();
  const current = await client.orders.get({ orderId });
  if (!current.order) return;

  // Only orders created by the Payment Link checkout flow (src/app/api/checkout/route.ts)
  // are reconciled here — admin-charged orders (take-payment, collect-balance)
  // already update their own balance synchronously in the same request that
  // charges the card, so applying this payment to them again would double-count.
  if (current.order.metadata?.paymentPlan !== 'awaiting_payment') return;
  if (current.order.state === 'COMPLETED') return; // already processed (webhook redelivery)

  const amountCents = Number(payment.amount_money?.amount || 0);
  const updated = await recordOrderPayment(orderId, amountCents);
  if (updated) {
    sendOrderConfirmationEmail(updated, payment.id).catch((err) => {
      console.error('Order confirmation email failed (payment succeeded):', err);
    });
  }
}
