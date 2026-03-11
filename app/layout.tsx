import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { getLocale } from 'next-intl/server';
import { isRTL } from '@/lib/utils/locale';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'JarBezan!',
    template: '%s | JarBezan!',
  },
  description: 'Persian, German and English classifieds platform in Germany',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'JarBezan!',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#078C98',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const direction = isRTL(locale as 'fa') ? 'rtl' : 'ltr';

  return (
    <html
      lang={locale}
      dir={direction}
      className="overflow-x-hidden"
      style={{ overflowX: 'hidden', width: '100%', maxWidth: '100vw' }}
    >
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen bg-gray-50 overflow-x-hidden`}
        style={{
          overflowX: 'hidden',
          width: '100%',
          maxWidth: '100vw',
        }}
      >
        {children}
      </body>
    </html>
  );
}
