'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useI18n } from '@/lib/contexts/I18nContext';
import { useAuthStore } from '@/lib/stores/authStore';
import { useBookmarkedAds, useUnbookmarkAd } from '@/lib/hooks/useAds';
import AdCard from '@/components/common/AdCard';
import Button from '@/components/common/Button';
import { toast } from 'react-toastify';

export default function BookmarkedAdsPage() {
  const router = useRouter();
  const { t, locale, isRTL } = useI18n();
  const { isAuthenticated, user } = useAuthStore();
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data: bookmarkedAdsData, isLoading, refetch } = useBookmarkedAds(page, limit);
  const unbookmarkMutation = useUnbookmarkAd();

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  const handleUnbookmark = async (adId: string) => {
    try {
      await unbookmarkMutation.mutateAsync(adId);
      toast.success(isRTL ? 'از نشان‌ها حذف شد' : 'Removed from bookmarks');
      refetch();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || (isRTL ? 'خطا در حذف نشان' : 'Failed to remove bookmark'));
    }
  };

  const ads = bookmarkedAdsData?.data || [];
  const pagination = bookmarkedAdsData?.pagination;

  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 pb-20 md:pb-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{isRTL ? 'آگهی‌های نشان شده' : 'Bookmarked Ads'}</h1>
        <Link href="/dashboard">
          <Button variant="outline" size="sm">
            {isRTL ? 'بازگشت به داشبورد' : 'Back to Dashboard'}
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center py-8">{t('common.loading')}</div>
      ) : !ads || ads.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          <p className="text-gray-500 mb-4">{isRTL ? 'هیچ آگهی نشان شده‌ای ندارید' : 'You have no bookmarked ads'}</p>
          <Link href="/">
            <Button>{isRTL ? 'جستجوی آگهی‌ها' : 'Browse Ads'}</Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-4">
            {ads.map((ad) => (
              <div key={ad.id} className="relative">
                <AdCard 
                  ad={ad} 
                  variant="dashboard"
                  showStatusBadge={true}
                />
                <button
                  onClick={() => handleUnbookmark(ad.id)}
                  disabled={unbookmarkMutation.isPending}
                  className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md hover:bg-red-50 text-red-600 transition-colors disabled:opacity-50"
                  title={isRTL ? 'حذف از نشان‌ها' : 'Remove from bookmarks'}
                >
                  <svg className="w-5 h-5" fill="currentColor" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRTL ? 'قبلی' : 'Previous'}
              </button>
              <span className="px-4 py-2 text-sm text-gray-700">
                {isRTL ? `صفحه ${page} از ${pagination.totalPages}` : `Page ${page} of ${pagination.totalPages}`}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRTL ? 'بعدی' : 'Next'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

