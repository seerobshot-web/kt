import jwt from 'jsonwebtoken';

export const ADMIN_COOKIE_NAME = 'admin_session';
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 12; // 12 hours

function getSessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error('ADMIN_SESSION_SECRET is not configured');
  return secret;
}

export function createAdminSessionToken(): string {
  return jwt.sign({ role: 'admin' }, getSessionSecret(), { expiresIn: ADMIN_SESSION_MAX_AGE });
}

export function verifyAdminSessionToken(token: string): boolean {
  try {
    const payload = jwt.verify(token, getSessionSecret()) as { role?: string };
    return payload?.role === 'admin';
  } catch {
    return false;
  }
}

// In-memory brute-force protection, per Node process. Good enough for a
// single-instance MVP deployment; resets on restart.
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;
const attempts = new Map<string, { count: number; lockedUntil: number | null }>();

export function checkRateLimit(ip: string): { allowed: boolean; retryAfterSeconds?: number } {
  const record = attempts.get(ip);
  if (record?.lockedUntil && record.lockedUntil > Date.now()) {
    return { allowed: false, retryAfterSeconds: Math.ceil((record.lockedUntil - Date.now()) / 1000) };
  }
  return { allowed: true };
}

export function recordFailedAttempt(ip: string): void {
  const record = attempts.get(ip) ?? { count: 0, lockedUntil: null };
  record.count += 1;
  if (record.count >= MAX_ATTEMPTS) {
    record.lockedUntil = Date.now() + LOCKOUT_MS;
  }
  attempts.set(ip, record);
}

export function clearFailedAttempts(ip: string): void {
  attempts.delete(ip);
}
