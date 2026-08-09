import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sendCustomOrderRequestEmail } from '@/lib/mailer';

const CustomOrderRequestSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  neededByDate: z.string().min(1),
  description: z.string().min(10).max(2000),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = CustomOrderRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Please check your details and try again.' }, { status: 422 });
  }

  try {
    await sendCustomOrderRequestEmail(parsed.data);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Custom order request error:', err);
    return NextResponse.json({ success: false, error: 'Could not send your request. Please email us directly at info@kingdomtreatzrva.com.' }, { status: 500 });
  }
}
