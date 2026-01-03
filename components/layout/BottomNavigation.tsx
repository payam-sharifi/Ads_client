'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/lib/contexts/I18nContext';
import { useAuthStore } from '@/lib/stores/authStore';
import { useUnreadMessagesCount } from '@/lib/hooks/useMessages';

export default function BottomNavigation() {
  const pathname = usePathname();
  const { isRTL } = useI18n();
  const { isAuthenticated, user } = useAuthStore();
  // Only fetch unread count when authenticated - hook already handles this
  const { data: unreadCount = 0 } = useUnreadMessagesCount();

  // Check if user is Admin or Super Admin
  const isAdmin = user?.role?.name === 'ADMIN' || user?.role?.name === 'SUPER_ADMIN';

  // Base navigation items for all users
  const baseNavItems: Array<{
    id: string;
    href: string;
    icon: React.ReactNode;
    label: string;
    active: boolean;
    highlight?: boolean;
  }> = [
    {
      id: 'home',
      href: '/',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      label: isRTL ? 'آگهی‌ها' : 'Anzeigen',
      active: pathname === '/',
    },
    {
      id: 'messages',
      href: isAuthenticated ? '/messages' : '/login',
      icon: (
        <div className="relative w-5 h-5 flex items-center justify-center">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          {isAuthenticated && typeof unreadCount === 'number' && unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
      ),
      label: isRTL ? 'چت و تماس' : 'Chat & Kontakt',
      active: pathname?.startsWith('/messages'),
    },
  ];

  // Add items based on user role
  if (isAdmin && isAuthenticated) {
    // For Admin/Super Admin: Add admin panel (middle), Ads, then Profile
    baseNavItems.push({
      id: 'admin',
      href: '/admin',
      icon: (
        <svg className=" h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      label: isRTL ? 'پنل مدیریت' : 'Admin',
      active: pathname === '/admin' || (pathname?.startsWith('/admin') && pathname !== '/admin/ads'),
      highlight: true,
    });
    baseNavItems.push({
      id: 'ads',
      href: '/admin/ads',
      icon: (
        <svg className="h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h10m-7 4h7M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      label: isRTL ? 'آگهی‌ها' : 'Ads',
      active: pathname?.startsWith('/admin/ads'),
    });
  } else {
    // For regular users: Add create-ad and favorites
    baseNavItems.push({
      id: 'create-ad',
      href: isAuthenticated ? '/create-ad' : '/login',
      icon: (
        <svg className="h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
      label: isRTL ? 'ثبت آگهی' : 'Anzeige aufgeben',
      active: pathname === '/create-ad',
      highlight: true,
    });
    baseNavItems.push({
      id: 'favorites',
      href: isAuthenticated ? '/dashboard/bookmarked' : '/login',
      icon: (
        <svg className="h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      ),
      label: isRTL ? 'نشان‌ها' : 'Gespeichert',
      active: pathname === '/dashboard/bookmarked',
    });
  }

  // Add dashboard/profile for all users (mobile: "دیوار من" goes to dashboard)
  baseNavItems.push({
    id: 'dashboard',
    href: isAuthenticated ? '/dashboard' : '/login',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    label: isRTL ? 'دیوار من' : 'Mein Divar',
    active: pathname === '/dashboard' || pathname?.startsWith('/dashboard'),
  });

  const navItems = baseNavItems;

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-[9999] md:hidden safe-area-inset-bottom" 
      style={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        width: '100vw',
        maxWidth: '100%',
        overflowX: 'hidden',
        paddingBottom: 'env(safe-area-inset-bottom, 0)'
      }}
    >
      <div 
        className="flex justify-between items-center h-14 w-full overflow-hidden"
        style={{ width: '100%', maxWidth: '100%', overflowX: 'hidden', boxSizing: 'border-box' }}
      >
        {navItems.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={`
              flex flex-col items-center justify-center flex-1 h-full
              transition-colors duration-200
              ${item.active 
                ? 'text-red-600' 
                : 'text-gray-600 hover:text-gray-900'
              }
            `}
            style={{ 
              flex: '1 1 0%', 
              minWidth: 0, 
              maxWidth: `${100 / navItems.length}%`,
              overflow: 'hidden',
              boxSizing: 'border-box'
            }}
          >
            <div className={`
              relative flex items-center justify-center
              ${item.highlight 
                ? 'bg-red-600 text-white rounded-full p-1.5 -mt-0.5' 
                : ''
              }
            `}>
              <div className="w-5 h-5 flex items-center justify-center">
                {item.icon}
              </div>
            </div>
            <span className={`
              text-[9px] leading-tight mt-0.5 text-center truncate w-full
              ${item.highlight ? 'text-red-600 font-semibold' : ''}
            `}>
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

