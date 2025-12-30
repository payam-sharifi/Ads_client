'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/stores/authStore';
import { useAdminStore } from '@/lib/stores/adminStore';
import { useLogout } from '@/lib/hooks/useAuth';
import { useCurrentAdminPermissions } from '@/lib/hooks/admin/useCurrentAdminPermissions';
import { useUnreadMessagesCount } from '@/lib/hooks/useMessages';
import { useI18n } from '@/lib/contexts/I18nContext';
import { toast } from 'react-toastify';

interface AdminLayoutProps {
  children: React.ReactNode;
}

/**
 * Admin Layout Component
 * 
 * Provides sidebar navigation and top bar for admin dashboard
 * Only accessible to ADMIN and SUPER_ADMIN roles
 */
export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuthStore();
  const { sidebarOpen, setSidebarOpen, setPermissions, isSuperAdmin, hasPermission } = useAdminStore();
  const logoutMutation = useLogout();
  const { data: permissions } = useCurrentAdminPermissions();
  const { data: unreadCount = 0 } = useUnreadMessagesCount();
  const { locale, isRTL } = useI18n();

  // Load permissions for admin users
  useEffect(() => {
    if (permissions && user?.role?.name === 'ADMIN') {
      setPermissions(permissions);
    }
  }, [permissions, user, setPermissions]);

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      router.push('/login');
    } catch (error) {
      toast.error(locale === 'fa' ? 'خروج ناموفق بود' : 'Failed to logout');
    }
  };

  const menuItems = [
    {
      label: locale === 'fa' ? 'داشبورد' : 'Dashboard',
      href: '/admin',
      icon: '📊',
      permission: null, // Always visible
    },
    {
      label: locale === 'fa' ? 'مدیریت آگهی‌ها' : 'Ads Management',
      href: '/admin/ads',
      icon: '📢',
      permission: null, // Always visible for admins
    },
    {
      label: locale === 'fa' ? 'مدیریت کاربران' : 'Users Management',
      href: '/admin/users',
      icon: '👥',
      permission: 'users.view',
    },
    {
      label: locale === 'fa' ? 'نظارت بر پیام‌ها' : 'Messages Monitoring',
      href: '/admin/messages',
      icon: '💬',
      permission: 'messages.view',
    },
    {
      label: locale === 'fa' ? 'مدیریت دسته‌بندی‌ها' : 'Categories Management',
      href: '/admin/categories',
      icon: '📂',
      permission: 'categories.manage',
    },
    {
      label: locale === 'fa' ? 'مدیران و دسترسی‌ها' : 'Admins & Permissions',
      href: '/admin/admins',
      icon: '🔐',
      permission: 'admins.manage',
      superAdminOnly: true,
    },
    {
      label: locale === 'fa' ? 'گزارش‌ها و پرچم‌ها' : 'Reports & Flags',
      href: '/admin/reports',
      icon: '🚩',
      permission: 'reports.view',
    },
  ];

  const filteredMenuItems = menuItems.filter((item) => {
    if (item.superAdminOnly && !isSuperAdmin()) return false;
    if (item.permission && !hasPermission(item.permission)) return false;
    return true;
  });

  if (!isAuthenticated || !user) {
    return null;
  }

  const roleName = user.role?.name;
  if (roleName !== 'ADMIN' && roleName !== 'SUPER_ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-xl font-bold text-gray-900" dir={isRTL ? 'rtl' : 'ltr'}>
                {locale === 'fa' ? 'داشبورد مدیریت' : 'Admin Dashboard'}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`${isRTL ? 'text-left' : 'text-right'} hidden sm:block`}>
                  <div className="text-sm font-medium text-gray-900">{user.name}</div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    roleName === 'SUPER_ADMIN'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {roleName === 'SUPER_ADMIN' 
                    ? (locale === 'fa' ? 'سوپر ادمین' : 'Super Admin')
                    : (locale === 'fa' ? 'مدیر' : 'Admin')}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {locale === 'fa' ? 'خروج' : 'Logout'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Main Content */}
        <main className="flex-1">
          <div className="px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8">{children}</div>
        </main>
      </div>

      {/* Sidebar Drawer from Right */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 backdrop-blur-sm bg-white/30 z-40"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="fixed top-0 right-0 bottom-0 w-64 bg-white border-l border-gray-200 z-50 shadow-xl transition-transform duration-300 ease-in-out">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900" dir={isRTL ? 'rtl' : 'ltr'}>
                {locale === 'fa' ? 'منوی مدیریت' : 'Admin Menu'}
              </h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
              {filteredMenuItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center justify-between gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                    {item.href === '/admin/messages' && unreadCount > 0 && (
                      <span className="bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center min-w-[20px] px-1">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </aside>
        </>
      )}
    </div>
  );
}

