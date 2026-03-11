'use client';

import React, { useState } from 'react';
import { useAdminStore } from '@/lib/stores/adminStore';
import { useAdminMessages, Message } from '@/lib/hooks/admin/useAdminMessages';
import { useAuthStore } from '@/lib/stores/authStore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useI18n } from '@/lib/contexts/I18nContext';

/**
 * Messages Monitoring Page
 * 
 * Allows admins to:
 * - View conversations between users
 * - Monitor message content
 * - Search by user name or date
 * - Super Admin: See all messages
 * - Admin: See only their own messages (sent and received)
 */
export default function AdminMessagesPage() {
  const { hasPermission, isSuperAdmin } = useAdminStore();
  const { user } = useAuthStore();
  const router = useRouter();
  const { locale, isRTL } = useI18n();
  const [page, setPage] = useState(1);
  const [senderName, setSenderName] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const limit = 10;

  const filters = {
    page,
    limit,
    senderName: senderName.trim() || undefined,
    receiverName: receiverName.trim() || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  };

  const { data: messagesData, isLoading, error } = useAdminMessages(filters, isSuperAdmin());

  if (!hasPermission('messages.view')) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">You do not have permission to view messages</p>
      </div>
    );
  }

  const handleFilter = () => {
    setPage(1); // Reset to first page when filtering
  };

  const handleClearFilters = () => {
    setSenderName('');
    setReceiverName('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const totalPages = messagesData ? Math.ceil(messagesData.total / limit) : 0;

  const hasActiveFilters = senderName || receiverName || startDate || endDate;

  return (
    <div>
      <div className="mb-4 sm:mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900" dir={isRTL ? 'rtl' : 'ltr'}>
              {locale === 'fa' ? 'نظارت بر پیام‌ها' : 'Messages Monitoring'}
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
                          {locale === 'fa' ? 'نام فرستنده' : 'Sender Name'}
            </label>
            <input
              type="text"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
                          placeholder={locale === 'fa' ? 'جستجو بر اساس نام فرستنده...' : 'Search by sender name...'}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                          {locale === 'fa' ? 'نام گیرنده' : 'Receiver Name'}
            </label>
            <input
              type="text"
              value={receiverName}
              onChange={(e) => setReceiverName(e.target.value)}
                          placeholder={locale === 'fa' ? 'جستجو بر اساس نام گیرنده...' : 'Search by receiver name...'}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                          {locale === 'fa' ? 'تاریخ شروع' : 'Start Date'}
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                          {locale === 'fa' ? 'تاریخ پایان' : 'End Date'}
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
                      <div className="flex gap-2 pt-2">
          <button
                          onClick={() => {
                            handleFilter();
                            setShowFilters(false);
                          }}
                          className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-xs sm:text-sm"
          >
                          {locale === 'fa' ? 'اعمال فیلترها' : 'Apply Filters'}
          </button>
          <button
                          onClick={() => {
                            handleClearFilters();
                            setShowFilters(false);
                          }}
                          className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-xs sm:text-sm"
          >
                          {locale === 'fa' ? 'پاک کردن' : 'Clear'}
          </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2" dir={isRTL ? 'rtl' : 'ltr'}>
            {isSuperAdmin() 
              ? (locale === 'fa' ? 'مشاهده تمام گفتگوهای بین کاربران' : 'View all conversations between users')
              : (locale === 'fa' ? 'مشاهده پیام‌های ارسال و دریافت شده شما' : 'View your sent and received messages')}
          </p>
        </div>
      </div>

      {/* Messages List */}
      {isLoading ? (
        <div className="text-center py-6 sm:py-8 text-sm" dir={isRTL ? 'rtl' : 'ltr'}>
          {locale === 'fa' ? 'در حال بارگذاری پیام‌ها...' : 'Loading messages...'}
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4" dir={isRTL ? 'rtl' : 'ltr'}>
          <p className="text-sm text-red-800">
            {locale === 'fa' ? 'خطا در بارگذاری پیام‌ها' : 'Failed to load messages'}
          </p>
        </div>
      ) : !messagesData || messagesData.data.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-6 sm:p-8 text-center" dir={isRTL ? 'rtl' : 'ltr'}>
          <p className="text-sm text-gray-500">
            {locale === 'fa' ? 'پیامی یافت نشد' : 'No messages found'}
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto w-full">
              <div className="w-full align-middle">
                <table className="w-full max-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-2 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {locale === 'fa' ? 'تبلیغ' : 'Ad'}
                      </th>
                      <th className="px-2 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {locale === 'fa' ? 'از' : 'From'}
                      </th>
                      <th className="px-2 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {locale === 'fa' ? 'به' : 'To'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {messagesData.data.map((message) => (
                      <tr 
                        key={message.id} 
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => router.push(`/admin/messages/${message.id}`)}
                      >
                        <td className="px-2 sm:px-6 py-3 sm:py-4 text-right">
                        {message.ad ? (
                            <div 
                              className="text-sm text-blue-600 hover:text-blue-800"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/ad/${message.adId}`);
                              }}
                          >
                            {message.ad.title}
                            </div>
                        ) : (
                            <span className="text-sm text-gray-400">N/A</span>
                        )}
                      </td>
                        <td className="px-2 sm:px-6 py-3 sm:py-4 text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {message.sender?.name || 'Unknown'}
                        </div>
                      </td>
                        <td className="px-2 sm:px-6 py-3 sm:py-4 text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {message.receiver?.name || 'Unknown'}
                          </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between" dir={isRTL ? 'rtl' : 'ltr'}>
              <div className="text-sm text-gray-700">
                {locale === 'fa' 
                  ? `نمایش ${(page - 1) * limit + 1} تا ${Math.min(page * limit, messagesData.total)} از ${messagesData.total} پیام`
                  : `Showing ${(page - 1) * limit + 1} to ${Math.min(page * limit, messagesData.total)} of ${messagesData.total} messages`}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  {locale === 'fa' ? 'قبلی' : 'Previous'}
                </button>
                <span className="px-4 py-2 text-sm text-gray-700">
                  {locale === 'fa' ? `صفحه ${page} از ${totalPages}` : `Page ${page} of ${totalPages}`}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  {locale === 'fa' ? 'بعدی' : 'Next'}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
