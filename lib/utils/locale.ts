import { routing } from '@/i18n/routing';

export type Locale = (typeof routing.locales)[number];

export function isRTL(locale: Locale): boolean {
  return locale === 'fa';
}
