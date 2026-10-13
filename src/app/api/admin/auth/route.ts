import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  ADMIN_COOKIE_NAME,
  createAdminSessionToken,
  revokeAdminToken,
  safeConstantTimeEqual,
} from '@/lib/adminAuth';
import {
  checkRateLimit,
  parseJsonBodySafely,
  verifyCsrfOrigin,
} from '@/lib/security';

export async function POST(req: NextRequest) {
  if (!verifyCsrfOrigin(req)) {
    return NextResponse.json(
      { error: 'Forbidden cross-origin request.' },
      { status: 403 }
    );
  }

  // Brute-force lockout: max 5 login attempts per IP per 15 minutes (Section H.2)
  const forwardedFor = req.headers.get('x-forwarded-for');
  const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';
  const rate = checkRateLimit(`admin_login_${ip}`, 5, 15 * 60 * 1000);

  if (!rate.allowed) {
    return NextResponse.json(
      {
        error:
          'Too many failed login attempts. Account locked for 15 minutes.',
        code: 'RATE_LIMITED',
      },
      { status: 429 }
    );
  }

  const expectedUser = process.env.ADMIN_USER;
  const expectedPass = process.env.ADMIN_PASSWORD;

  if (!expectedUser || !expectedPass) {
    return NextResponse.json(
      { error: 'Admin credentials are not configured on the server.' },
      { status: 500 }
    );
  }

  const bodyResult = await parseJsonBodySafely<{
    username?: unknown;
    password?: unknown;
  }>(req, 4096);

  if (!bodyResult.ok) {
    return NextResponse.json(
      { error: bodyResult.error },
      { status: bodyResult.status }
    );
  }

  const { username, password } = bodyResult.data;
  if (typeof username !== 'string' || typeof password !== 'string') {
    return NextResponse.json(
      { error: 'Username and password are required.' },
      { status: 400 }
    );
  }

  const userOk = safeConstantTimeEqual(username, expectedUser);
  const passOk = safeConstantTimeEqual(password, expectedPass);

  if (!userOk || !passOk) {
    return NextResponse.json(
      { error: 'Invalid admin username or password.' },
      { status: 401 }
    );
  }

  const token = createAdminSessionToken(username);
  const res = NextResponse.json({ success: true });
  res.cookies.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'strict',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60,
  });
  return res;
}

export async function DELETE(req: NextRequest) {
  if (!verifyCsrfOrigin(req)) {
    return NextResponse.json(
      { error: 'Forbidden cross-origin request.' },
      { status: 403 }
    );
  }

  try {
    const cookieStore = cookies();
    const existingToken = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    if (existingToken) {
      revokeAdminToken(existingToken);
    }
  } catch {
    // ignore
  }

  const res = NextResponse.json({ success: true });
  res.cookies.set(ADMIN_COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'strict',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0,
  });
  return res;
}
