import { NextResponse } from 'next/server';
import { z } from 'zod';
import nodemailer from 'nodemailer';
import { randomUUID } from 'crypto';
import { catalog, computeSubtotalCents } from '@/lib/catalog';

const checkoutSchema = z.object({
  customer: z.object({
    name: z.string().min(2, 'Name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(10, 'Valid phone number required'),
    pickupDate: z.string().min(1, 'Pickup date is required'),
  }),
  items: z.array(z.object({
    id: z.string(),
    quantity: z.number().int().min(1),
  })).min(1, 'Cart cannot be empty'),
  paymentType: z.enum(['full', 'deposit']),
  sourceId: z.string().min(1, 'Missing payment token'),
});

function squareApiBase(): string {
  const env = (process.env.SQUARE_ENVIRONMENT || process.env.NEXT_PUBLIC_SQUARE_ENVIRONMENT || 'production').toLowerCase();
  return env === 'production' ? 'https://connect.squareup.com' : 'https://connect.squareupsandbox.com';
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = checkoutSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ success: false, error: 'Validation failed', details: result.error.flatten() }, { status: 422 });
    }

    const { customer, items, paymentType, sourceId } = result.data;

    let subtotalCents: number;
    try {
      subtotalCents = computeSubtotalCents(items);
    } catch {
      return NextResponse.json({ success: false, error: 'Your cart contains an item that is no longer on the menu. Please rebuild your cart.' }, { status: 422 });
    }

    const chargeCents = paymentType === 'deposit' ? Math.round(subtotalCents / 2) : subtotalCents;

    const accessToken = process.env.SQUARE_ACCESS_TOKEN;
    const locationId = process.env.SQUARE_LOCATION_ID || process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID || process.env.NEXT_PUBLIC_SQUARE_LOCATION;

    if (!accessToken || !locationId) {
      console.error('Checkout misconfigured: SQUARE_ACCESS_TOKEN and/or location id missing');
      return NextResponse.json({ success: false, error: 'Payment is not configured. Please contact us to complete your order.' }, { status: 500 });
    }

    const paymentResponse = await fetch(`${squareApiBase()}/v2/payments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        idempotency_key: randomUUID(),
        source_id: sourceId,
        location_id: locationId,
        amount_money: { amount: chargeCents, currency: 'USD' },
        buyer_email_address: customer.email,
        note: `Kingdom Treatz order — ${customer.name} — pickup ${customer.pickupDate}${paymentType === 'deposit' ? ' (50% deposit)' : ''}`.slice(0, 500),
      }),
    });

    const paymentResult = await paymentResponse.json();

    if (!paymentResponse.ok || paymentResult?.payment?.status === 'FAILED') {
      const detail = paymentResult?.errors?.map((e: { detail?: string; code?: string }) => e.detail || e.code).filter(Boolean).join(', ');
      console.error('Square payment failed:', paymentResult?.errors || paymentResult);
      return NextResponse.json({ success: false, error: detail || 'Your card could not be charged. Please check your details and try again.' }, { status: 402 });
    }

    const paymentId = paymentResult?.payment?.id;

    // Payment succeeded — the order notification email is best-effort and must
    // never fail the request after the customer has been charged.
    try {
      await sendOrderEmail({ customer, items, paymentType, subtotalCents, chargeCents, paymentId });
    } catch (emailError) {
      console.error('Order email failed (payment succeeded):', emailError);
    }

    return NextResponse.json({ success: true, paymentId }, { status: 200 });

  } catch (error) {
    console.error('Checkout API Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to process your order. Please try again.' }, { status: 500 });
  }
}

async function sendOrderEmail(order: {
  customer: { name: string; email: string; phone: string; pickupDate: string };
  items: { id: string; quantity: number }[];
  paymentType: 'full' | 'deposit';
  subtotalCents: number;
  chargeCents: number;
  paymentId?: string;
}) {
  if (!process.env.SMTP_PASS) {
    console.log('SMTP_PASS not set; skipping order notification email.');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.hostinger.com',
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: process.env.SMTP_PORT === '465' || !process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER || 'no-reply@kingdomtreatzrva.com',
      pass: process.env.SMTP_PASS,
    },
  });

  const itemsHtml = order.items.map(item => {
    const catalogItem = catalog.find(c => c.id === item.id);
    const name = catalogItem?.name ?? `Item ${item.id}`;
    const lineCents = (catalogItem?.priceCents ?? 0) * item.quantity;
    return `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${(lineCents / 100).toFixed(2)}</td>
      </tr>
    `;
  }).join('');

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #4A3A35;">
      <h2 style="color: #4A3A35;">New Paid Order</h2>
      <p>A new order has been placed and paid on the website.</p>

      <div style="background: #FFF9F2; padding: 20px; border-radius: 4px; margin-bottom: 20px;">
        <h3 style="margin-top: 0; color: #C24135;">Customer Details</h3>
        <p style="margin: 5px 0;"><strong>Name:</strong> ${order.customer.name}</p>
        <p style="margin: 5px 0;"><strong>Email:</strong> ${order.customer.email}</p>
        <p style="margin: 5px 0;"><strong>Phone:</strong> ${order.customer.phone}</p>
        <p style="margin: 5px 0;"><strong>Pickup Date:</strong> ${order.customer.pickupDate}</p>
      </div>

      <h3 style="color: #4A3A35;">Order Summary</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr>
            <th style="text-align: left; padding: 10px; border-bottom: 2px solid #4A3A35;">Item</th>
            <th style="padding: 10px; border-bottom: 2px solid #4A3A35;">Qty</th>
            <th style="text-align: right; padding: 10px; border-bottom: 2px solid #4A3A35;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="text-align: right; padding: 10px; font-weight: bold;">Subtotal:</td>
            <td style="text-align: right; padding: 10px; font-weight: bold;">$${(order.subtotalCents / 100).toFixed(2)}</td>
          </tr>
          <tr>
            <td colspan="2" style="text-align: right; padding: 10px; font-weight: bold;">Paid${order.paymentType === 'deposit' ? ' (50% deposit)' : ''}:</td>
            <td style="text-align: right; padding: 10px; font-weight: bold;">$${(order.chargeCents / 100).toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>

      <p style="font-size: 12px; color: #888;">Square payment id: ${order.paymentId ?? 'n/a'}${order.paymentType === 'deposit' ? '. Remaining balance is due at pickup.' : ''}</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Kingdom Treatz System" <${process.env.SMTP_USER || 'no-reply@kingdomtreatzrva.com'}>`,
    to: 'info@kingdomtreatzrva.com',
    subject: `New Paid Order - ${order.customer.name}`,
    html: htmlContent,
  });
}
