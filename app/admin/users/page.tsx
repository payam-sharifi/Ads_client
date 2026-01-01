'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAdminUsers, useBlockUser, useUnblockUser, useSuspendUser } from '@/lib/hooks/admin/useAdminUsers';
import { useAdminStore } from '@/lib/stores/adminStore';
import { toast } from 'react-toastify';
import { AdminUser } from '@/lib/hooks/admin/useAdminUsers';
import { useI18n } from '@/lib/contexts/I18nContext';
import ConfirmModal from '@/components/admin/ConfirmModal';

// Disable static generation for this page
export const dynamic = 'force-dynamic';

/**
 * Users Management Page
 * 
 * Allows admins to:
 * - View all users
 * - Block/unblock users
 * - Suspend users
 * - View user details
 */
export default function AdminUsersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale, isRTL } = useI18n();
  const { usersFilter, setUsersFilter, hasPermission } = useAdminStore();
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [suspendUntil, setSuspendUntil] = useState('');
  const [openActionsMenu, setOpenActionsMenu] = useState<string | null>(null);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showUnblockModal, setShowUnblockModal] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ top: number; right?: number; left?: number } | null>(null);
  const buttonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  const isBlocked = searchParams?.get('isBlocked') === 'true' ? true : usersFilter.isBlocked;
  const isSuspended = searchParams?.get('isSuspended') === 'true' ? true : usersFilter.isSuspended;
  const page = parseInt(searchParams?.get('page') || '1', 10);

  const { data: usersData, isLoading } = useAdminUsers({
    isBlocked: isBlocked !== undefined ? isBlocked : undefined,
    isSuspended: isSuspended !== undefined ? isSuspended : undefined,
    page,
    limit: 10,
  });

  const blockMutation = useBlockUser();
  const unblockMutation = useUnblockUser();
  const suspendMutation = useSuspendUser();

  const handleBlock = async () => {
    if (!selectedUser) return;
    
    if (!hasPermission('users.block')) {
      toast.error(locale === 'fa' ? 'شما اجازه بلاک کردن کاربر را ندارید' : 'You do not have permission to block users');
      return;
    }

    try {
      await blockMutation.mutateAsync(selectedUser.id);
      toast.success(locale === 'fa' ? 'کاربر با موفقیت بلاک شد' : 'User blocked successfully');
      setShowBlockModal(false);
      setSelectedUser(null);
      setOpenActionsMenu(null);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || (locale === 'fa' ? 'خطا در بلاک کردن کاربر' : 'Failed to block user'));
    }
  };

  const handleUnblock = async () => {
    if (!selectedUser) return;
    
    if (!hasPermission('users.block')) {
      toast.error(locale === 'fa' ? 'شما اجازه آنبلاک کردن کاربر را ندارید' : 'You do not have permission to unblock users');
      return;
    }

    try {
      await unblockMutation.mutateAsync(selectedUser.id);
      toast.success(locale === 'fa' ? 'کاربر با موفقیت آنبلاک شد' : 'User unblocked successfully');
      setShowUnblockModal(false);
      setSelectedUser(null);
      setOpenActionsMenu(null);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || (locale === 'fa' ? 'خطا در آنبلاک کردن کاربر' : 'Failed to unblock user'));
    }
  };

  const handleSuspend = async () => {
    if (!selectedUser) return;

    if (!hasPermission('users.suspend')) {
      toast.error('You do not have permission to suspend users');
      return;
    }

    if (!suspendUntil) {
      toast.warning('Please select a suspension date');
      return;
    }

    try {
      await suspendMutation.mutateAsync({
        userId: selectedUser.id,
        until: new Date(suspendUntil),
      });
      toast.success(locale === 'fa' ? 'کاربر با موفقیت تعلیق شد' : 'User suspended successfully');
      setShowSuspendModal(false);
      setSuspendUntil('');
      setSelectedUser(null);
      setOpenActionsMenu(null);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || (locale === 'fa' ? 'خطا در تعلیق کاربر' : 'Failed to suspend user'));
    }
  };

  const users = usersData?.data || [];

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

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900" dir={isRTL ? 'rtl' : 'ltr'}>
            {locale === 'fa' ? 'مدیریت کاربران' : 'Users Management'}
          </h1>
          <p className="text-gray-600 mt-2" dir={isRTL ? 'rtl' : 'ltr'}>
            {locale === 'fa' ? 'مدیریت و نظارت بر تمام کاربران' : 'Manage and moderate all users'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex gap-4">
          <button
            onClick={() => {
              setUsersFilter({ isBlocked: undefined, isSuspended: undefined });
              router.push('/admin/users');
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              !isBlocked && !isSuspended
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {locale === 'fa' ? 'همه کاربران' : 'All Users'}
          </button>
          <button
            onClick={() => {
              setUsersFilter({ isBlocked: true });
              router.push('/admin/users?isBlocked=true');
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              isBlocked
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {locale === 'fa' ? 'بلاک شده' : 'Blocked'}
          </button>
          <button
            onClick={() => {
              setUsersFilter({ isSuspended: true });
              router.push('/admin/users?isSuspended=true');
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              isSuspended
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {locale === 'fa' ? 'تعلیق شده' : 'Suspended'}
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border border-gray-200 md:overflow-visible">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500" dir={isRTL ? 'rtl' : 'ltr'}>
            {locale === 'fa' ? 'در حال بارگذاری کاربران...' : 'Loading users...'}
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-gray-500" dir={isRTL ? 'rtl' : 'ltr'}>
            {locale === 'fa' ? 'هیچ کاربری یافت نشد' : 'No users found'}
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <div className="w-full align-middle">
              <table className="w-full max-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {locale === 'fa' ? 'کاربر' : 'User'}
                    </th>
                    <th className="px-2 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {locale === 'fa' ? 'نقش' : 'Role'}
                    </th>
                    <th className="px-2 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {locale === 'fa' ? 'وضعیت' : 'Status'}
                    </th>
                    <th className="px-2 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      {locale === 'fa' ? 'تاریخ ایجاد' : 'Created'}
                    </th>
                    <th className="px-2 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {locale === 'fa' ? 'عملیات' : 'Actions'}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-2 sm:px-6 py-3 sm:py-4 text-right">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      </div>
                    </td>
                    <td className="px-2 sm:px-6 py-3 sm:py-4 text-right">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role.name === 'SUPER_ADMIN'
                            ? 'bg-purple-100 text-purple-800'
                            : user.role.name === 'ADMIN'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {user.role.name.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-2 sm:px-6 py-3 sm:py-4 text-right">
                      <div className="flex flex-col gap-1">
                        {user.isBlocked && (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                            {locale === 'fa' ? 'بلاک شده' : 'Blocked'}
                          </span>
                        )}
                        {user.isSuspended && (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            {locale === 'fa' ? 'تعلیق شده' : 'Suspended'}
                            {user.suspendedUntil && (
                              <span className="ml-1 hidden sm:inline">
                                {locale === 'fa' ? ' تا ' : ' until '}{new Date(user.suspendedUntil).toLocaleDateString()}
                              </span>
                            )}
                          </span>
                        )}
                        {!user.isBlocked && !user.isSuspended && (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            {locale === 'fa' ? 'فعال' : 'Active'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-2 sm:px-6 py-3 sm:py-4 text-right text-xs sm:text-sm text-gray-500 hidden md:table-cell">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-2 sm:px-6 py-3 sm:py-4 text-right">
                      <div className="flex items-center justify-end">
                        <div className="relative">
                          <button
                            ref={(el) => {
                              buttonRefs.current[user.id] = el;
                            }}
                            onClick={() => setOpenActionsMenu(openActionsMenu === user.id ? null : user.id)}
                            className="p-2 sm:p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors min-w-[40px] min-h-[40px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
                            title={locale === 'fa' ? 'عملیات' : 'Actions'}
                          >
                            <svg className="w-6 h-6 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                            </svg>
                          </button>
                          
                          {openActionsMenu === user.id && (
                            <>
                              {/* Mobile Backdrop */}
                              <div
                                className="fixed inset-0 z-40 backdrop-blur-sm bg-black/30 md:hidden"
                                onClick={() => setOpenActionsMenu(null)}
                              />
                              {/* Mobile: Bottom Sheet */}
                              <div className="fixed bottom-0 left-0 right-0 md:!hidden bg-white rounded-t-xl shadow-2xl z-[101] flex flex-col" style={{ maxHeight: 'calc(90vh - 60px)', bottom: '60px' }} dir={isRTL ? 'rtl' : 'ltr'}>
                                <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
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
                                <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 pb-4 space-y-3">
                                  <Link
                                    href={`/admin/users/${user.id}`}
                                    className="flex items-center gap-3 px-4 py-3 text-base text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                                    onClick={() => setOpenActionsMenu(null)}
                                  >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    <span>{locale === 'fa' ? 'مشاهده' : 'View'}</span>
                                  </Link>
                                  
                                  {hasPermission('users.block') && (
                                    <>
                                      {user.isBlocked ? (
                                        <button
                                          onClick={() => {
                                            setSelectedUser(user);
                                            setShowUnblockModal(true);
                                            setOpenActionsMenu(null);
                                          }}
                                          disabled={unblockMutation.isPending}
                                          className="w-full flex items-center gap-3 px-4 py-3 text-base text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                          </svg>
                                          <span>{locale === 'fa' ? 'آنبلاک' : 'Unblock'}</span>
                                        </button>
                                      ) : (
                                        <button
                                          onClick={() => {
                                            setSelectedUser(user);
                                            setShowBlockModal(true);
                                            setOpenActionsMenu(null);
                                          }}
                                          disabled={blockMutation.isPending}
                                          className="w-full flex items-center gap-3 px-4 py-3 text-base text-red-700 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                          </svg>
                                          <span>{locale === 'fa' ? 'بلاک' : 'Block'}</span>
                                        </button>
                                      )}
                                    </>
                                  )}
                                  
                                  {hasPermission('users.suspend') && !user.isSuspended && (
                                    <button
                                      onClick={() => {
                                        setSelectedUser(user);
                                        setShowSuspendModal(true);
                                        setOpenActionsMenu(null);
                                      }}
                                      className="w-full flex items-center gap-3 px-4 py-3 text-base text-yellow-700 hover:bg-yellow-50 rounded-lg transition-colors"
                                    >
                                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                      <span>{locale === 'fa' ? 'تعلیق' : 'Suspend'}</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                              {/* Desktop: Dropdown Menu */}
                              {menuPosition && openActionsMenu === user.id && (
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
                                      href={`/admin/users/${user.id}`}
                                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                      onClick={() => setOpenActionsMenu(null)}
                                    >
                                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                      </svg>
                                      <span>{locale === 'fa' ? 'مشاهده' : 'View'}</span>
                                    </Link>
                                    
                                    {hasPermission('users.block') && (
                                      <>
                                        {user.isBlocked ? (
                                          <button
                                            onClick={() => {
                                              setSelectedUser(user);
                                              setShowUnblockModal(true);
                                              setOpenActionsMenu(null);
                                            }}
                                            disabled={unblockMutation.isPending}
                                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-emerald-700 hover:bg-emerald-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                          >
                                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span>{locale === 'fa' ? 'آنبلاک' : 'Unblock'}</span>
                                          </button>
                                        ) : (
                                          <button
                                            onClick={() => {
                                              setSelectedUser(user);
                                              setShowBlockModal(true);
                                              setOpenActionsMenu(null);
                                            }}
                                            disabled={blockMutation.isPending}
                                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-700 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                          >
                                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                            </svg>
                                            <span>{locale === 'fa' ? 'بلاک' : 'Block'}</span>
                                          </button>
                                        )}
                                      </>
                                    )}
                                    
                                    {hasPermission('users.suspend') && !user.isSuspended && (
                                      <button
                                        onClick={() => {
                                          setSelectedUser(user);
                                          setShowSuspendModal(true);
                                          setOpenActionsMenu(null);
                                        }}
                                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-yellow-700 hover:bg-yellow-50 transition-colors"
                                      >
                                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>{locale === 'fa' ? 'تعلیق' : 'Suspend'}</span>
                                      </button>
                                    )}
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
        {usersData && usersData.total > 20 && (
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-700" dir={isRTL ? 'rtl' : 'ltr'}>
              {locale === 'fa' 
                ? `نمایش ${((page - 1) * 20) + 1} تا ${Math.min(page * 20, usersData.total)} از ${usersData.total} کاربر`
                : `Showing ${((page - 1) * 20) + 1} to ${Math.min(page * 20, usersData.total)} of ${usersData.total} users`}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => router.push(`/admin/users?page=${page - 1}`)}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                {locale === 'fa' ? 'قبلی' : 'Previous'}
              </button>
              <button
                onClick={() => router.push(`/admin/users?page=${page + 1}`)}
                disabled={page >= Math.ceil(usersData.total / 20)}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                {locale === 'fa' ? 'بعدی' : 'Next'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Block Confirmation Modal */}
      <ConfirmModal
        isOpen={showBlockModal}
        title={locale === 'fa' ? 'بلاک کردن کاربر' : 'Block User'}
        message={locale === 'fa' 
          ? `آیا از بلاک کردن کاربر "${selectedUser?.name}" مطمئن هستید؟`
          : `Are you sure you want to block user "${selectedUser?.name}"?`}
        confirmText={locale === 'fa' ? 'بلاک' : 'Block'}
        cancelText={locale === 'fa' ? 'لغو' : 'Cancel'}
        onConfirm={handleBlock}
        onCancel={() => {
          setShowBlockModal(false);
          setSelectedUser(null);
        }}
        variant="danger"
        isLoading={blockMutation.isPending}
      />

      {/* Unblock Confirmation Modal */}
      <ConfirmModal
        isOpen={showUnblockModal}
        title={locale === 'fa' ? 'آنبلاک کردن کاربر' : 'Unblock User'}
        message={locale === 'fa' 
          ? `آیا از آنبلاک کردن کاربر "${selectedUser?.name}" مطمئن هستید؟`
          : `Are you sure you want to unblock user "${selectedUser?.name}"?`}
        confirmText={locale === 'fa' ? 'آنبلاک' : 'Unblock'}
        cancelText={locale === 'fa' ? 'لغو' : 'Cancel'}
        onConfirm={handleUnblock}
        onCancel={() => {
          setShowUnblockModal(false);
          setSelectedUser(null);
        }}
        variant="info"
        isLoading={unblockMutation.isPending}
      />

      {/* Suspend Modal */}
      {showSuspendModal && selectedUser && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4" dir={isRTL ? 'rtl' : 'ltr'}>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {locale === 'fa' ? 'تعلیق کاربر' : 'Suspend User'}
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              {locale === 'fa' 
                ? `تعلیق کاربر: ${selectedUser.name}`
                : `Suspend user: ${selectedUser.name}`}
            </p>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {locale === 'fa' ? 'تعلیق تا تاریخ' : 'Suspend Until'}
            </label>
            <input
              type="datetime-local"
              value={suspendUntil}
              onChange={(e) => setSuspendUntil(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowSuspendModal(false);
                  setSuspendUntil('');
                  setSelectedUser(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {locale === 'fa' ? 'لغو' : 'Cancel'}
              </button>
              <button
                onClick={handleSuspend}
                disabled={suspendMutation.isPending || !suspendUntil}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {suspendMutation.isPending 
                  ? (locale === 'fa' ? 'در حال تعلیق...' : 'Suspending...')
                  : (locale === 'fa' ? 'تعلیق کاربر' : 'Suspend User')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

