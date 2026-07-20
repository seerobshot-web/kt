import { NextResponse } from 'next/server';

// Reaching this route at all means the proxy already validated the admin
// session cookie, so there is nothing left to check here.
export async function GET() {
  return NextResponse.json({ authenticated: true });
}
