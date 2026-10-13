/**
 * Security utilities:
 * - In-memory IP rate limiter
 * - Input sanitization (strips HTML/script tags and dangerous protocols)
 * - Pakistani phone number validator (03XX-XXXXXXX, 03XXXXXXXXX, +92 3XX XXXXXXX)
 * - Patient name validator (English, Urdu, Sindhi letters; rejects digits & symbols)
 * - CSRF Origin / Referer verification for state-changing requests
 * - Safe JSON body parser with payload size limit
 */

import type { NextRequest } from 'next/server';

interface RateLimitBucket {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitBucket>();

export function checkRateLimit(
  ip: string,
  limit: number = 5,
  windowMs: number = 60 * 60 * 1000
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const key = ip || 'unknown-ip';
  const existing = rateLimitStore.get(key);

  if (!existing || now > existing.resetAt) {
    const bucket: RateLimitBucket = {
      count: 1,
      resetAt: now + windowMs,
    };
    rateLimitStore.set(key, bucket);
    return { allowed: true, remaining: limit - 1, resetAt: bucket.resetAt };
  }

  if (existing.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  rateLimitStore.set(key, existing);
  return {
    allowed: true,
    remaining: limit - existing.count,
    resetAt: existing.resetAt,
  };
}

export function clearRateLimitBucket(keyPrefix?: string) {
  if (!keyPrefix) {
    rateLimitStore.clear();
    return;
  }
  for (const key of Array.from(rateLimitStore.keys())) {
    if (key.startsWith(keyPrefix)) {
      rateLimitStore.delete(key);
    }
  }
}

export function sanitizeText(input: unknown, maxLength: number = 500): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/<[^>]*>?/gm, '') // strip HTML tags
    .replace(/javascript:/gi, '') // strip javascript: protocol
    .replace(/on\w+\s*=/gi, '') // strip inline event handlers
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, maxLength);
}

/**
 * Validates patient / contact names:
 * Allows letters in any script (English, Urdu, Sindhi), spaces, dots, hyphens, apostrophes, and parentheses.
 * Rejects numbers and special symbols.
 */
export const NAME_REGEX = new RegExp("^[\\p{L}\\p{M}\\s.'()-]{2,120}$", 'u');
const UNICODE_LETTER_REGEX = new RegExp('\\p{L}', 'gu');

export function isValidPersonName(name: string): boolean {
  const trimmed = name.trim();
  if (trimmed.length < 2 || trimmed.length > 120) return false;
  if (!NAME_REGEX.test(trimmed)) return false;
  // Must contain at least two letters
  const letterMatches = trimmed.match(UNICODE_LETTER_REGEX);
  return Boolean(letterMatches && letterMatches.length >= 2);
}

/**
 * Validates Pakistani mobile numbers:
 * Accepts: 03001234567, 0300-1234567, 0300 1234567, +923001234567, +92 300 1234567, +92-300-1234567
 */
export const PAK_PHONE_REGEX = /^(?:\+92[\s-]?|0)3\d{2}[\s-]?\d{7}$/;

export function isValidPakPhone(phone: string): boolean {
  return PAK_PHONE_REGEX.test(phone.trim());
}

export function normalizePakPhone(phone: string): string {
  const cleaned = phone.replace(/[^\d+]/g, '');
  if (cleaned.startsWith('+923') && cleaned.length === 13) {
    return `0${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  if (cleaned.startsWith('923') && cleaned.length === 12) {
    return `0${cleaned.slice(2, 5)}-${cleaned.slice(5)}`;
  }
  if (cleaned.startsWith('03') && cleaned.length === 11) {
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
  }
  return phone.trim();
}

/**
 * Verifies CSRF Origin / Referer header on state-changing requests.
 * Rejects cross-origin requests when an Origin or Referer header is present and does not match Host.
 */
export function verifyCsrfOrigin(req: NextRequest): boolean {
  const origin = req.headers.get('origin');
  const referer = req.headers.get('referer');
  const host = req.headers.get('host') || 'localhost:3000';

  if (origin) {
    try {
      const originUrl = new URL(origin);
      return originUrl.host === host;
    } catch {
      return false;
    }
  }

  if (referer) {
    try {
      const refererUrl = new URL(referer);
      return refererUrl.host === host;
    } catch {
      return false;
    }
  }

  // Allow same-origin requests without Origin header (e.g. local server-to-server / tests without cross-origin header)
  return true;
}

/**
 * Safely parses JSON body with a strict size limit (default 32KB).
 */
export async function parseJsonBodySafely<T = any>(
  req: NextRequest,
  maxBytes: number = 32 * 1024
): Promise<{ ok: true; data: T } | { ok: false; status: number; error: string }> {
  const contentLength = Number(req.headers.get('content-length') || '0');
  if (contentLength > maxBytes) {
    return {
      ok: false,
      status: 413,
      error: 'Request payload is too large.',
    };
  }

  try {
    const rawText = await req.text();
    if (rawText.length > maxBytes) {
      return {
        ok: false,
        status: 413,
        error: 'Request payload is too large.',
      };
    }
    if (!rawText.trim()) {
      return {
        ok: false,
        status: 400,
        error: 'Request body cannot be empty.',
      };
    }
    const parsed = JSON.parse(rawText) as T;
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return {
        ok: false,
        status: 400,
        error: 'Request body must be a JSON object.',
      };
    }
    return { ok: true, data: parsed };
  } catch {
    return {
      ok: false,
      status: 400,
      error: 'Invalid JSON format in request body.',
    };
  }
}
