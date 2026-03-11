import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'de', 'fa'],
  defaultLocale: 'fa',
  localePrefix: 'always',
  localeDetection: true,
});
