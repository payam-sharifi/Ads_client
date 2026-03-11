import { routing } from '@/i18n/routing';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://jarbezan.com';

export interface StructuredDataParams {
  locale: string;
  title?: string;
  description?: string;
  path?: string;
}

export function getOrganizationSchema(locale: string) {
  const names: Record<string, string> = {
    en: 'JarBezan!',
    de: 'JarBezan!',
    fa: 'جربزن!',
  };
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: names[locale] || names.en,
    url: BASE_URL,
    logo: `${BASE_URL}/icon-192x192.png`,
    description:
      locale === 'fa'
        ? 'پلتفرم رایگان آگهی و خرید و فروش در آلمان'
        : locale === 'de'
          ? 'Kostenlose Anzeigenplattform in Deutschland'
          : 'Free classifieds platform in Germany',
  };
}

export function getWebsiteSchema(locale: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'JarBezan!',
    url: BASE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/${locale}/?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function getWebPageSchema({ locale, title, description, path }: StructuredDataParams) {
  const url = `${BASE_URL}/${locale}${path || ''}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    url,
    name: title || 'JarBezan!',
    description:
      description ||
      (locale === 'fa'
        ? 'پلتفرم رایگان آگهی و خرید و فروش در آلمان'
        : locale === 'de'
          ? 'Kostenlose Anzeigenplattform in Deutschland'
          : 'Free classifieds platform in Germany'),
    inLanguage: locale === 'fa' ? 'fa' : locale === 'de' ? 'de' : 'en',
    isPartOf: {
      '@type': 'WebSite',
      url: BASE_URL,
    },
  };
}
