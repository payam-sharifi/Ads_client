'use client';

import React from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/contexts/I18nContext';

export default function Footer() {
  const { t, isRTL } = useI18n();

  return (
    <footer className="hidden md:block bg-white border-t border-gray-200 mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3">{isRTL ? 'درباره ما' : 'Über uns'}</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              {isRTL
                ? 'پلتفرم رایگان برای خرید و فروش در آلمان'
                : 'Kostenlose Plattform zum Kaufen und Verkaufen in Deutschland'}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3">{isRTL ? 'لینک‌های مفید' : 'Nützliche Links'}</h3>
            <ul className="space-y-2 text-xs text-gray-600">
              <li>
                <Link href="/" className="hover:text-red-600 transition-colors">
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-red-600 transition-colors">
                  {t('nav.categories')}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3">{isRTL ? 'پشتیبانی' : 'Support'}</h3>
            <ul className="space-y-2 text-xs text-gray-600">
              <li>
                <Link href="/contact" className="hover:text-red-600 transition-colors">
                  {isRTL ? 'تماس با ما' : 'Kontakt'}
                </Link>
              </li>
              <li>
                <Link href="/help" className="hover:text-red-600 transition-colors">
                  {isRTL ? 'راهنما' : 'Hilfe'}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3">{isRTL ? 'قوانین' : 'Rechtliches'}</h3>
            <ul className="space-y-2 text-xs text-gray-600">
              <li>
                <Link href="/terms" className="hover:text-red-600 transition-colors">
                  {isRTL ? 'شرایط استفاده' : 'Nutzungsbedingungen'}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-red-600 transition-colors">
                  {isRTL ? 'حریم خصوصی' : 'Datenschutz'}
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-200 mt-8 pt-6 text-center">
          <p className="text-xs text-gray-500">© 2024 {isRTL ? 'آگهی‌ها' : 'Anzeigen'}. {isRTL ? 'همه حقوق محفوظ است' : 'Alle Rechte vorbehalten'}</p>
        </div>
      </div>
    </footer>
  );
}
