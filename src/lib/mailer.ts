import nodemailer from 'nodemailer';
import { DateTime } from 'luxon';
import { catalog } from './catalog';
import { TIME_ZONE } from './pickup';
import type { CartLine } from './squareOrders';

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
}

function getSmtpFrom(): string {
  return process.env.SMTP_USER || 'no-reply@kingdomtreatzrva.com';
}

function getTransporter() {
  const smtpPass = process.env.SMTP_PASS;
  if (!smtpPass) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.hostinger.com',
    port: Number(process.env.SMTP_PORT || 465),
    secure: true,
    auth: { user: getSmtpFrom(), pass: smtpPass },
  });
}

export async function sendOrderNotificationEmail({
  customer,
  items,
  subtotalCents,
  paymentId,
  orderId,
}: {
  customer: { name: string; email: string; phone: string; pickupDate: string; pickupDay: string };
  items: CartLine[];
  subtotalCents: number;
  paymentId?: string;
  orderId?: string;
}): Promise<void> {
  const transporter = getTransporter();
  if (!transporter) {
    console.log('SMTP_PASS not set; skipping order notification email.');
    return;
  }

  const rows = items
    .map((item) => {
      const catalogItem = catalog.find((c) => c.id === item.id);
      const lineCents = (catalogItem?.priceCents || 0) * item.quantity;
      return `<tr><td style="padding:10px;border-bottom:1px solid #eee;">${catalogItem?.name || `Item ${item.id}`}</td><td style="padding:10px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td><td style="padding:10px;border-bottom:1px solid #eee;text-align:right;">$${(lineCents / 100).toFixed(2)}</td></tr>`;
    })
    .join('');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #4A3A35;">
      <h2>New Paid Order</h2>
      <p>A new order has been placed and paid on the website.</p>
      <div style="background:#FFF9F2;padding:20px;border-radius:4px;margin-bottom:20px;">
        <p><strong>Name:</strong> ${customer.name}</p>
        <p><strong>Email:</strong> ${customer.email}</p>
        <p><strong>Phone:</strong> ${customer.phone}</p>
        <p><strong>Pickup:</strong> ${customer.pickupDay} — ${customer.pickupDate}</p>
      </div>
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
        <thead><tr><th style="text-align:left;padding:10px;border-bottom:2px solid #4A3A35;">Item</th><th style="padding:10px;border-bottom:2px solid #4A3A35;">Qty</th><th style="text-align:right;padding:10px;border-bottom:2px solid #4A3A35;">Price</th></tr></thead>
        <tbody>${rows}</tbody>
        <tfoot><tr><td colspan="2" style="text-align:right;padding:10px;font-weight:bold;">Total Paid:</td><td style="text-align:right;padding:10px;font-weight:bold;">$${(subtotalCents / 100).toFixed(2)}</td></tr></tfoot>
      </table>
      <p style="font-size:12px;color:#888;">Square order id: ${orderId || 'n/a'} &middot; payment id: ${paymentId || 'n/a'}</p>
    </div>
  `;

  await transporter.sendMail({
    from: getSmtpFrom(),
    to: 'info@kingdomtreatzrva.com',
    subject: `New Paid Order - ${customer.name}`,
    html,
  });
}

// Square order/line-item shapes are structurally compatible with the SDK's
// Order type but kept loose here so callers can pass the plain object
// returned by client.orders.get() without an SDK type import.
interface OrderLike {
  id?: string;
  lineItems?: { name?: string | null; quantity: string; basePriceMoney?: { amount?: bigint | number | null } | null }[] | null;
  metadata?: Record<string, string | null> | null;
  totalMoney?: { amount?: bigint | number | null } | null;
  fulfillments?:
    | {
        pickupDetails?: {
          pickupAt?: string | null;
          note?: string | null;
          recipient?: { displayName?: string | null; emailAddress?: string | null; phoneNumber?: string | null } | null;
        } | null;
      }[]
    | null;
}

// Fired from the Payment Link checkout flow once the payment.updated webhook
// confirms the charge went through — everything needed for the email lives
// on the Square order itself, so there's no separate cart/customer payload
// to pass around between the checkout request and the async webhook.
export async function sendOrderConfirmationEmail(order: OrderLike, paymentId?: string): Promise<void> {
  const transporter = getTransporter();
  if (!transporter) {
    console.log('SMTP_PASS not set; skipping order confirmation email.');
    return;
  }

  const recipient = order.fulfillments?.[0]?.pickupDetails?.recipient;
  const pickupAt = order.fulfillments?.[0]?.pickupDetails?.pickupAt;
  const pickupNote = order.fulfillments?.[0]?.pickupDetails?.note;
  const totalCents = order.metadata?.totalCents ? Number(order.metadata.totalCents) : Number(order.totalMoney?.amount || 0);
  const pickupLabel = pickupAt ? DateTime.fromISO(pickupAt).setZone(TIME_ZONE).toFormat("cccc, LLLL d 'at' h:mm a") : 'To be confirmed';

  const rows = (order.lineItems || [])
    .map((item) => {
      const lineCents = Number(item.basePriceMoney?.amount || 0) * Number(item.quantity);
      return `<tr><td style="padding:10px;border-bottom:1px solid #eee;">${escapeHtml(item.name || 'Item')}</td><td style="padding:10px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td><td style="padding:10px;border-bottom:1px solid #eee;text-align:right;">$${(lineCents / 100).toFixed(2)}</td></tr>`;
    })
    .join('');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #4A3A35;">
      <h2>New Paid Order</h2>
      <p>A new order has been placed and paid on the website.</p>
      <div style="background:#FFF9F2;padding:20px;border-radius:4px;margin-bottom:20px;">
        <p><strong>Name:</strong> ${escapeHtml(recipient?.displayName || 'n/a')}</p>
        <p><strong>Email:</strong> ${escapeHtml(recipient?.emailAddress || 'n/a')}</p>
        <p><strong>Phone:</strong> ${escapeHtml(recipient?.phoneNumber || 'n/a')}</p>
        <p><strong>Pickup:</strong> ${pickupLabel}${pickupNote ? ` — ${escapeHtml(pickupNote)}` : ''}</p>
      </div>
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
        <thead><tr><th style="text-align:left;padding:10px;border-bottom:2px solid #4A3A35;">Item</th><th style="padding:10px;border-bottom:2px solid #4A3A35;">Qty</th><th style="text-align:right;padding:10px;border-bottom:2px solid #4A3A35;">Price</th></tr></thead>
        <tbody>${rows}</tbody>
        <tfoot><tr><td colspan="2" style="text-align:right;padding:10px;font-weight:bold;">Total Paid:</td><td style="text-align:right;padding:10px;font-weight:bold;">$${(totalCents / 100).toFixed(2)}</td></tr></tfoot>
      </table>
      <p style="font-size:12px;color:#888;">Square order id: ${order.id || 'n/a'} &middot; payment id: ${paymentId || 'n/a'}</p>
    </div>
  `;

  await transporter.sendMail({
    from: getSmtpFrom(),
    to: 'info@kingdomtreatzrva.com',
    subject: `New Paid Order - ${recipient?.displayName || 'Website order'}`,
    html,
  });
}

// The intake email for a custom pre-order request — no Square order exists
// yet at this point since the item isn't priced until staff follow up.
export async function sendCustomOrderRequestEmail({
  name,
  email,
  phone,
  neededByDate,
  description,
}: {
  name: string;
  email: string;
  phone: string;
  neededByDate: string;
  description: string;
}): Promise<void> {
  const transporter = getTransporter();
  if (!transporter) {
    console.log('SMTP_PASS not set; skipping custom order request email.');
    return;
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #4A3A35;">
      <h2>New Custom Order Request</h2>
      <div style="background:#FFF9F2;padding:20px;border-radius:4px;margin-bottom:20px;">
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
        <p><strong>Needed by:</strong> ${escapeHtml(neededByDate)}</p>
      </div>
      <p><strong>Details:</strong></p>
      <p style="white-space:pre-wrap;">${escapeHtml(description)}</p>
      <p style="font-size:12px;color:#888;margin-top:20px;">Reply to the customer, then use Admin &rarr; New Invoice to price and send a quote.</p>
    </div>
  `;

  await transporter.sendMail({
    from: getSmtpFrom(),
    to: 'info@kingdomtreatzrva.com',
    replyTo: email,
    subject: `Custom Order Request - ${name}`,
    html,
  });
}
