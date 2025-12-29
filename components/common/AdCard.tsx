'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useI18n } from '@/lib/contexts/I18nContext';
import { Ad } from '@/lib/hooks/useAds';
import { getLocalizedName } from '@/lib/utils/localizedNames';
import { getFirstImageUrl } from '@/lib/utils/imageUtils';

interface AdCardProps {
  ad: Ad;
  variant?: 'default' | 'compact';
}

export default function AdCard({ ad, variant = 'default' }: AdCardProps) {
  const { t, locale, isRTL } = useI18n();

  const formatPrice = (price: number) => {
    if (price === 0) return isRTL ? 'رایگان' : 'Kostenlos';
    // Format with Persian/Arabic numerals for Persian
    if (locale === 'fa') {
      const formatted = new Intl.NumberFormat('fa-IR').format(price);
      return `${formatted} ${isRTL ? 'تومان' : 'EUR'}`;
    }
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffMinutes = Math.ceil(diffTime / (1000 * 60));
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return isRTL ? 'لحظاتی پیش' : 'Gerade eben';
    if (diffMinutes < 60) return isRTL ? `${diffMinutes} دقیقه پیش` : `vor ${diffMinutes} Min`;
    if (diffHours < 24) return isRTL ? `${diffHours} ساعت پیش` : `vor ${diffHours} Std`;
    if (diffDays === 1) return isRTL ? 'دیروز' : 'Gestern';
    if (diffDays < 7) return isRTL ? `${diffDays} روز پیش` : `vor ${diffDays} Tagen`;
    return date.toLocaleDateString(locale === 'fa' ? 'fa-IR' : 'de-DE', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getConditionText = () => {
    if (!ad.condition) return null;
    const conditions: Record<string, { fa: string; de: string }> = {
      NEW: { fa: 'نو', de: 'Neu' },
      LIKE_NEW: { fa: 'در حد نو', de: 'Wie neu' },
      USED: { fa: 'کارکرده', de: 'Gebraucht' },
    };
    return conditions[ad.condition]?.[locale] || null;
  };

  const cityName = getLocalizedName(ad.city?.name, locale);
  const firstImage = getFirstImageUrl(ad.images);

  // Mobile: horizontal layout (image left, content right)
  // Desktop: horizontal layout (image left, content right)
  if (variant === 'compact' || variant === 'default') {
    return (
      <Link
        href={`/ad/${ad.id}`}
        className={`
          flex bg-white rounded-lg border border-gray-200 hover:border-red-300 hover:shadow-md transition-all overflow-hidden group
          ${variant === 'compact' 
            ? `flex-row ${isRTL ? 'flex-row-reverse' : ''} border-b border-gray-200 md:border-b-0 rounded-none md:rounded-lg` 
            : 'flex-col md:flex-col'
          }
        `}
      >
        {/* Image - Left (Right in RTL) */}
        <div className={`
          relative overflow-hidden bg-gray-100 flex-shrink-0
          ${variant === 'compact' 
            ? 'w-32 h-32 md:w-40 md:h-40' 
            : 'w-full aspect-square'
          }
        `}>
          <Image
            src={firstImage}
            alt={ad.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes={variant === 'compact' ? "(max-width: 768px) 128px, 25vw" : "(max-width: 768px) 50vw, 25vw"}
            loading="lazy"
            unoptimized={firstImage.startsWith('http://localhost') || firstImage.startsWith('http://127.0.0.1')}
            onError={(e) => {
              console.error('Image load error:', firstImage);
              if (e.currentTarget.src !== '/placeholder.svg') {
                e.currentTarget.src = '/placeholder.svg';
              }
            }}
          />
          {ad.isPremium && (
            <span className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 px-1.5 py-0.5 rounded text-xs font-bold">
              {t('dashboard.premium')}
            </span>
          )}
        </div>

        {/* Content - Right (Left in RTL) */}
        <div className={`
          flex flex-col flex-1 p-3
          ${variant === 'compact' ? 'justify-between' : ''}
        `}>
          <div>
            <h3 className={`
              font-medium text-gray-900 group-hover:text-red-600 transition-colors
              ${variant === 'compact' 
                ? 'text-sm line-clamp-2 mb-1' 
                : 'text-sm line-clamp-2 mb-2 leading-snug min-h-[2.5rem]'
              }
            `}>
              {ad.title}
            </h3>

            {/* Condition Badge */}
            {getConditionText() && (
              <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded mb-2 w-fit">
                {getConditionText()}
              </span>
            )}
          </div>

          <div className={variant === 'compact' ? 'mt-auto' : 'mt-auto'}>
            <div className="text-red-600 font-bold text-base mb-2">{formatPrice(ad.price)}</div>
            <div className="text-xs text-gray-500 flex items-center gap-1.5 flex-wrap">
              {cityName && (
                <>
                  <span>{cityName}</span>
                  <span>•</span>
                </>
              )}
              <span>{formatDate(ad.createdAt)}</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Default vertical layout (fallback)
  return (
    <Link
      href={`/ad/${ad.id}`}
      className="flex flex-col bg-white rounded-lg border border-gray-200 hover:border-red-300 hover:shadow-md transition-all overflow-hidden group"
    >
      <div className="relative w-full aspect-square overflow-hidden bg-gray-100">
        <Image
          src={firstImage}
          alt={ad.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 50vw, 25vw"
          loading="lazy"
          unoptimized={firstImage.startsWith('http://localhost') || firstImage.startsWith('http://127.0.0.1')}
          onError={(e) => {
            console.error('Image load error:', firstImage);
            if (e.currentTarget.src !== '/placeholder.svg') {
              e.currentTarget.src = '/placeholder.svg';
            }
          }}
        />
        {ad.isPremium && (
          <span className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 px-1.5 py-0.5 rounded text-xs font-bold">
            {t('dashboard.premium')}
          </span>
        )}
      </div>
      <div className="flex flex-col flex-1 p-3">
        <h3 className="font-medium text-sm text-gray-900 line-clamp-2 mb-2 group-hover:text-red-600 transition-colors leading-snug min-h-[2.5rem]">
          {ad.title}
        </h3>
        {getConditionText() && (
          <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded mb-2 w-fit">
            {getConditionText()}
          </span>
        )}
        <div className="mt-auto">
          <div className="text-red-600 font-bold text-base mb-2">{formatPrice(ad.price)}</div>
          <div className="text-xs text-gray-500 flex items-center gap-1.5 flex-wrap">
            {cityName && (
              <>
                <span>{cityName}</span>
                <span>•</span>
              </>
            )}
            <span>{formatDate(ad.createdAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
