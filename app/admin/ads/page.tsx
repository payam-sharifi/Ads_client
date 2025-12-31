'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAdminAds, useApproveAd, useRejectAd, AdminAdsResponse } from '@/lib/hooks/admin/useAdminAds';
import { useSuspendAd, useUnsuspendAd, useDeleteAd } from '@/lib/hooks/useAds';
import { useSendMessage } from '@/lib/hooks/useMessages';
import { useAdminStore } from '@/lib/stores/adminStore';
import { useCategories } from '@/lib/hooks/useCategories';
import { useCities } from '@/lib/hooks/useCities';
import { useCurrentAdminPermissions } from '@/lib/hooks/admin/useCurrentAdminPermissions';
import { useAuthStore } from '@/lib/stores/authStore';
import { toast } from 'react-toastify';
import { Ad } from '@/lib/hooks/useAds';

type AdStatus = Ad['status'];
import { useI18n } from '@/lib/contexts/I18nContext';
import { getLocalizedCategoryName, getLocalizedName } from '@/lib/utils/localizedNames';

/**
 * Ads Management Page
 * 
 * Allows admins to:
 * - View all ads with filters
 * - Approve/reject ads (with permissions)
 * - Edit ad content
 */
export default function AdminAdsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale, isRTL } = useI18n();
  const { user } = useAuthStore();
  const { adsFilter, setAdsFilter, hasPermission, setPermissions, isSuperAdmin } = useAdminStore();
  
  // Load permissions for admin users (needed for permission checks)
  const { data: adminPermissions } = useCurrentAdminPermissions();
  
  // Update permissions in store when they're loaded
  // Note: AdminLayout also sets permissions, but we need to ensure they're set here too
  // in case the component loads before AdminLayout
  React.useEffect(() => {
    if (adminPermissions && user?.role?.name === 'ADMIN') {
      setPermissions(adminPermissions);
    }
  }, [adminPermissions, user, setPermissions]);
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Get filters from URL or store
  // Priority: URL params > store > undefined
  const status = searchParams?.get('status') || undefined;
  const categoryId = searchParams?.get('categoryId') || undefined;
  const cityId = searchParams?.get('cityId') || undefined;
  const userId = searchParams?.get('userId') || undefined;
  const search = searchParams?.get('search') || undefined;
  const page = parseInt(searchParams?.get('page') || '1', 10);

  const { data: adsData, isLoading } = useAdminAds({
    status,
    categoryId,
    cityId,
    userId,
    search,
    page,
    limit: 20,
  });

  const { data: categories } = useCategories();
  const { data: cities } = useCities();
  const approveMutation = useApproveAd();
  const rejectMutation = useRejectAd();
  const suspendMutation = useSuspendAd();
  const unsuspendMutation = useUnsuspendAd();
  const deleteMutation = useDeleteAd();
  const sendMessageMutation = useSendMessage();
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [openActionsMenu, setOpenActionsMenu] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; right?: number; left?: number } | null>(null);
  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  const handleApprove = async (adId: string) => {
    if (!hasPermission('ads.approve')) {
      toast.error('You do not have permission to approve ads');
      return;
    }

    try {
      await approveMutation.mutateAsync({ id: adId, data: {} });
      toast.success('Ad approved successfully');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to approve ad');
    }
  };

  const handleReject = async () => {
    if (!selectedAd) return;

    if (!hasPermission('ads.reject')) {
      toast.error('You do not have permission to reject ads');
      return;
    }

    if (!rejectReason.trim()) {
      toast.warning(locale === 'fa' ? 'لطفاً دلیل رد را وارد کنید' : 'Please provide a rejection reason');
      return;
    }

    try {
      await rejectMutation.mutateAsync({
        id: selectedAd.id,
        data: { reason: rejectReason },
      });
      toast.success(locale === 'fa' ? 'آگهی رد شد و پیام به صاحب آگهی ارسال شد' : 'Ad rejected and message sent to owner');
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedAd(null);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || (locale === 'fa' ? 'خطا در رد آگهی' : 'Failed to reject ad'));
    }
  };

  const handleSuspend = async (adId: string) => {
    if (!hasPermission('ads.edit')) {
      toast.error('You do not have permission to suspend ads');
      return;
    }

    if (!confirm('Are you sure you want to suspend this ad? It will be hidden from public view.')) return;

    try {
      await suspendMutation.mutateAsync(adId);
      toast.success('Ad suspended successfully');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to suspend ad');
    }
  };

  const handleUnsuspend = async (adId: string) => {
    if (!hasPermission('ads.edit')) {
      toast.error('You do not have permission to unsuspend ads');
      return;
    }

    try {
      await unsuspendMutation.mutateAsync(adId);
      toast.success('Ad unsuspended successfully');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to unsuspend ad');
    }
  };

  const handleDelete = async (adId: string) => {
    if (!hasPermission('ads.delete')) {
      toast.error(locale === 'fa' ? 'شما اجازه حذف آگهی را ندارید' : 'You do not have permission to delete ads');
      return;
    }

    if (!confirm(locale === 'fa' ? 'آیا از حذف این آگهی مطمئن هستید؟ این عمل قابل بازگشت نیست.' : 'Are you sure you want to delete this ad? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(adId);
      toast.success(locale === 'fa' ? 'آگهی با موفقیت حذف شد' : 'Ad deleted successfully');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || (locale === 'fa' ? 'خطا در حذف آگهی' : 'Failed to delete ad'));
    }
  };

  const handleSendMessage = async () => {
    if (!selectedAd) return;

    if (!messageText.trim()) {
      toast.warning('Please enter a message');
      return;
    }

    try {
      // API: POST /api/messages
      await sendMessageMutation.mutateAsync({
        adId: selectedAd.id,
        messageText: messageText.trim(),
      });
      toast.success('Message sent to ad owner successfully');
      setShowMessageModal(false);
      setMessageText('');
      setSelectedAd(null);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to send message');
    }
  };

  const truncateTitle = (title: string, maxWords: number = 2) => {
    const words = title.trim().split(/\s+/);
    if (words.length <= maxWords) {
      return title;
    }
    return words.slice(0, maxWords).join(' ') + '...';
  };

  const getStatusBadge = (status: AdStatus) => {
    const badges = {
      DRAFT: {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        border: 'border-gray-300',
        icon: (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        ),
        label: locale === 'fa' ? 'پیش‌نویس' : 'Draft',
      },
      PENDING_APPROVAL: {
        bg: 'bg-amber-50',
        text: 'text-amber-800',
        border: 'border-amber-300',
        icon: (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        label: locale === 'fa' ? 'منتظر تایید' : 'Pending',
      },
      APPROVED: {
        bg: 'bg-emerald-50',
        text: 'text-emerald-800',
        border: 'border-emerald-300',
        icon: (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        label: locale === 'fa' ? 'تایید شده' : 'Approved',
      },
      REJECTED: {
        bg: 'bg-red-50',
        text: 'text-red-800',
        border: 'border-red-300',
        icon: (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ),
        label: locale === 'fa' ? 'رد شده' : 'Rejected',
      },
      EXPIRED: {
        bg: 'bg-slate-100',
        text: 'text-slate-800',
        border: 'border-slate-300',
        icon: (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        label: locale === 'fa' ? 'منقضی شده' : 'Expired',
      },
      SUSPENDED: {
        bg: 'bg-orange-50',
        text: 'text-orange-800',
        border: 'border-orange-300',
        icon: (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        ),
        label: locale === 'fa' ? 'تعلیق شده' : 'Suspended',
      },
    };
    return badges[status] || badges.DRAFT;
  };

  const ads = (adsData as AdminAdsResponse | undefined)?.data || [];
  const hasActiveFilters = status || categoryId || cityId || search;

  // Calculate menu position when it opens
  useEffect(() => {
    if (openActionsMenu) {
      const button = buttonRefs.current[openActionsMenu];
      if (button) {
        const rect = button.getBoundingClientRect();
        if (isRTL) {
          setMenuPosition({
            top: rect.bottom + 4,
            left: rect.left,
          });
        } else {
          setMenuPosition({
            top: rect.bottom + 4,
            right: window.innerWidth - rect.right,
          });
        }
      }
    } else {
      setMenuPosition(null);
    }
  }, [openActionsMenu, isRTL]);

  // Close menu on scroll or click outside
  useEffect(() => {
    const handleScroll = () => {
      if (openActionsMenu) {
        setOpenActionsMenu(null);
      }
    };
    
    const handleClickOutside = (event: MouseEvent) => {
      if (openActionsMenu) {
        const target = event.target as HTMLElement;
        const button = buttonRefs.current[openActionsMenu];
        const menu = document.querySelector('[data-action-menu]');
        
        if (button && !button.contains(target) && menu && !menu.contains(target)) {
          setOpenActionsMenu(null);
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll, true);
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openActionsMenu]);

  const handleClearFilters = () => {
    const params = new URLSearchParams();
    params.set('page', '1');
    setAdsFilter({ status: undefined, categoryId: undefined, cityId: undefined, search: undefined });
    router.push(`/admin/ads?${params.toString()}`);
    setShowFilters(false);
  };

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-gray-900" dir={isRTL ? 'rtl' : 'ltr'}>
            {locale === 'fa' ? 'مدیریت آگهی‌ها' : 'Ads Management'}
          </h1>
            <div className="relative">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg transition-colors ${
                  hasActiveFilters
                    ? 'bg-red-100 text-red-600 hover:bg-red-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={locale === 'fa' ? 'فیلترها' : 'Filters'}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                {hasActiveFilters && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full"></span>
                )}
              </button>
              {showFilters && (
                <>
                  <div
                    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:bg-transparent md:backdrop-blur-0 transition-opacity duration-300"
                    onClick={() => setShowFilters(false)}
                  />
                  <div
                    className={`fixed md:absolute ${isRTL ? 'right-0 md:left-0' : 'left-0 md:right-0'} top-0 md:top-full mt-0 md:mt-2 h-full md:h-auto w-80 bg-white md:rounded-lg border-r md:border border-gray-200 shadow-xl z-50 p-4 md:transform md:transition-transform md:duration-300 md:ease-out ${
                      showFilters ? 'md:translate-x-0' : 'md:-translate-x-full md:translate-x-0'
                    }`}
                    style={{
                      animation: showFilters ? (isRTL ? 'slideInRight 0.4s ease-out' : 'slideInLeft 0.4s ease-out') : undefined
                    }}
                    dir={isRTL ? 'rtl' : 'ltr'}
                  >
                    <div className="flex items-center justify-between mb-4 md:hidden">
                      <h3 className="text-lg font-semibold text-gray-900">{locale === 'fa' ? 'فیلترها' : 'Filters'}</h3>
                      <button
                        onClick={() => setShowFilters(false)}
                        className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="space-y-4">
          <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              {locale === 'fa' ? 'وضعیت' : 'Status'}
            </label>
            <select
              value={status || ''}
              onChange={(e) => {
                const newStatus = e.target.value || undefined;
                const params = new URLSearchParams(window.location.search);
                if (newStatus) {
                  params.set('status', newStatus);
                } else {
                  params.delete('status');
                }
                            params.set('page', '1');
                setAdsFilter({ status: newStatus });
                router.push(`/admin/ads?${params.toString()}`);
              }}
                          className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">{locale === 'fa' ? 'همه وضعیت‌ها' : 'All Statuses'}</option>
              <option value="PENDING_APPROVAL">{locale === 'fa' ? 'منتظر تایید' : 'Pending Approval'}</option>
              <option value="APPROVED">{locale === 'fa' ? 'تایید شده' : 'Approved'}</option>
              <option value="REJECTED">{locale === 'fa' ? 'رد شده' : 'Rejected'}</option>
              <option value="SUSPENDED">{locale === 'fa' ? 'تعلیق شده' : 'Suspended'}</option>
              <option value="DRAFT">{locale === 'fa' ? 'پیش‌نویس' : 'Draft'}</option>
              <option value="EXPIRED">{locale === 'fa' ? 'منقضی شده' : 'Expired'}</option>
            </select>
          </div>
          <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              {locale === 'fa' ? 'دسته‌بندی' : 'Category'}
            </label>
            <select
              value={categoryId || ''}
              onChange={(e) => {
                const newCategoryId = e.target.value || undefined;
                const params = new URLSearchParams(window.location.search);
                if (newCategoryId) {
                  params.set('categoryId', newCategoryId);
                } else {
                  params.delete('categoryId');
                }
                            params.set('page', '1');
                setAdsFilter({ categoryId: newCategoryId });
                router.push(`/admin/ads?${params.toString()}`);
              }}
                          className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">{locale === 'fa' ? 'همه دسته‌بندی‌ها' : 'All Categories'}</option>
              {categories?.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {getLocalizedCategoryName(cat.name, locale) || 'N/A'}
                </option>
              ))}
            </select>
          </div>
          <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              {locale === 'fa' ? 'شهر' : 'City'}
            </label>
            <select
              value={cityId || ''}
              onChange={(e) => {
                const newCityId = e.target.value || undefined;
                const params = new URLSearchParams(window.location.search);
                if (newCityId) {
                  params.set('cityId', newCityId);
                } else {
                  params.delete('cityId');
                }
                            params.set('page', '1');
                setAdsFilter({ cityId: newCityId });
                router.push(`/admin/ads?${params.toString()}`);
              }}
                          className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">{locale === 'fa' ? 'همه شهرها' : 'All Cities'}</option>
              {cities?.map((city) => (
                <option key={city.id} value={city.id}>
                  {getLocalizedName(city.name, locale) || 'N/A'}
                </option>
              ))}
            </select>
          </div>
          <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              {locale === 'fa' ? 'جستجو' : 'Search'}
            </label>
            <input
              type="text"
              placeholder={locale === 'fa' ? 'جستجوی آگهی‌ها...' : 'Search ads...'}
              value={search || ''}
              onChange={(e) => {
                const newSearch = e.target.value || undefined;
                const params = new URLSearchParams(window.location.search);
                if (newSearch) {
                  params.set('search', newSearch);
                } else {
                  params.delete('search');
                }
                            params.set('page', '1');
                setAdsFilter({ search: newSearch });
                router.push(`/admin/ads?${params.toString()}`);
              }}
                          className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              dir={isRTL ? 'rtl' : 'ltr'}
            />
          </div>
                      {hasActiveFilters && (
                        <div className="pt-2">
                          <button
                            onClick={handleClearFilters}
                            className="w-full px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-xs sm:text-sm"
                          >
                            {locale === 'fa' ? 'پاک کردن فیلترها' : 'Clear Filters'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          <p className="text-gray-600 mt-2" dir={isRTL ? 'rtl' : 'ltr'}>
            {locale === 'fa' ? 'مدیریت و بررسی تمام آگهی‌ها' : 'Manage and moderate all advertisements'}
          </p>
        </div>
      </div>

      {/* Ads Table */}
      <div className="bg-white rounded-lg border border-gray-200 md:overflow-visible">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500" dir={isRTL ? 'rtl' : 'ltr'}>
            {locale === 'fa' ? 'در حال بارگذاری آگهی‌ها...' : 'Loading ads...'}
          </div>
        ) : ads.length === 0 ? (
          <div className="p-8 text-center text-gray-500" dir={isRTL ? 'rtl' : 'ltr'}>
            {locale === 'fa' ? 'هیچ آگهی‌ای یافت نشد' : 'No ads found'}
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <div className="w-full align-middle">
              <table className="w-full max-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                    <th className="px-2 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ad
                  </th>
                    <th className="px-2 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    User
                  </th>
                    <th className="px-2 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                    <th className="px-2 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Price
                  </th>
                    <th className="px-2 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Created
                  </th>
                    <th className="px-2 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {ads.map((ad) => (
                  <tr key={ad.id} className="hover:bg-gray-50">
                      <td className="px-2 sm:px-6 py-3 sm:py-4 text-right">
                        <Link
                          href={`/ad/${ad.id}`}
                          className="text-xs font-normal text-gray-900 hover:text-red-600"
                          title={ad.title}
                        >
                          {truncateTitle(ad.title)}
                        </Link>
                    </td>
                    <td className="px-2 sm:px-6 py-3 sm:py-4 text-right hidden md:table-cell">
                      <div className="text-xs sm:text-sm text-gray-900">{ad.user?.name || 'Unknown'}</div>
                      <div className="text-xs text-gray-500">{ad.user?.email}</div>
                    </td>
                    <td className="px-2 sm:px-6 py-3 sm:py-4 text-right">
                      {(() => {
                        const badge = getStatusBadge(ad.status);
                        return (
                      <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border ${badge.bg} ${badge.text} ${badge.border}`}
                          >
                            {badge.icon}
                            <span>{badge.label}</span>
                      </span>
                        );
                      })()}
                    </td>
                    <td className="px-2 sm:px-6 py-3 sm:py-4 text-right text-xs sm:text-sm text-gray-900 hidden lg:table-cell">
                      {ad.price === 0 ? 'Free' : `€${ad.price.toLocaleString()}`}
                    </td>
                    <td className="px-2 sm:px-6 py-3 sm:py-4 text-right text-xs sm:text-sm text-gray-500 hidden lg:table-cell">
                      {new Date(ad.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-2 sm:px-6 py-3 sm:py-4 text-right">
                      <div className="flex items-center justify-end">
                        <div className="relative">
                          <button
                            ref={(el) => {
                              buttonRefs.current[ad.id] = el;
                            }}
                            onClick={() => setOpenActionsMenu(openActionsMenu === ad.id ? null : ad.id)}
                            className="p-2 sm:p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors min-w-[40px] min-h-[40px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
                            title={locale === 'fa' ? 'عملیات' : 'Actions'}
                          >
                            <svg className="w-6 h-6 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                          </button>
                          
                          {openActionsMenu === ad.id && (
                            <>
                              <div
                                className="fixed inset-0 z-40 backdrop-blur-sm bg-white/20 md:backdrop-blur-0 md:bg-transparent md:hidden"
                                onClick={() => setOpenActionsMenu(null)}
                              />
                              {/* Mobile: Bottom Sheet */}
                              <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white rounded-t-xl shadow-2xl z-50 max-h-[80vh] overflow-y-auto" dir={isRTL ? 'rtl' : 'ltr'}>
                                <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                                  <h3 className="text-lg font-semibold text-gray-900">{locale === 'fa' ? 'عملیات' : 'Actions'}</h3>
                                  <button
                                    onClick={() => setOpenActionsMenu(null)}
                                    className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                                  >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </div>
                                <div className="px-4 py-2">
                        <Link
                          href={`/ad/${ad.id}`}
                                    className="flex items-center gap-3 px-4 py-3 text-base text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                                    onClick={() => setOpenActionsMenu(null)}
                                  >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    <span>{locale === 'fa' ? 'مشاهده' : 'View'}</span>
                        </Link>
                                  
                        {ad.status === 'PENDING_APPROVAL' && (
                          <button
                                      onClick={() => {
                                        handleApprove(ad.id);
                                        setOpenActionsMenu(null);
                                      }}
                            disabled={approveMutation.isPending}
                                      className="w-full flex items-center gap-3 px-4 py-3 text-base text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                      <span>{locale === 'fa' ? 'تایید' : 'Approve'}</span>
                          </button>
                        )}
                                  
                        {ad.status === 'PENDING_APPROVAL' && (
                          <button
                            onClick={() => {
                              setSelectedAd(ad);
                              setShowRejectModal(true);
                                        setOpenActionsMenu(null);
                            }}
                                      className="w-full flex items-center gap-3 px-4 py-3 text-base text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          >
                                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                      <span>{locale === 'fa' ? 'رد' : 'Reject'}</span>
                          </button>
                        )}
                                  
                        {ad.status === 'APPROVED' && (
                          <button
                                      onClick={() => {
                                        handleSuspend(ad.id);
                                        setOpenActionsMenu(null);
                                      }}
                            disabled={suspendMutation.isPending}
                                      className="w-full flex items-center gap-3 px-4 py-3 text-base text-orange-700 hover:bg-orange-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                      </svg>
                                      <span>{locale === 'fa' ? 'تعلیق' : 'Suspend'}</span>
                          </button>
                        )}
                                  
                        {ad.status === 'SUSPENDED' && (
                          <button
                                      onClick={() => {
                                        handleUnsuspend(ad.id);
                                        setOpenActionsMenu(null);
                                      }}
                            disabled={unsuspendMutation.isPending}
                                      className="w-full flex items-center gap-3 px-4 py-3 text-base text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                      <span>{locale === 'fa' ? 'رفع تعلیق' : 'Unsuspend'}</span>
                          </button>
                        )}
                                  
                        <Link
                            href={`/edit-ad/${ad.id}`}
                                      className="flex items-center gap-3 px-4 py-3 text-base text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                                      onClick={() => setOpenActionsMenu(null)}
                          >
                                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                      </svg>
                                      <span>{locale === 'fa' ? 'ویرایش' : 'Edit'}</span>
                          </Link>
                                  
                                  <button
                                      onClick={() => {
                                        setSelectedAd(ad);
                                        setShowMessageModal(true);
                                        setOpenActionsMenu(null);
                                      }}
                                      className="w-full flex items-center gap-3 px-4 py-3 text-base text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                    >
                                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                      </svg>
                                      <span>{locale === 'fa' ? 'پیام' : 'Message'}</span>
                                    </button>
                                  
                                    <>
                                      <div className="border-t border-gray-200 my-2" />
                          <button
                                        onClick={() => {
                                          handleDelete(ad.id);
                                          setOpenActionsMenu(null);
                                        }}
                            disabled={deleteMutation.isPending}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-base text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        <span>{locale === 'fa' ? 'حذف' : 'Delete'}</span>
                                      </button>
                                    </>
                                </div>
                              </div>
                              {/* Desktop: Dropdown Menu */}
                              {menuPosition && openActionsMenu === ad.id && (
                                <div 
                                  data-action-menu
                                  className="hidden md:block fixed bg-white rounded-lg shadow-xl border border-gray-200 z-[9999] py-1"
                                  style={{ 
                                    width: '224px', 
                                    minWidth: '224px',
                                    top: `${menuPosition.top}px`,
                                    ...(isRTL ? { left: `${menuPosition.left}px` } : { right: `${menuPosition.right}px` })
                                  }}
                                  dir={isRTL ? 'rtl' : 'ltr'}
                                >
                                <Link
                                  href={`/ad/${ad.id}`}
                                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                  onClick={() => setOpenActionsMenu(null)}
                                >
                                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                  <span>{locale === 'fa' ? 'مشاهده' : 'View'}</span>
                                </Link>
                                
                                {ad.status === 'PENDING_APPROVAL' && (
                                  <button
                                    onClick={() => {
                                      handleApprove(ad.id);
                                      setOpenActionsMenu(null);
                                    }}
                                    disabled={approveMutation.isPending}
                                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-emerald-700 hover:bg-emerald-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>{locale === 'fa' ? 'تایید' : 'Approve'}</span>
                                  </button>
                                )}
                                
                                {ad.status === 'PENDING_APPROVAL' && (
                                  <button
                                    onClick={() => {
                                      setSelectedAd(ad);
                                      setShowRejectModal(true);
                                      setOpenActionsMenu(null);
                                    }}
                                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-700 hover:bg-red-50 transition-colors"
                                  >
                                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    <span>{locale === 'fa' ? 'رد' : 'Reject'}</span>
                                  </button>
                                )}
                                
                                {ad.status === 'APPROVED' && (
                                  <button
                                    onClick={() => {
                                      handleSuspend(ad.id);
                                      setOpenActionsMenu(null);
                                    }}
                                    disabled={suspendMutation.isPending}
                                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-orange-700 hover:bg-orange-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                    </svg>
                                    <span>{locale === 'fa' ? 'تعلیق' : 'Suspend'}</span>
                                  </button>
                                )}
                                
                                {ad.status === 'SUSPENDED' && (
                                  <button
                                    onClick={() => {
                                      handleUnsuspend(ad.id);
                                      setOpenActionsMenu(null);
                                    }}
                                    disabled={unsuspendMutation.isPending}
                                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-emerald-700 hover:bg-emerald-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>{locale === 'fa' ? 'رفع تعلیق' : 'Unsuspend'}</span>
                                  </button>
                                )}
                                
                                <Link
                                    href={`/edit-ad/${ad.id}`}
                                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                    onClick={() => setOpenActionsMenu(null)}
                                  >
                                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    <span>{locale === 'fa' ? 'ویرایش' : 'Edit'}</span>
                                  </Link>
                                
                                <button
                                    onClick={() => {
                                      setSelectedAd(ad);
                                      setShowMessageModal(true);
                                      setOpenActionsMenu(null);
                                    }}
                                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-blue-700 hover:bg-blue-50 transition-colors"
                                  >
                                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                    <span>{locale === 'fa' ? 'پیام' : 'Message'}</span>
                                  </button>
                                
                                  <>
                                    <div className="border-t border-gray-200 my-1" />
                                    <button
                                      onClick={() => {
                                        handleDelete(ad.id);
                                        setOpenActionsMenu(null);
                                      }}
                                      disabled={deleteMutation.isPending}
                                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-700 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                      <span>{locale === 'fa' ? 'حذف' : 'Delete'}</span>
                                    </button>
                                  </>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {(adsData as AdminAdsResponse | undefined)?.pagination && (adsData as AdminAdsResponse)?.pagination.totalPages > 1 && (
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, (adsData as AdminAdsResponse).pagination.total)} of{' '}
              {(adsData as AdminAdsResponse).pagination.total} ads
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => router.push(`/admin/ads?page=${page - 1}`)}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => router.push(`/admin/ads?page=${page + 1}`)}
                disabled={page >= (adsData as AdminAdsResponse).pagination.totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && selectedAd && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4" dir={isRTL ? 'rtl' : 'ltr'}>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {locale === 'fa' ? 'رد آگهی' : 'Anzeige ablehnen'}
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              {locale === 'fa' 
                ? `لطفاً دلیل رد این آگهی را وارد کنید: ${selectedAd.title}`
                : `Please provide a reason for rejecting this ad: ${selectedAd.title}`}
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder={locale === 'fa' ? 'دلیل رد را وارد کنید (حداقل 10 کاراکتر)...' : 'Enter rejection reason (minimum 10 characters)...'}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
              dir={isRTL ? 'rtl' : 'ltr'}
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                  setSelectedAd(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {locale === 'fa' ? 'لغو' : 'Cancel'}
              </button>
              <button
                onClick={handleReject}
                disabled={rejectMutation.isPending || !rejectReason.trim() || rejectReason.trim().length < 10}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {rejectMutation.isPending 
                  ? (locale === 'fa' ? 'در حال رد...' : 'Rejecting...')
                  : (locale === 'fa' ? 'رد آگهی' : 'Reject Ad')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message Modal */}
      {showMessageModal && selectedAd && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Send Message to Ad Owner</h2>
            <p className="text-sm text-gray-600 mb-4">
              Send a message to <strong>{selectedAd.user?.name || 'the owner'}</strong> about their ad:{' '}
              <strong>{selectedAd.title}</strong>
            </p>
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Enter your message to the ad owner..."
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowMessageModal(false);
                  setMessageText('');
                  setSelectedAd(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSendMessage}
                disabled={sendMessageMutation.isPending || !messageText.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sendMessageMutation.isPending ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

