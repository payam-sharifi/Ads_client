'use client';

import React from 'react';
import { useRouter } from '@/i18n/navigation';
import { useI18n } from '@/lib/contexts/I18nContext';

interface BackButtonProps {
  className?: string;
  variant?: 'default' | 'icon-only';
}

export default function BackButton({ className = '', variant = 'default' }: BackButtonProps) {
  const router = useRouter();
  const { isRTL } = useI18n();

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  // Always use left-pointing arrow (←) regardless of locale - consistent navigation direction in mobile
  const arrowPath = 'M15 19l-7-7 7-7';

  if (variant === 'icon-only') {
    return (
      <button
        onClick={handleBack}
        className={`flex items-center justify-center w-10 h-10 rounded-full text-gray-600 hover:text-primary-600 hover:bg-gray-100 transition-colors ${className}`}
        aria-label={isRTL ? 'بازگشت' : 'Zurück'}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d={arrowPath} />
        </svg>
      </button>
    );
  }

  return (
    <button
      onClick={handleBack}
      className={`flex items-center gap-2 text-gray-700 hover:text-primary-600 transition-colors ${className}`}
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={arrowPath} />
      </svg>
      <span className="text-sm font-medium">{isRTL ? 'بازگشت' : 'Zurück'}</span>
    </button>
  );
}

