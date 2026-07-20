import nodemailer from 'nodemailer';
import { catalog } from './catalog';
import type { CartLine } from './squareOrders';

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
  const smtpPass = process.env.SMTP_PASS;
  if (!smtpPass) {
    console.log('SMTP_PASS not set; skipping order notification email.');
    return;
  }

  const smtpUser = process.env.SMTP_USER || 'no-reply@kingdomtreatzrva.com';
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.hostinger.com',
    port: Number(process.env.SMTP_PORT || 465),
    secure: true,
    auth: { user: smtpUser, pass: smtpPass },
  });

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
    from: smtpUser,
    to: 'info@kingdomtreatzrva.com',
    subject: `New Paid Order - ${customer.name}`,
    html,
  });
}
