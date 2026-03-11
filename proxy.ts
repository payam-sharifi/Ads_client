import createMiddleware from 'next-intl/middleware';
import { NextRequest } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

const GEO_TO_LOCALE: Record<string, string> = {
  DE: 'de',
  AT: 'de',
  CH: 'de',
  IR: 'fa',
  AF: 'fa',
  TJ: 'fa',
};

function getGeoLocale(request: NextRequest): string | null {
  const country =
    request.headers.get('x-vercel-ip-country') ||
    request.headers.get('cf-ipcountry');
  return country ? GEO_TO_LOCALE[country.toUpperCase()] ?? null : null;
}

export default function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const hasLocalePrefix = routing.locales.some(
    (loc) => pathname === `/${loc}` || pathname.startsWith(`/${loc}/`)
  );
  const hasLocaleCookie = request.cookies.has('NEXT_LOCALE');

  if (!hasLocalePrefix && !hasLocaleCookie && (pathname === '/' || pathname === '')) {
    const geoLocale = getGeoLocale(request);
    if (geoLocale) {
      const newUrl = new URL(`/${geoLocale}${pathname || ''}${request.nextUrl.search}`, request.url);
      return Response.redirect(newUrl, 302);
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    '/((?!api|_next|_vercel|.*\\..*).*)',
    '/([\\w-]+)?/users/(.+)',
  ],
};
