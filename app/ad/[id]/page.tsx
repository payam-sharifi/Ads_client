'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import ImageGallery from 'react-image-gallery';
import 'react-image-gallery/styles/css/image-gallery.css';
import { useI18n } from '@/lib/contexts/I18nContext';
import { useAuthStore } from '@/lib/stores/authStore';
import { useAd, useBookmarkAd, useUnbookmarkAd, useBookmarkedAds } from '@/lib/hooks/useAds';
import { useSendMessage } from '@/lib/hooks/useMessages';
import { useCreateReport } from '@/lib/hooks/useReports';
import { useAdImages } from '@/lib/hooks/useImages';
import AdMetadataDisplay from '@/components/ads/AdMetadataDisplay';
import Button from '@/components/common/Button';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { getLocalizedCategoryName, getLocalizedName } from '@/lib/utils/localizedNames';
import { getImageUrl } from '@/lib/utils/imageUtils';

export default function AdDetailPage() {
  const params = useParams();
  const router = useRouter();
  const adId = params.id as string;
  const { t, locale, isRTL } = useI18n();
  const { isAuthenticated, user } = useAuthStore();
  const [showMessageForm, setShowMessageForm] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [showReportModal, setShowReportModal] = React.useState(false);
  const [reportReason, setReportReason] = React.useState('');
  
  // Bookmark hooks
  const bookmarkMutation = useBookmarkAd();
  const unbookmarkMutation = useUnbookmarkAd();
  
  // Check if ad is bookmarked - use a separate query for better performance
  const { data: bookmarkedAdsData } = useBookmarkedAds(1, 1000);
  const isBookmarked = React.useMemo(() => {
    if (!bookmarkedAdsData?.data) return false;
    return bookmarkedAdsData.data.some((bookmarkedAd) => bookmarkedAd.id === adId);
  }, [bookmarkedAdsData, adId]);

  // Fetch ad with React Query
  // API: GET /api/ads/:id
  const { data: ad, isLoading, error } = useAd(adId);
  // API: GET /api/images/ad/:adId
  const { data: images } = useAdImages(adId);
  const sendMessageMutation = useSendMessage();
  const createReportMutation = useCreateReport();

  // Show error toast
  React.useEffect(() => {
    if (error) {
      toast.error('Failed to load ad');
    }
  }, [error]);

  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast.warning('Please enter a message');
      return;
    }
    try {
      // API: POST /api/messages
      await sendMessageMutation.mutateAsync({ adId, messageText: message.trim() });
      toast.success('Message sent successfully');
      setMessage('');
      setShowMessageForm(false);
      router.push(`/messages/${adId}`);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to send message');
    }
  };

  const formatPrice = (price: number) => {
    if (price === 0) return isRTL ? 'رایگان' : 'Kostenlos';
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale === 'fa' ? 'fa-IR' : 'de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-gray-500">{t('common.loading')}</div>
      </div>
    );
  }

  if (!ad) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-gray-500">{t('common.error')}</div>
      </div>
    );
  }

  const handleReport = async () => {
    if (!reportReason.trim() || reportReason.trim().length < 10) {
      toast.warning('Please provide a reason (minimum 10 characters)');
      return;
    }

    try {
      // API: POST /api/reports
      await createReportMutation.mutateAsync({
        type: 'ad',
        entityId: adId,
        reason: reportReason.trim(),
      });
      toast.success('Report submitted successfully');
      setShowReportModal(false);
      setReportReason('');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to submit report');
    }
  };

  const isOwner = isAuthenticated && user?.id === ad.userId;
  // Use images from API or fallback to ad.images
  const adImages = images || ad.images || [];
  const galleryImages =
    adImages.length > 0
      ? adImages.map((img) => {
          const fullUrl = getImageUrl(img.url);
          return {
            original: fullUrl,
            thumbnail: fullUrl,
          };
        })
      : [{ original: '/placeholder.svg', thumbnail: '/placeholder.svg' }];

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
              {galleryImages.length > 0 ? (
                <ImageGallery
                  items={galleryImages}
                  showPlayButton={false}
                  showFullscreenButton={true}
                  showBullets={galleryImages.length > 1}
                  showThumbnails={galleryImages.length > 1}
                  thumbnailPosition={isRTL ? 'right' : 'left'}
                />
              ) : (
                <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400">{t('ad.images')}</span>
                </div>
              )}
            </div>

            {/* Ad Details */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">{ad.title}</h1>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span dir={isRTL ? 'rtl' : 'ltr'}>
                        {getLocalizedName(ad.city?.name, locale) || 'N/A'}
                      </span>
                    </span>
                    <span>•</span>
                    <span dir={isRTL ? 'rtl' : 'ltr'}>
                      {getLocalizedCategoryName(ad.category?.name, locale) || 'N/A'}
                    </span>
                    <span>•</span>
                    <span>{formatDate(ad.createdAt)}</span>
                  </div>
                </div>
                {ad.isPremium && (
                  <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded text-sm font-bold">
                    {t('dashboard.premium')}
                  </span>
                )}
              </div>

              {/* Price Display */}
              {ad.price !== undefined && ad.price !== null && (
                <div className="border-t border-gray-200 pt-6">
                  <div className="text-2xl font-bold text-red-600">
                    {ad.metadata?.isNegotiable 
                      ? (isRTL ? 'قیمت توافقی' : 'Negotiable Price')
                      : formatPrice(ad.price)
                    }
                  </div>
                </div>
              )}

              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-xl font-bold mb-4 text-gray-900">{t('ad.description')}</h2>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{ad.description}</p>
              </div>

              {/* Category-specific Details */}
              {ad.metadata && Object.keys(ad.metadata).length > 0 && (
                <div className="border-t border-gray-200 pt-6 mt-6">
                  <h2 className="text-xl font-bold mb-4 text-gray-900">
                    {isRTL ? 'جزئیات' : 'Details'}
                  </h2>
                  
                  {/* Real Estate Details */}
                  {ad.metadata.type && (ad.metadata.type === 'rent' || ad.metadata.type === 'sale') && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-500 block mb-1">
                          {isRTL ? 'نوع معامله' : 'Transaction Type'}
                        </span>
                        <span className="font-medium text-gray-900">
                          {ad.metadata.type === 'rent' ? (isRTL ? 'اجاره' : 'Rent') : (isRTL ? 'فروش' : 'Sale')}
                        </span>
                      </div>
                      
                      {ad.metadata.type === 'rent' && (
                        <>
                          {ad.metadata.rentPrice && (
                            <div>
                              <span className="text-sm text-gray-500 block mb-1">
                                {isRTL ? 'اجاره ماهانه' : 'Monthly Rent'}
                              </span>
                              <span className="font-medium text-gray-900" dir="ltr">
                                {formatPrice(Number(ad.metadata.rentPrice))}
                              </span>
                            </div>
                          )}
                          {ad.metadata.deposit && (
                            <div>
                              <span className="text-sm text-gray-500 block mb-1">
                                {isRTL ? 'رهن' : 'Deposit'}
                              </span>
                              <span className="font-medium text-gray-900" dir="ltr">
                                {formatPrice(Number(ad.metadata.deposit))}
                              </span>
                            </div>
                          )}
                        </>
                      )}
                      
                      {ad.metadata.type === 'sale' && ad.metadata.salePrice && (
                        <div>
                          <span className="text-sm text-gray-500 block mb-1">
                            {isRTL ? 'قیمت فروش' : 'Sale Price'}
                          </span>
                          <span className="font-medium text-gray-900" dir="ltr">
                            {formatPrice(Number(ad.metadata.salePrice))}
                          </span>
                        </div>
                      )}
                      
                      {ad.metadata.area && (
                        <div>
                          <span className="text-sm text-gray-500 block mb-1">
                            {isRTL ? 'متراژ' : 'Area'}
                          </span>
                          <span className="font-medium text-gray-900" dir="ltr">
                            {ad.metadata.area} m²
                          </span>
                        </div>
                      )}
                      
                      {ad.metadata.floor !== undefined && ad.metadata.floor !== null && ad.metadata.floor !== '' && (
                        <div>
                          <span className="text-sm text-gray-500 block mb-1">
                            {isRTL ? 'طبقه' : 'Floor'}
                          </span>
                          <span className="font-medium text-gray-900" dir="ltr">
                            {ad.metadata.floor}
                          </span>
                        </div>
                      )}
                      
                      {ad.metadata.yearBuilt && (
                        <div>
                          <span className="text-sm text-gray-500 block mb-1">
                            {isRTL ? 'سال ساخت' : 'Year Built'}
                          </span>
                          <span className="font-medium text-gray-900" dir="ltr">
                            {ad.metadata.yearBuilt}
                          </span>
                        </div>
                      )}
                      
                      {ad.metadata.heating && (
                        <div>
                          <span className="text-sm text-gray-500 block mb-1">
                            {isRTL ? 'گرمایش' : 'Heating'}
                          </span>
                          <span className="font-medium text-gray-900">
                            {ad.metadata.heating === 'central' ? (isRTL ? 'مرکزی' : 'Central') :
                             ad.metadata.heating === 'gas' ? (isRTL ? 'گاز' : 'Gas') :
                             ad.metadata.heating === 'electric' ? (isRTL ? 'برق' : 'Electric') :
                             ad.metadata.heating === 'oil' ? (isRTL ? 'نفت' : 'Oil') :
                             ad.metadata.heating === 'wood' ? (isRTL ? 'چوب' : 'Wood') :
                             ad.metadata.heating === 'solar' ? (isRTL ? 'خورشیدی' : 'Solar') :
                             ad.metadata.heating}
                          </span>
                        </div>
                      )}
                      
                      {ad.metadata.renovated !== undefined && ad.metadata.renovated !== null && ad.metadata.renovated !== '' && (
                        <div>
                          <span className="text-sm text-gray-500 block mb-1">
                            {isRTL ? 'بازسازی شده' : 'Renovated'}
                          </span>
                          <span className="font-medium text-gray-900">
                            {ad.metadata.renovated === true || ad.metadata.renovated === 'true' 
                              ? (isRTL ? 'بله' : 'Yes') 
                              : (isRTL ? 'خیر' : 'No')}
                          </span>
                        </div>
                      )}
                      
                      {ad.metadata.additionalCosts && (
                        <div>
                          <span className="text-sm text-gray-500 block mb-1">
                            {isRTL ? 'هزینه‌های جانبی' : 'Additional Costs'}
                          </span>
                          <span className="font-medium text-gray-900" dir="ltr">
                            {formatPrice(Number(ad.metadata.additionalCosts))} / {isRTL ? 'ماه' : 'month'}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Category-specific metadata display */}
                  <AdMetadataDisplay ad={ad} />
                </div>
              )}

              {/* Ad Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
                <div>
                  <span className="text-sm text-gray-500 block mb-1">{t('ad.views')}</span>
                  <span className="font-medium text-gray-900">{ad.views}</span>
                </div>
              </div>

              {/* Owner Actions */}
              {isOwner && (
                <div className="flex gap-4 mt-6 pt-6 border-t border-gray-200">
                  <Button onClick={() => router.push(`/edit-ad/${ad.id}`)} className="flex-1">
                    {t('ad.edit')}
                  </Button>
                  <Button variant="danger" onClick={() => toast.info('Delete functionality coming soon')} className="flex-1">
                    {t('ad.delete')}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Bookmark Card */}
            {isAuthenticated && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <button
                  onClick={async () => {
                    if (isBookmarked) {
                      try {
                        await unbookmarkMutation.mutateAsync(adId);
                        toast.success(isRTL ? 'از نشان‌ها حذف شد' : 'Removed from bookmarks');
                      } catch (error: any) {
                        toast.error(error?.response?.data?.message || 'Failed to remove bookmark');
                      }
                    } else {
                      try {
                        await bookmarkMutation.mutateAsync(adId);
                        toast.success(isRTL ? 'به نشان‌ها اضافه شد' : 'Added to bookmarks');
                      } catch (error: any) {
                        toast.error(error?.response?.data?.message || 'Failed to bookmark');
                      }
                    }
                  }}
                  disabled={bookmarkMutation.isPending || unbookmarkMutation.isPending}
                  className={`w-full px-4 py-2 rounded-lg border-2 transition-colors ${
                    isBookmarked
                      ? 'bg-red-50 border-red-500 text-red-600'
                      : 'border-gray-300 text-gray-700 hover:border-red-500 hover:text-red-600'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill={isBookmarked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                    {isBookmarked ? (isRTL ? 'ذخیره شده' : 'Gespeichert') : (isRTL ? 'ذخیره' : 'Speichern')}
                  </span>
                </button>
              </div>
            )}

            {/* Seller Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-bold mb-4 text-gray-900">{t('ad.seller')}</h2>
              {ad.user && (
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-500 block mb-1">{t('auth.name')}</span>
                    <span className="font-medium text-gray-900">{ad.user.name}</span>
                  </div>
                  {ad.showEmail && (
                    <div>
                      <span className="text-sm text-gray-500 block mb-1">{t('auth.email')}</span>
                      <span className="font-medium text-gray-900">{ad.user.email}</span>
                    </div>
                  )}
                  {ad.showPhone && ad.user.phone && (
                    <div>
                      <span className="text-sm text-gray-500 block mb-1">{t('auth.phone')}</span>
                      <span className="font-medium text-gray-900">{ad.user.phone}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Contact Actions */}
            {!isOwner && (
              <div className="space-y-3">
                {isAuthenticated ? (
                  <>
                    {!showMessageForm ? (
                      <>
                        <Link href={`/messages/${adId}`} className="block w-full mb-2">
                          <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                            {t('ad.message')}
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => setShowMessageForm(true)}
                        >
                          Quick Message
                        </Button>
                      </>
                    ) : (
                      <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <textarea
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder={isRTL ? 'پیام خود را بنویسید...' : 'Schreiben Sie Ihre Nachricht...'}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                          rows={4}
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={handleSendMessage}
                            disabled={sendMessageMutation.isPending}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                          >
                            {sendMessageMutation.isPending ? t('common.loading') : t('common.submit')}
                          </Button>
                          <Button variant="outline" onClick={() => setShowMessageForm(false)} className="flex-1">
                            {t('common.cancel')}
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <Button
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => router.push('/login')}
                  >
                    {t('auth.login')} {t('ad.message')}
                  </Button>
                )}
              </div>
            )}

            {/* Report Button */}
            {!isOwner && isAuthenticated && (
              <button
                onClick={() => setShowReportModal(true)}
                className="w-full mt-3 px-4 py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
              >
                Report this ad
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Report Ad</h2>
            <p className="text-sm text-gray-600 mb-4">
              Please provide a reason for reporting this ad: <strong>{ad.title}</strong>
            </p>
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Enter reason (minimum 10 characters)..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowReportModal(false);
                  setReportReason('');
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReport}
                disabled={createReportMutation.isPending || !reportReason.trim() || reportReason.trim().length < 10}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createReportMutation.isPending ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
