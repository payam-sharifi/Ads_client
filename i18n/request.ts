import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { unstable_cache } from 'next/cache';
import { routing } from './routing';

const loadMessages = (locale: string) =>
  import(`../messages/${locale}.json`).then((m) => m.default);

const getCachedMessages = (locale: string) => {
  if (process.env.NODE_ENV === 'development') {
    return loadMessages(locale);
  }

  return unstable_cache(
    async () => loadMessages(locale),
    [`messages-${locale}`],
    { revalidate: 3600, tags: [`messages-${locale}`] }
  )();
};

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const messages = await getCachedMessages(locale);

  return {
    locale,
    messages,
    timeZone: 'Europe/Berlin',
    now: new Date(),
  };
});
