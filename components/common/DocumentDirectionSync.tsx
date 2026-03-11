'use client';

import { useEffect } from 'react';
import { useLocale } from 'next-intl';
import { isRTL } from '@/lib/utils/locale';
import type { Locale } from '@/lib/utils/locale';

/**
 * Syncs document.documentElement.dir and lang with the current locale.
 * Required because the root layout's html dir/lang are set at server render time
 * and don't update during client-side language switching.
 */
export default function DocumentDirectionSync() {
  const locale = useLocale() as Locale;

  useEffect(() => {
    const dir = isRTL(locale) ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}
