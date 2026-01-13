import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/lib/contexts/I18nContext";
import { QueryProvider } from "@/lib/providers/QueryProvider";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BottomNavigation from "@/components/layout/BottomNavigation";
import OfflineBanner from "@/components/common/OfflineBanner";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Classified Ads - آگهی‌ها",
  description: "Persian and German classified ads platform in Germany",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Classified Ads",
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
  themeColor: '#3b82f6',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" className="overflow-x-hidden" style={{ overflowX: 'hidden', width: '100%', maxWidth: '100vw' }}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen bg-gray-50 overflow-x-hidden`}
        style={{ overflowX: 'hidden', width: '100%', maxWidth: '100vw' }}
      >
        <OfflineBanner />
        <QueryProvider>
          <I18nProvider>
            <Navbar />
            <main className="flex-grow w-full overflow-x-hidden overflow-y-auto pb-16 md:pb-0" style={{ overflowX: 'hidden', overflowY: 'auto', width: '100%', maxWidth: '100vw' }}>
              <div className="w-full max-w-full px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 overflow-x-hidden">
                {children}
              </div>
            </main>
            <Footer />
            <BottomNavigation />
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
          </I18nProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
