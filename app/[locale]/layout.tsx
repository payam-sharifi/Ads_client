import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { QueryProvider } from '@/lib/providers/QueryProvider';
import {
  getOrganizationSchema,
  getWebsiteSchema,
  getWebPageSchema,
} from '@/lib/seo/structuredData';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const titles: Record<string, string> = {
    en: 'JarBezan! - Free Classifieds in Germany',
    de: 'JarBezan! - Kostenlose Anzeigen in Deutschland',
    fa: 'جربزن! - آگهی‌های رایگان در آلمان',
  };
  const descriptions: Record<string, string> = {
    en: 'Buy and sell in Germany. Free classifieds platform for Persian, German and English speakers.',
    de: 'Kaufen und Verkaufen in Deutschland. Kostenlose Anzeigenplattform.',
    fa: 'خرید و فروش در آلمان. پلتفرم رایگان آگهی برای فارسی‌زبانان و آلمانی‌زبانان.',
  };
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://jarbezan.com';
  const url = `${baseUrl}/${locale}`;

  return {
    title: titles[locale] || titles.en,
    description: descriptions[locale] || descriptions.en,
    alternates: {
      canonical: url,
      languages: Object.fromEntries(
        routing.locales.map((loc) => [loc, `${baseUrl}/${loc}`])
      ),
    },
    openGraph: {
      title: titles[locale] || titles.en,
      description: descriptions[locale] || descriptions.en,
      url,
      siteName: 'JarBezan!',
      locale: locale === 'fa' ? 'fa_IR' : locale === 'de' ? 'de_DE' : 'en_US',
      type: 'website',
      images: [{ url: `${baseUrl}/icon-192x192.png`, width: 192, height: 192 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: titles[locale] || titles.en,
      description: descriptions[locale] || descriptions.en,
    },
  };
}
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import BottomNavigation from '@/components/layout/BottomNavigation';
import OfflineBanner from '@/components/common/OfflineBanner';
import DocumentDirectionSync from '@/components/common/DocumentDirectionSync';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();
  const isRTL = locale === 'fa';

  const structuredData = [
    getOrganizationSchema(locale),
    getWebsiteSchema(locale),
    getWebPageSchema({ locale, path: '' }),
  ];

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <DocumentDirectionSync />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      <QueryProvider>
        <OfflineBanner />
        <Navbar />
        <main
          className="flex-grow w-full overflow-x-hidden overflow-y-auto pb-16 md:pb-0"
          style={{
            overflowX: 'hidden',
            overflowY: 'auto',
            width: '100%',
            maxWidth: '100vw',
          }}
        >
          <div
            className="w-full max-w-full px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 overflow-x-hidden"
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            {children}
          </div>
        </main>
        <Footer />
        <BottomNavigation />
        <ToastContainer
          position={isRTL ? 'top-left' : 'top-right'}
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={isRTL}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </QueryProvider>
    </NextIntlClientProvider>
  );
}
