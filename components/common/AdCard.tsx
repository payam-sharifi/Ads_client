'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useI18n } from '@/lib/contexts/I18nContext';
import { Ad } from '@/lib/hooks/useAds';
import { getLocalizedName, getLocalizedCategoryName } from '@/lib/utils/localizedNames';
import { getFirstImageUrl } from '@/lib/utils/imageUtils';
import Button from './Button';

interface AdCardProps {
  ad: Ad;
  variant?: 'default' | 'compact' | 'dashboard';
  onEdit?: (adId: string) => void;
  onDelete?: (adId: string) => void;
  showActions?: boolean;
  showStatusBadge?: boolean; // Show status badge only in admin/dashboard panels
  messagesButton?: React.ReactNode; // Messages button component to display inside the card
}

export default function AdCard({ 
  ad, 
  variant = 'default',
  onEdit,
  onDelete,
  showActions = false,
  showStatusBadge = false, // Default: don't show status badge in public pages
  messagesButton
}: AdCardProps) {
  const { t, locale, isRTL } = useI18n();

  const formatPrice = (price: number) => {
    if (price === 0) return isRTL ? 'رایگان' : 'Kostenlos';
    // Format with Persian/Arabic numerals for Persian
    if (locale === 'fa') {
      const formatted = new Intl.NumberFormat('fa-IR').format(price);
      return `${formatted} €`;
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

  const getStatusBadge = () => {
    if (!ad.status) return null;
    
    // Only show badge for specific statuses
    const statusConfig: Record<string, { 
      text: { fa: string; de: string }; 
      bgColor: string; 
      textColor: string;
    }> = {
      APPROVED: {
        text: { fa: 'منتشر شده', de: 'Veröffentlicht' },
        bgColor: 'bg-green-600',
        textColor: 'text-white',
      },
      REJECTED: {
        text: { fa: 'رد شده', de: 'Abgelehnt' },
        bgColor: 'bg-red-600',
        textColor: 'text-white',
      },
      PENDING_APPROVAL: {
        text: { fa: 'در صف انتشار', de: 'Wartet auf Freigabe' },
        bgColor: 'bg-yellow-500',
        textColor: 'text-white',
      },
    };

    const config = statusConfig[ad.status];
    if (!config) return null;

    return (
      <div 
        className={`
          absolute top-2 left-2 ${config.bgColor} ${config.textColor}
          px-2 py-1 text-xs font-bold z-10
          shadow-lg
        `}
        style={{
          transform: 'rotate(-12deg)',
          transformOrigin: 'top left',
        }}
      >
        {config.text[locale] || config.text.de}
      </div>
    );
  };

  const cityName = getLocalizedName(ad.city?.name, locale);
  const categoryName = getLocalizedCategoryName(ad.category?.name, locale);
  const firstImage = getFirstImageUrl(ad.images);

  // Dashboard variant: horizontal layout with edit/delete buttons
  if (variant === 'dashboard') {
    return (
      <div className={`
        flex flex-col bg-white rounded-lg border border-red-200 hover:border-red-300 hover:shadow-md transition-all overflow-hidden
        ${isRTL ? 'flex-row-reverse' : 'flex-row'}
      `}>
        {/* Image - Left (Right in RTL) */}
        <Link href={`/ad/${ad.id}`} className="relative w-24 md:w-32 h-24 md:h-32 flex-shrink-0 overflow-hidden bg-gray-100 cursor-pointer">
          <Image
            src={firstImage}
            alt={ad.title}
            fill
            className="object-cover transition-transform duration-300 hover:scale-105"
            sizes="(max-width: 768px) 128px, 160px"
            loading="lazy"
            unoptimized={firstImage.startsWith('http://localhost') || firstImage.startsWith('http://127.0.0.1')}
            onError={(e) => {
              // Silently fallback to placeholder - image file may not exist on server
              if (e.currentTarget.src !== '/placeholder.svg') {
                e.currentTarget.src = '/placeholder.svg';
              }
            }}
          />
          {/* Status Badge - Diagonal top left (only in admin/dashboard panels) */}
          {showStatusBadge && getStatusBadge()}
          {ad.isPremium && (
            <span className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 px-1.5 py-0.5 rounded text-xs font-bold z-10">
              {t('dashboard.premium')}
            </span>
          )}
        </Link>

        {/* Content - Right (Left in RTL) */}
        <div className="flex flex-col flex-1 p-2 justify-between min-w-0">
          <div className="flex-1">
            <Link href={`/ad/${ad.id}`}>
              <h3 className="font-medium text-[10px] text-gray-900 line-clamp-2 mb-1 hover:text-red-600 transition-colors cursor-pointer">
                {ad.title}
              </h3>
            </Link>

            {/* Category Name */}
            {categoryName && (
              <div className="text-[10px] text-gray-500 mb-1">
                {categoryName}
              </div>
            )}

            {/* Condition Badge */}
            {getConditionText() && (
              <span className="inline-block px-1.5 py-0.5 bg-green-100 text-green-700 text-[10px] font-medium rounded mb-1 w-fit">
                {getConditionText()}
              </span>
            )}

            <div className="text-red-600 font-bold text-xs mb-1">{formatPrice(ad.price)}</div>
            
            <div className="text-[10px] text-gray-500 flex items-center gap-1 flex-wrap">
              {cityName && (
                <>
                  <span>{cityName}</span>
                  <span>•</span>
                </>
              )}
              <span>{formatDate(ad.createdAt)}</span>
            </div>
          </div>

          {/* Action Buttons */}
          {(showActions && (onEdit || onDelete)) || messagesButton ? (
            <div className={`flex gap-2 mt-3 items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
              {/* Messages Button - Left side */}
              {messagesButton && (
                <div className="flex-1">
                  {messagesButton}
                </div>
              )}
              {/* Edit/Delete Buttons - Right side */}
              {showActions && (onEdit || onDelete) && (
                <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  {onEdit && (
                    <Button 
                      size="sm" 
                      variant="secondary" 
                      className="text-xs px-2 py-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(ad.id);
                      }}
                    >
                      {t('common.edit')}
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(ad.id);
                      }}
                      className="text-xs px-2 py-1"
                    >
                      {t('common.delete')}
                    </Button>
                  )}
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    );
  }

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
            ? 'w-20 h-20 md:w-32 md:h-32 min-w-[80px] min-h-[80px]' 
            : 'w-full aspect-[4/3] min-h-[120px]'
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
              // Silently fallback to placeholder - image file may not exist on server
              if (e.currentTarget.src !== '/placeholder.svg') {
                e.currentTarget.src = '/placeholder.svg';
              }
            }}
          />
          {/* Status Badge - Diagonal top left (only in admin/dashboard panels) */}
          {showStatusBadge && getStatusBadge()}
          {ad.isPremium && (
            <span className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 px-1.5 py-0.5 rounded text-xs font-bold z-10">
              {t('dashboard.premium')}
            </span>
          )}
        </div>

        {/* Content - Right (Left in RTL) */}
        <div className={`
          flex flex-col flex-1 p-2
          ${variant === 'compact' ? 'justify-between' : ''}
        `}>
          <div>
            <h3 className={`
              font-medium text-gray-900 group-hover:text-red-600 transition-colors
              ${variant === 'compact' 
                ? 'text-[10px] line-clamp-2 mb-1' 
                : 'text-[10px] line-clamp-2 mb-1 leading-tight min-h-[1.5rem]'
              }
            `}>
              {ad.title}
            </h3>

            {/* Category Name */}
            {categoryName && (
              <div className="text-[10px] text-gray-500 mb-1">
                {categoryName}
              </div>
            )}

            {/* Condition Badge */}
            {getConditionText() && (
              <span className="inline-block px-1.5 py-0.5 bg-green-100 text-green-700 text-[10px] font-medium rounded mb-1 w-fit">
                {getConditionText()}
              </span>
            )}
          </div>

          <div className={variant === 'compact' ? 'mt-auto' : 'mt-auto'}>
            <div className="text-red-600 font-bold text-xs mb-1">{formatPrice(ad.price)}</div>
            <div className="text-[10px] text-gray-500 flex items-center gap-1 flex-wrap">
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
      <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-100">
        <Image
          src={firstImage}
          alt={ad.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 50vw, 25vw"
          loading="lazy"
          unoptimized={firstImage.startsWith('http://localhost') || firstImage.startsWith('http://127.0.0.1')}
          onError={(e) => {
            // Silently fallback to placeholder - image file may not exist on server
            if (e.currentTarget.src !== '/placeholder.svg') {
              e.currentTarget.src = '/placeholder.svg';
            }
          }}
          />
        {/* Status Badge - Diagonal top left (only in admin/dashboard panels) */}
        {showStatusBadge && getStatusBadge()}
        {ad.isPremium && (
          <span className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 px-1.5 py-0.5 rounded text-xs font-bold z-10">
            {t('dashboard.premium')}
          </span>
        )}
      </div>
      <div className="flex flex-col flex-1 p-2">
        <h3 className="font-medium text-[10px] text-gray-900 line-clamp-2 mb-1 group-hover:text-red-600 transition-colors leading-tight min-h-[1.5rem]">
          {ad.title}
        </h3>
        {/* Category Name */}
        {categoryName && (
          <div className="text-[10px] text-gray-500 mb-1">
            {categoryName}
          </div>
        )}
        {getConditionText() && (
          <span className="inline-block px-1.5 py-0.5 bg-green-100 text-green-700 text-[10px] font-medium rounded mb-1 w-fit">
            {getConditionText()}
          </span>
        )}
        <div className="mt-auto">
          <div className="text-red-600 font-bold text-xs mb-1">{formatPrice(ad.price)}</div>
          <div className="text-[10px] text-gray-500 flex items-center gap-1 flex-wrap">
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
