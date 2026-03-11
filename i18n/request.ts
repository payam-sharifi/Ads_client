import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { unstable_cache } from 'next/cache';
import { routing } from './routing';

const FALLBACK_LOCALE = 'en' as const;

function deepMerge<T extends Record<string, unknown>>(
  target: T,
  source: Record<string, unknown>
): T {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    const srcVal = source[key];
    const tgtVal = result[key];
    if (
      srcVal &&
      typeof srcVal === 'object' &&
      !Array.isArray(srcVal) &&
      tgtVal &&
      typeof tgtVal === 'object' &&
      !Array.isArray(tgtVal)
    ) {
      (result as Record<string, unknown>)[key] = deepMerge(
        tgtVal as Record<string, unknown>,
        srcVal as Record<string, unknown>
      );
    } else if (!(key in result) || result[key] === undefined) {
      (result as Record<string, unknown>)[key] = srcVal;
    }
  }
  return result;
}

const loadMessages = (locale: string) =>
  import(`../messages/${locale}.json`).then((m) => m.default);

const getCachedMessages = (locale: string) =>
  unstable_cache(
    async () => loadMessages(locale),
    [`messages-${locale}`],
    { revalidate: 3600, tags: [`messages-${locale}`] }
  )();

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const [localeMessages, fallbackMessages] = await Promise.all([
    getCachedMessages(locale),
    locale !== FALLBACK_LOCALE ? getCachedMessages(FALLBACK_LOCALE) : null,
  ]);

  const messages =
    fallbackMessages && locale !== FALLBACK_LOCALE
      ? deepMerge(fallbackMessages as Record<string, unknown>, localeMessages as Record<string, unknown>)
      : localeMessages;

  return {
    locale,
    messages,
    timeZone: 'Europe/Berlin',
    now: new Date(),
  };
});
