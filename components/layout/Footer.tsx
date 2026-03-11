'use client';

import React from 'react';
import { Link } from '@/i18n/navigation';
import { useI18n } from '@/lib/contexts/I18nContext';

export default function Footer() {
  const { t, isRTL } = useI18n();

  return (
    <footer className="hidden md:block bg-white border-t border-gray-200 mt-12">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3">{t('footer.aboutUs')}</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              {t('footer.aboutDescription')}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3">{t('footer.usefulLinks')}</h3>
            <ul className="space-y-2 text-xs text-gray-600">
              <li>
                <Link href="/" className="hover:text-primary-600 transition-colors">
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-primary-600 transition-colors">
                  {t('nav.categories')}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3">{t('footer.support')}</h3>
            <ul className="space-y-2 text-xs text-gray-600">
              <li>
                <Link href="/contact" className="hover:text-primary-600 transition-colors">
                  {t('footer.contact')}
                </Link>
              </li>
              <li>
                <Link href="/help" className="hover:text-primary-600 transition-colors">
                  {t('footer.help')}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3">{t('footer.legal')}</h3>
            <ul className="space-y-2 text-xs text-gray-600">
              <li>
                <Link href="/terms" className="hover:text-primary-600 transition-colors">
                  {t('footer.terms')}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-primary-600 transition-colors">
                  {t('footer.privacy')}
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-200 mt-8 pt-6 text-center">
          <p className="text-xs text-gray-500">© 2024 JarBezan!. {t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  );
}
