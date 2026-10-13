import crypto from 'crypto';
import { cookies } from 'next/headers';

export const ADMIN_COOKIE_NAME = 'medicare_admin_session';

// Server-side revoked session token registry so logout immediately destroys the session
const revokedTokens = new Set<string>();

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.trim().length < 12) {
    throw new Error('ADMIN_SESSION_SECRET environment variable is not configured.');
  }
  return secret;
}

/**
 * Constant-time string comparison using SHA-256 digests and crypto.timingSafeEqual
 * so neither string length nor character prefixes leak via timing side-channels.
 */
export function safeConstantTimeEqual(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const hashA = crypto.createHash('sha256').update(a).digest();
  const hashB = crypto.createHash('sha256').update(b).digest();
  const hashesMatch = crypto.timingSafeEqual(hashA, hashB);
  return hashesMatch && a.length === b.length;
}

export function createAdminSessionToken(username: string): string {
  const nonce = crypto.randomBytes(8).toString('hex');
  const payload = `${username}.${Date.now()}.${nonce}`;
  const hmac = crypto.createHmac('sha256', getSecret()).update(payload).digest('hex');
  return `${payload}.${hmac}`;
}

export function revokeAdminToken(token?: string): void {
  if (token) {
    revokedTokens.add(token);
  }
}

export function verifyAdminToken(token?: string): boolean {
  if (!token || typeof token !== 'string') return false;
  if (revokedTokens.has(token)) return false;

  const parts = token.split('.');
  if (parts.length !== 4) return false;
  const [username, timestampStr, nonce, signature] = parts;

  const expectedUser = process.env.ADMIN_USER;
  if (!expectedUser || !safeConstantTimeEqual(username, expectedUser)) {
    return false;
  }

  let expectedSig: string;
  try {
    const payload = `${username}.${timestampStr}.${nonce}`;
    expectedSig = crypto
      .createHmac('sha256', getSecret())
      .update(payload)
      .digest('hex');
  } catch {
    return false;
  }

  if (!safeConstantTimeEqual(signature, expectedSig)) {
    return false;
  }

  // 7-day expiry
  const ts = Number(timestampStr);
  if (isNaN(ts)) return false;
  const ageMs = Date.now() - ts;
  if (ageMs < -60000 || ageMs > 7 * 24 * 60 * 60 * 1000) return false;

  return true;
}

export function isAdminAuthenticated(): boolean {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    return verifyAdminToken(token);
  } catch {
    return false;
  }
}
