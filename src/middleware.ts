import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { locales, defaultLocale } from './i18n/routing';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
});

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Redirect /en/admin, /ur/admin, /sd/admin to /admin
  if (/^\/(en|ur|sd)\/admin(\/.*)?$/.test(pathname)) {
    const cleanPath = pathname.replace(/^\/(en|ur|sd)/, '');
    return NextResponse.redirect(new URL(cleanPath, req.url));
  }

  // Skip middleware for /admin, /api, static files
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
