'use client';

import React from 'react';
import Link from 'next/link';
import { useAdminStats } from '@/lib/hooks/admin/useAdminStats';
import { useAdminStore } from '@/lib/stores/adminStore';

/**
 * Admin Dashboard Overview
 * 
 * Displays key statistics and recent activity
 */
export default function AdminDashboardPage() {
  const { data: stats, isLoading, error } = useAdminStats();
  const { hasPermission, isSuperAdmin } = useAdminStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
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

  const filteredStatCards = statCards.filter((card) => {
    if (card.permission && !hasPermission(card.permission)) return false;
    return true;
  });

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
    <div className="w-full overflow-x-hidden px-4 md:px-6 lg:px-8 py-4 md:py-6 lg:py-8">
      <div className="mb-4 md:mb-8">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-sm md:text-base text-gray-600 mt-1 md:mt-2">Welcome to the admin dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3 lg:gap-4 mb-8">
        {filteredStatCards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className={`block p-2 md:p-3 lg:p-4 rounded-lg border-2 transition-all hover:shadow-md ${colorClasses[card.color as keyof typeof colorClasses]}`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] md:text-xs lg:text-sm font-medium opacity-75 truncate">{card.title}</p>
                <p className="text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold mt-0.5 md:mt-1 lg:mt-2 break-words">{card.value}</p>
              </div>
              <span className="text-lg md:text-2xl lg:text-3xl xl:text-4xl flex-shrink-0">{card.icon}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

