'use client';

import { useTranslations, useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import type { Locale } from '@/lib/utils/locale';
import { isRTL } from '@/lib/utils/locale';

/**
 * Compatibility hook that mirrors the old useI18n interface.
 * Uses next-intl under the hood for locale-based routing.
 */
export function useI18n() {
  const locale = useLocale() as Locale;
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();

  const setLocale = (newLocale: Locale) => {
    router.replace(pathname, { locale: newLocale });
  };

  const tKey = (key: string): string => {
    try {
      return t(key as any);
    } catch {
      return key;
    }
  };

  return {
    locale,
    setLocale,
    t: tKey,
    isRTL: isRTL(locale),
  };
}
