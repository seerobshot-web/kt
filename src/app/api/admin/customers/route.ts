import { NextRequest, NextResponse } from 'next/server';
import { getSquareClient } from '@/lib/square';
import { serializeBigInt } from '@/lib/serialize';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')?.trim().toLowerCase() || '';
  try {
    const client = getSquareClient();
    const result = await client.customers.list({ limit: 100 });
    const all = result.data ?? [];
    const filtered = q
      ? all.filter((c) => {
          const haystack = `${c.givenName || ''} ${c.familyName || ''} ${c.emailAddress || ''} ${c.phoneNumber || ''}`.toLowerCase();
          return haystack.includes(q);
        })
      : all;
    return NextResponse.json(serializeBigInt({ customers: filtered }));
  } catch (err: any) {
    console.error('Admin customers list error:', err);
    return NextResponse.json({ error: err?.message || 'Failed to load customers.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const name = body?.name?.trim();
  const email = body?.email?.trim();
  const phone = body?.phone?.trim();
  if (!name || !email) {
    return NextResponse.json({ error: 'Name and email are required.' }, { status: 422 });
  }

  try {
    const client = getSquareClient();
    const [givenName, ...rest] = name.split(/\s+/);
    const result = await client.customers.create({
      givenName,
      familyName: rest.join(' ') || undefined,
      emailAddress: email,
      phoneNumber: phone || undefined,
    });
    return NextResponse.json(serializeBigInt({ customer: result.customer }));
  } catch (err: any) {
    console.error('Admin customer create error:', err);
    return NextResponse.json({ error: err?.message || 'Failed to create customer.' }, { status: 500 });
  }
}
