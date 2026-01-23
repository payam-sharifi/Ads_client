'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useI18n } from '@/lib/contexts/I18nContext';
import { Ad } from '@/lib/hooks/useAds';
import { getLocalizedName, getLocalizedCategoryName } from '@/lib/utils/localizedNames';
import { getFirstImageUrl, getImageUrl } from '@/lib/utils/imageUtils';
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

  const getRealEstateOfferTypeText = () => {
    if (ad.category?.categoryType !== 'real_estate' || !ad.metadata?.offerType) return null;
    
    const offerTypes: Record<string, { fa: string; de: string }> = {
      rent: { fa: 'اجاره', de: 'Miete' },
      sale: { fa: 'فروش', de: 'Verkauf' },
    };
    
    return offerTypes[ad.metadata.offerType]?.[locale] || null;
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

  const cityName = getLocalizedName(ad.city?.name, locale) || (isRTL ? 'همه شهرها' : 'Alle Städte');
  const categoryName = getLocalizedCategoryName(ad.category?.name, locale);
  const firstImage = getFirstImageUrl(ad.images);
  
  // Image carousel state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const images = ad.images && ad.images.length > 0 
    ? [...ad.images].sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
    : [];
  const currentImage = images[currentImageIndex] 
    ? getImageUrl(images[currentImageIndex].url) 
    : firstImage;
  
  const handlePrevImage = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  }, [images.length]);
  
  const handleNextImage = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  }, [images.length]);
  
  const handleImageContainerClick = useCallback((e: React.MouseEvent) => {
    // Prevent navigation when clicking on navigation buttons or image container
    if ((e.target as HTMLElement).closest('button')) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, []);
  
  const handleImageTouchStart = useCallback((e: React.TouchEvent) => {
    e.stopPropagation();
    const touch = e.touches[0];
    if (touch) {
    (e.currentTarget as HTMLElement).setAttribute('data-touch-x', touch.clientX.toString());
      (e.currentTarget as HTMLElement).setAttribute('data-touch-y', touch.clientY.toString());
    }
  }, []);
  
  const handleImageTouchEnd = useCallback((e: React.TouchEvent) => {
    e.stopPropagation();
    const element = e.currentTarget as HTMLElement;
    const startX = parseFloat(element.getAttribute('data-touch-x') || '0');
    const startY = parseFloat(element.getAttribute('data-touch-y') || '0');
    const touch = e.changedTouches[0];
    
    if (!touch) {
      element.removeAttribute('data-touch-x');
      element.removeAttribute('data-touch-y');
      setIsSwiping(false);
      return;
    }
    
    const endX = touch.clientX;
    const endY = touch.clientY;
    const diffX = startX - endX;
    const diffY = startY - endY;
    
    // Only handle horizontal swipes (ignore vertical scrolling)
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50 && images.length > 1) {
      e.preventDefault();
      setIsSwiping(true);
      if (diffX > 0) {
        // Swipe left - next image
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
      } else {
        // Swipe right - previous image
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
      }
      // Reset swipe flag after a short delay to prevent navigation
      setTimeout(() => setIsSwiping(false), 300);
    } else {
      setIsSwiping(false);
    }
    element.removeAttribute('data-touch-x');
    element.removeAttribute('data-touch-y');
  }, [images.length]);

  // Dashboard variant: horizontal layout with edit/delete buttons
  if (variant === 'dashboard') {
    return (
      <div className={`
        flex flex-col transition-all overflow-hidden
        bg-gray-50 border-b border-gray-200 rounded-none
        md:bg-white md:rounded-lg md:border md:border-red-200 md:hover:border-red-300 md:hover:shadow-md
        ${isRTL ? 'flex-row-reverse' : 'flex-row'}
      `}>
        {/* Image - Left (Right in RTL) */}
        <div className="relative w-24 md:w-24 h-24 md:h-32 flex-shrink-0 overflow-hidden bg-gray-100 group">
          <Link 
            href={`/ad/${ad.id}`} 
            className="absolute inset-0"
            onTouchStart={handleImageTouchStart}
            onTouchEnd={handleImageTouchEnd}
            onTouchMove={(e) => {
              // Prevent scrolling while swiping horizontally
              const element = e.currentTarget as HTMLElement;
              const startX = parseFloat(element.getAttribute('data-touch-x') || '0');
              const touch = e.touches[0];
              if (touch && startX !== 0) {
                const diffX = Math.abs(startX - touch.clientX);
                if (diffX > 10) {
                  e.preventDefault();
                }
              }
            }}
          >
            <Image
              src={currentImage}
              alt={ad.title}
              fill
              className="object-cover transition-transform duration-300 hover:scale-105"
              sizes="(max-width: 768px) 96px, 96px"
              loading="lazy"
              unoptimized={true}
              onError={(e) => {
                // Silently fallback to placeholder - image file may not exist on server
                if (e.currentTarget.src !== '/placeholder.svg') {
                  e.currentTarget.src = '/placeholder.svg';
                }
              }}
            />
          </Link>
          {/* Navigation buttons - only show on hover and if multiple images */}
          {images.length > 1 && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-1 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 opacity-100 transition-opacity z-20"
                aria-label="Previous image"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-1 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 opacity-100 transition-opacity z-20"
                aria-label="Next image"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
          {/* Image counter dots */}
          {images.length > 1 && (
            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-1 z-10">
              {images.map((_, index) => (
                <div
                  key={index}
                  className={`w-1 h-1 rounded-full transition-all ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
          {/* Status Badge - Diagonal top left (only in admin/dashboard panels) */}
          {showStatusBadge && getStatusBadge()}
          {ad.isPremium && (
            <span className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 px-1.5 py-0.5 rounded text-xs font-bold z-10">
              {t('dashboard.premium')}
            </span>
          )}
        </div>

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

            {/* Condition & Real Estate Offer Type Badges */}
            <div className="flex flex-wrap gap-1 mb-1">
              {getConditionText() && (
                <span className="inline-block px-1.5 py-0.5 bg-green-100 text-green-700 text-[10px] font-medium rounded w-fit">
                  {getConditionText()}
                </span>
              )}
              {getRealEstateOfferTypeText() && (
                <span className="inline-block px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-medium rounded w-fit">
                  {getRealEstateOfferTypeText()}
                </span>
              )}
            </div>

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
        onClick={(e) => {
          // Prevent navigation if user was swiping
          if (isSwiping) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
        className={`
          flex transition-all overflow-hidden group
          ${variant === 'compact' 
            ? `flex-row ${isRTL ? 'flex-row-reverse' : ''} 
               bg-gray-50 border-b border-gray-200 rounded-none
               md:bg-white md:border md:border-gray-200 md:border-b-0 md:rounded-lg md:hover:border-red-300 md:hover:shadow-md` 
            : `flex-col md:flex-col
               bg-gray-50 border-b border-gray-200 rounded-none
               md:bg-white md:rounded-lg md:border md:border-gray-200 md:hover:border-red-300 md:hover:shadow-md`
          }
        `}
      >
        {/* Image - Left (Right in RTL) */}
        <div 
          className={`
            relative overflow-hidden bg-gray-100 flex-shrink-0 group
            ${variant === 'compact' 
              ? 'w-28 h-28 md:w-40 md:h-40 min-w-[112px] min-h-[112px] md:min-w-[160px] md:min-h-[160px]' 
              : 'w-full aspect-[4/3] min-h-[120px]'
            }
          `}
          onTouchStart={handleImageTouchStart}
          onTouchEnd={handleImageTouchEnd}
          onTouchMove={(e) => {
            // Prevent scrolling while swiping horizontally
            const element = e.currentTarget as HTMLElement;
            const startX = parseFloat(element.getAttribute('data-touch-x') || '0');
            const touch = e.touches[0];
            if (touch && startX !== 0) {
              const diffX = Math.abs(startX - touch.clientX);
              if (diffX > 10) {
                e.preventDefault();
              }
            }
          }}
          onClick={handleImageContainerClick}
        >
          <Image
            src={currentImage}
            alt={ad.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes={variant === 'compact' ? "(max-width: 768px) 128px, 25vw" : "(max-width: 768px) 50vw, 25vw"}
            loading="lazy"
            unoptimized={true}
            onError={(e) => {
              // Silently fallback to placeholder - image file may not exist on server
              if (e.currentTarget.src !== '/placeholder.svg') {
                e.currentTarget.src = '/placeholder.svg';
              }
            }}
          />
          {/* Navigation buttons - only show on hover and if multiple images */}
          {images.length > 1 && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-1 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 opacity-100 transition-opacity z-20"
                aria-label="Previous image"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-1 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 opacity-100 transition-opacity z-20"
                aria-label="Next image"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
          {/* Image counter dots */}
          {images.length > 1 && (
            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-1 z-10">
              {images.map((_, index) => (
                <div
                  key={index}
                  className={`w-1 h-1 rounded-full transition-all ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
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

            {/* Condition & Real Estate Offer Type Badges */}
            <div className="flex flex-wrap gap-1 mb-1">
              {getConditionText() && (
                <span className="inline-block px-1.5 py-0.5 bg-green-100 text-green-700 text-[10px] font-medium rounded w-fit">
                  {getConditionText()}
                </span>
              )}
              {getRealEstateOfferTypeText() && (
                <span className="inline-block px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-medium rounded w-fit">
                  {getRealEstateOfferTypeText()}
                </span>
              )}
            </div>
          </div>

          <div className={variant === 'compact' ? 'mt-auto' : 'mt-auto'}>
            <div className="text-red-600 font-bold text-xs mb-1">
              {ad.metadata?.isNegotiable 
                ? (isRTL ? 'قیمت توافقی' : 'Negotiable')
                : formatPrice(ad.price)
              }
            </div>
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
      onClick={(e) => {
        // Prevent navigation if user was swiping
        if (isSwiping) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
      className="flex flex-col bg-gray-50 border-b border-gray-200 rounded-none md:bg-white md:rounded-lg md:border md:border-gray-200 md:hover:border-red-300 md:hover:shadow-md transition-all overflow-hidden group"
    >
      <div 
        className="relative w-full aspect-[4/3] overflow-hidden bg-gray-100 group"
        onTouchStart={handleImageTouchStart}
        onTouchEnd={handleImageTouchEnd}
        onTouchMove={(e) => {
          // Prevent scrolling while swiping horizontally
          const element = e.currentTarget as HTMLElement;
          const startX = parseFloat(element.getAttribute('data-touch-x') || '0');
          const touch = e.touches[0];
          if (touch && startX !== 0) {
            const diffX = Math.abs(startX - touch.clientX);
            if (diffX > 10) {
              e.preventDefault();
            }
          }
        }}
        onClick={handleImageContainerClick}
      >
        <Image
          src={currentImage}
          alt={ad.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 50vw, 25vw"
          loading="lazy"
          unoptimized={true}
          onError={(e) => {
            // Silently fallback to placeholder - image file may not exist on server
            if (e.currentTarget.src !== '/placeholder.svg') {
              e.currentTarget.src = '/placeholder.svg';
            }
          }}
        />
        {/* Navigation buttons - only show on hover and if multiple images */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 opacity-100 transition-opacity z-20"
              aria-label="Previous image"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={handleNextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 opacity-100 transition-opacity z-20"
              aria-label="Next image"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
        {/* Image counter dots */}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1 z-10">
            {images.map((_, index) => (
              <div
                key={index}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
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
        {/* Condition & Real Estate Offer Type Badges */}
        <div className="flex flex-wrap gap-1 mb-1">
          {getConditionText() && (
            <span className="inline-block px-1.5 py-0.5 bg-green-100 text-green-700 text-[10px] font-medium rounded w-fit">
              {getConditionText()}
            </span>
          )}
          {getRealEstateOfferTypeText() && (
            <span className="inline-block px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-medium rounded w-fit">
              {getRealEstateOfferTypeText()}
            </span>
          )}
        </div>
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
