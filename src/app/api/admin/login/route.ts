import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, recordFailedAttempt, clearFailedAttempts, createAdminSessionToken, ADMIN_COOKIE_NAME, ADMIN_SESSION_MAX_AGE } from '@/lib/adminAuth';

function getClientIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rate = checkRateLimit(ip);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: `Too many attempts. Please try again in ${Math.ceil((rate.retryAfterSeconds || 0) / 60)} minute(s).` },
      { status: 429 }
    );
  }

  const expected = process.env.ADMIN_PASSCODE;
  if (!expected) {
    return NextResponse.json({ error: 'Admin portal is not configured yet. Set ADMIN_PASSCODE.' }, { status: 500 });
  }

  const body = await req.json().catch(() => null);
  const passcode = body?.passcode;

  if (!passcode || passcode !== expected) {
    recordFailedAttempt(ip);
    return NextResponse.json({ error: 'Incorrect passcode.' }, { status: 401 });
  }

  clearFailedAttempts(ip);
  const token = createAdminSessionToken();
  const res = NextResponse.json({ success: true });
  res.cookies.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: ADMIN_SESSION_MAX_AGE,
    path: '/',
  });
  return res;
}
