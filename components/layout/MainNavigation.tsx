'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/authStore';
import { useCategories } from '@/lib/hooks/useCategories';
import { useLogout } from '@/lib/hooks/useAuth';
import { useI18n } from '@/lib/contexts/I18nContext';
import { useUnreadMessagesCount } from '@/lib/hooks/useMessages';
import { getLocalizedCategoryName } from '@/lib/utils/localizedNames';

/**
 * Main Navigation Component
 * 
 * Divar.ir-style navigation with:
 * - Logo/Brand
 * - Categories dropdown
 * - Search bar
 * - User menu
 * - Post ad button
 */
export default function MainNavigation() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const { locale } = useI18n();
  const { data: categories } = useCategories();
  const { data: unreadCount = 0 } = useUnreadMessagesCount();
  const logoutMutation = useLogout();
  const [showCategoriesMenu, setShowCategoriesMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isAdmin = user?.role?.name === 'ADMIN' || user?.role?.name === 'SUPER_ADMIN';

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">C</span>
            </div>
            <span className="text-xl font-bold text-gray-900 hidden sm:block">Classified Ads</span>
          </Link>

          {/* Categories Menu */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setShowCategoriesMenu(!showCategoriesMenu)}
              className="px-4 py-2 text-gray-700 hover:text-red-600 font-medium flex items-center gap-2"
            >
              Categories
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showCategoriesMenu && categories && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowCategoriesMenu(false)}
                />
                <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg border border-gray-200 shadow-lg z-50 max-h-96 overflow-y-auto">
                  <div className="p-4">
                    <Link
                      href="/categories"
                      className="block px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 rounded-lg mb-2"
                    >
                      View All Categories
                    </Link>
                    <div className="space-y-1">
                      {categories.slice(0, 10).map((category) => (
                        <Link
                          key={category.id}
                          href={`/category/${category.id}`}
                          onClick={() => setShowCategoriesMenu(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
                        >
                          {category.icon && <span className="text-xl">{category.icon}</span>}
                          <span>{getLocalizedCategoryName(category.name, locale)}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-4 hidden md:block">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ads..."
                className="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </form>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link
                  href="/create-ad"
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm hidden sm:block"
                >
                  + Post Ad
                </Link>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-red-600"
                  >
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <span className="hidden sm:block text-sm font-medium">{user?.name}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showUserMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowUserMenu(false)}
                      />
                      <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg border border-gray-200 shadow-lg z-50">
                        <div className="py-2">
                          <Link
                            href="/dashboard"
                            onClick={() => setShowUserMenu(false)}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            My Ads
                          </Link>
                          <Link
                            href="/messages"
                            onClick={() => setShowUserMenu(false)}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 relative"
                          >
                            Messages
                            {unreadCount > 0 && (
                              <span className="ml-2 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 inline-flex items-center justify-center min-w-[20px] px-1">
                                {unreadCount > 99 ? '99+' : unreadCount}
                              </span>
                            )}
                          </Link>
                          <Link
                            href="/profile"
                            onClick={() => setShowUserMenu(false)}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          >
                            Profile
                          </Link>
                          {isAdmin && (
                            <Link
                              href="/admin"
                              onClick={() => setShowUserMenu(false)}
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 border-t border-gray-200 mt-2"
                            >
                              Admin Dashboard
                            </Link>
                          )}
                          <button
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 border-t border-gray-200 mt-2"
                          >
                            Logout
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-gray-700 hover:text-red-600 font-medium text-sm"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

