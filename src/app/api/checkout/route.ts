import { NextResponse } from 'next/server';
import { z } from 'zod';
import nodemailer from 'nodemailer';

const checkoutSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Valid phone number required"),
  pickupDate: z.string().min(1, "Pickup date is required"),
  items: z.array(z.object({
    id: z.string(),
    name: z.string(),
    quantity: z.number().min(1),
    price: z.number()
  })).min(1, "Cart cannot be empty"),
  subtotal: z.number()
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = checkoutSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Validation failed', details: result.error.flatten() }, { status: 422 });
    }

    const data = result.data;

    // Configure Nodemailer transporter using SMTP
    // We fall back to standard Hostinger settings for safety if env vars aren't loaded
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.hostinger.com',
      port: parseInt(process.env.SMTP_PORT || '465'),
      secure: process.env.SMTP_PORT === '465' || !process.env.SMTP_PORT, // 465 is secure
      auth: {
        user: process.env.SMTP_USER || 'info@kingdomtreatzrva.com',
        pass: process.env.SMTP_PASS || 'placeholder_password',
      },
    });

    // Build the HTML template
    const itemsHtml = data.items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join('');

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-w: 600px; margin: 0 auto; color: #4A3A35;">
        <h2 style="color: #4A3A35;">New Website Order</h2>
        <p>A new order has been submitted from the website.</p>
        
        <div style="background: #FFF9F2; padding: 20px; border-radius: 4px; margin-bottom: 20px;">
          <h3 style="margin-top: 0; color: #C24135;">Customer Details</h3>
          <p style="margin: 5px 0;"><strong>Name:</strong> ${data.name}</p>
          <p style="margin: 5px 0;"><strong>Email:</strong> ${data.email}</p>
          <p style="margin: 5px 0;"><strong>Phone:</strong> ${data.phone}</p>
          <p style="margin: 5px 0;"><strong>Pickup Date:</strong> ${data.pickupDate}</p>
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
              <td style="text-align: right; padding: 10px; font-weight: bold;">$${data.subtotal.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
        
        <p style="font-size: 12px; color: #888;">* Note: Confirm pickup details with the customer before preparing the order.</p>
      </div>
    `;

    // For Dev mode: If we don't have a real password, we'll log it instead of crashing.
    if (!process.env.SMTP_PASS) {
      console.log('--- DEV MODE: SMTP PASS missing. Email caught before sending. ---');
      console.log(htmlContent);
      return NextResponse.json({ success: true, messageId: 'dev_mock_id' }, { status: 200 });
    }

    // Send mail with defined transport object
    const info = await transporter.sendMail({
      from: `"Kingdom Treatz System" <${process.env.SMTP_USER}>`, 
      to: "info@kingdomtreatzrva.com", 
      subject: `New Website Order - ${data.name}`, 
      html: htmlContent, 
    });

    return NextResponse.json({ success: true, messageId: info.messageId }, { status: 200 });

  } catch (error) {
    console.error('Checkout API Error:', error);
    return NextResponse.json({ error: 'Failed to dispatch order email' }, { status: 500 });
  }
}
