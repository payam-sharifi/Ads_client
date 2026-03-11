import { MetadataRoute } from 'next';
import { getPathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://jarbezan.com';

const staticPaths = [
  '',
  '/categories',
  '/contact',
  '/create-ad',
  '/dashboard',
  '/dashboard/bookmarked',
  '/help',
  '/login',
  '/signup',
  '/privacy',
  '/terms',
  '/forgot-password',
  '/verify-email',
  '/messages',
  '/profile',
  '/admin',
  '/admin/ads',
  '/admin/users',
  '/admin/messages',
  '/admin/reports',
  '/admin/categories',
  '/admin/cities',
  '/admin/admins',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const path of staticPaths) {
    const defaultLocale = routing.defaultLocale;
    const defaultUrl = `${BASE_URL}${getPathname({ locale: defaultLocale, href: path || '/' })}`;
    entries.push({
      url: defaultUrl,
      lastModified: new Date(),
      changeFrequency: path === '' ? 'daily' : 'weekly',
      priority: path === '' ? 1 : 0.8,
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((loc) => [
            loc,
            `${BASE_URL}${getPathname({ locale: loc, href: path || '/' })}`,
          ])
        ),
      },
    });
  }

  return entries;
}
