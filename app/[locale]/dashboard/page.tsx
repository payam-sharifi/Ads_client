'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useI18n } from '@/lib/contexts/I18nContext';
import { useAuthStore } from '@/lib/stores/authStore';
import { useMyAds, useDeleteAd } from '@/lib/hooks/useAds';
import { useAdminStats } from '@/lib/hooks/admin/useAdminStats';
import { useAdminStore } from '@/lib/stores/adminStore';
import { useCurrentAdminPermissions } from '@/lib/hooks/admin/useCurrentAdminPermissions';
import { useLogout } from '@/lib/hooks/useAuth';
import AdCard from '@/components/common/AdCard';
import Button from '@/components/common/Button';
import AdMessagesButton from '@/components/dashboard/AdMessagesButton';
import { toast } from 'react-toastify';

export default function DashboardPage() {
  const router = useRouter();
  const { t, locale, isRTL } = useI18n();
  const { isAuthenticated, user } = useAuthStore();
  const deleteAdMutation = useDeleteAd();
  const logoutMutation = useLogout();
  const { hasPermission, isSuperAdmin, setPermissions } = useAdminStore();
  
  // Load permissions for admin users (needed for dashboard permission checks)
  const { data: adminPermissions } = useCurrentAdminPermissions();
  
  // Update permissions in store when they're loaded
  React.useEffect(() => {
    if (adminPermissions && user?.role?.name === 'ADMIN') {
      setPermissions(adminPermissions);
    }
  }, [adminPermissions, user, setPermissions]);

  // Check if user is Admin or Super Admin
  const isAdmin = user?.role?.name === 'ADMIN' || user?.role?.name === 'SUPER_ADMIN';

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/login');
    }
  }, [isAuthenticated, user, router]);

  // Fetch user ads with React Query (only for regular users)
  // API: GET /api/ads/user/my
  const { data: ads, isLoading, error } = useMyAds();
  

  // Fetch admin stats (only for admins)
  const { data: stats, isLoading: statsLoading, error: statsError } = useAdminStats();

  // Show error toast
  useEffect(() => {
    if (error) {
      toast.error('Failed to load your ads');
    }
  }, [error]);

  const handleDelete = async (adId: string) => {
    if (!confirm(t('ad.confirmDelete'))) return;
    try {
      await deleteAdMutation.mutateAsync(adId);
      toast.success(locale === 'fa' ? 'آگهی با موفقیت حذف شد' : 'Ad deleted successfully');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || (locale === 'fa' ? 'خطا در حذف آگهی' : 'Failed to delete ad'));
    }
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  // If user is Admin or Super Admin, show admin dashboard
  if (isAdmin) {
    if (statsLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading dashboard...</div>
        </div>
      );
    }

    if (statsError) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Failed to load dashboard statistics</p>
        </div>
      );
    }

    const statCards = [
      {
        title: 'Pending Ads',
        value: stats?.pendingAds || 0,
        icon: '⏳',
        color: 'yellow',
        href: '/admin/ads?status=PENDING_APPROVAL',
        permission: null,
      },
      {
        title: 'Approved Ads',
        value: stats?.approvedAds || 0,
        icon: '✅',
        color: 'green',
        href: '/admin/ads?status=APPROVED',
        permission: null,
      },
      {
        title: 'Rejected Ads',
        value: stats?.rejectedAds || 0,
        icon: '❌',
        color: 'red',
        href: '/admin/ads?status=REJECTED',
        permission: null,
      },
      {
        title: 'Total Ads',
        value: stats?.totalAds || 0,
        icon: '📢',
        color: 'blue',
        href: '/admin/ads',
        permission: null,
      },
      {
        title: 'Total Users',
        value: stats?.totalUsers || 0,
        icon: '👥',
        color: 'blue',
        href: '/admin/users',
        permission: 'users.view',
      },
      {
        title: 'Blocked Users',
        value: stats?.blockedUsers || 0,
        icon: '🚫',
        color: 'red',
        href: '/admin/users?isBlocked=true',
        permission: 'users.view',
      },
      {
        title: 'Total Messages',
        value: stats?.totalMessages || 0,
        icon: '💬',
        color: 'purple',
        href: '/admin/messages',
        permission: 'messages.view',
      },
      {
        title: 'Pending Reports',
        value: stats?.pendingReports || 0,
        icon: '🚩',
        color: 'orange',
        href: '/admin/reports?status=pending',
        permission: 'reports.view',
      },
      {
        title: 'Total Categories',
        value: stats?.totalCategories || 0,
        icon: '📂',
        color: 'indigo',
        href: '/admin/categories',
        permission: 'categories.manage',
      },
      {
        title: 'Total Cities',
        value: stats?.totalCities || 0,
        icon: '🏙️',
        color: 'teal',
        href: '/admin/cities',
        permission: null,
      },
    ];

    const filteredStatCards = statCards.filter((card) => {
      if (card.permission && !hasPermission(card.permission)) return false;
      return true;
    });

    // Add admins count only for Super Admin
    if (isSuperAdmin() && stats?.totalAdmins !== undefined) {
      statCards.push({
        title: 'Total Admins',
        value: stats.totalAdmins,
        icon: '🔐',
        color: 'purple',
        href: '/admin/admins',
        permission: 'admins.manage',
      });
    }

    const colorClasses = {
      yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      green: 'bg-green-50 border-green-200 text-green-800',
      red: 'bg-red-50 border-red-200 text-red-800',
      blue: 'bg-blue-50 border-blue-200 text-blue-800',
      orange: 'bg-orange-50 border-orange-200 text-orange-800',
      purple: 'bg-purple-50 border-purple-200 text-purple-800',
      indigo: 'bg-indigo-50 border-indigo-200 text-indigo-800',
      teal: 'bg-teal-50 border-teal-200 text-teal-800',
    };

    return (
      <div className="px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-2">Welcome to the admin dashboard</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
          {filteredStatCards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className={`block p-3 md:p-4 rounded-lg border-2 transition-all hover:shadow-md ${colorClasses[card.color as keyof typeof colorClasses]}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium opacity-75">{card.title}</p>
                  <p className="text-xl md:text-2xl lg:text-3xl font-bold mt-1 md:mt-2">{card.value}</p>
                </div>
                <span className="text-2xl md:text-3xl lg:text-4xl">{card.icon}</span>
              </div>
            </Link>
          ))}
        </div>

      </div>
    );
  }

  // Regular user dashboard - show my ads
  const userAds = ads || [];

  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8 pb-20 md:pb-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{t('dashboard.title')}</h1>
        <div className="flex gap-2">
          <Link href="/profile">
            <Button variant="outline" size="sm" className="hidden md:flex">
              {isRTL ? 'پروفایل' : 'Profile'}
            </Button>
          </Link>
          <Link href="/create-ad">
            <Button>{t('dashboard.createNew')}</Button>
          </Link>
        </div>
      </div>

      <div className="mb-4 flex justify-between items-center">
        <p className="text-gray-600">
          {isRTL ? 'خوش آمدید' : 'Willkommen'}, {user.name}!
        </p>
        {/* Mobile: Profile link and Logout button */}
        <div className="md:hidden flex items-center gap-3">
          <Link href="/profile">
            <button className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-sm">{isRTL ? 'پروفایل' : 'Profile'}</span>
            </button>
          </Link>
          <button
            onClick={async () => {
              try {
                await logoutMutation.mutateAsync();
                router.push('/login');
              } catch (error) {
                toast.error(locale === 'fa' ? 'خروج ناموفق بود' : 'Failed to logout');
              }
            }}
            disabled={logoutMutation.isPending}
            className="flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="text-sm">{isRTL ? 'خروج' : 'Logout'}</span>
          </button>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-6">{t('dashboard.myAds')}</h2>

      {isLoading ? (
        <div className="text-center py-8">{t('common.loading')}</div>
      ) : !userAds || userAds.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-gray-500 mb-4">{t('dashboard.noAds')}</p>
          <Link href="/create-ad">
            <Button>{t('dashboard.createNew')}</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-4">
          {userAds.map((ad) => (
            <div key={ad.id}>
              <AdCard 
                ad={ad} 
                variant="dashboard"
                showActions={true}
                showStatusBadge={true}
                onEdit={(adId) => {
                  router.push(`/edit-ad/${adId}`);
                }}
                onDelete={handleDelete}
                messagesButton={<AdMessagesButton adId={ad.id} />}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
