'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/contexts/I18nContext';
import { useAuthStore } from '@/lib/stores/authStore';
import { useLogout } from '@/lib/hooks/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCategories } from '@/lib/hooks/useCategories';
import { useCities } from '@/lib/hooks/useCities';
import { useUnreadMessagesCount } from '@/lib/hooks/useMessages';
import { getLocalizedCategoryName, getLocalizedName } from '@/lib/utils/localizedNames';
import BackButton from '@/components/common/BackButton';
import { usePathname } from 'next/navigation';
import { useCityStore } from '@/lib/stores/cityStore';

function NavbarContent() {
  const { locale, setLocale, t, isRTL } = useI18n();
  const { isAuthenticated, user } = useAuthStore();
  const logoutMutation = useLogout();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { selectedCityId } = useCityStore();
  const urlSearchQuery = searchParams?.get('search') || '';
  const [searchInput, setSearchInput] = useState(urlSearchQuery);
  const [showCategories, setShowCategories] = useState(false);
  const [showCities, setShowCities] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const citiesRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  
  // Show back button if not on home page
  const showBackButton = pathname !== '/' && !pathname?.startsWith('/admin');
  
  // Fetch categories and cities from backend
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { data: cities = [], isLoading: citiesLoading } = useCities();
  const { data: unreadCount = 0, isLoading: unreadCountLoading, error: unreadCountError } = useUnreadMessagesCount();
  
  // Debug: Log unread count
  React.useEffect(() => {
    if (isAuthenticated) {
      console.log('Navbar - Unread count:', unreadCount, 'Loading:', unreadCountLoading, 'Error:', unreadCountError);
    }
  }, [unreadCount, unreadCountLoading, unreadCountError, isAuthenticated]);

  // Sync search input with URL query
  useEffect(() => {
    setSearchInput(urlSearchQuery);
  }, [urlSearchQuery]);

  // Auto-search when user types 3+ characters (with debounce) - only on home page
  useEffect(() => {
    if (pathname !== '/') return; // Only auto-search on home page
    
    const trimmedInput = searchInput.trim();
    
    // Only search if input has 3+ characters or is empty (to clear search)
    if (trimmedInput.length >= 3 || trimmedInput.length === 0) {
      const timeoutId = setTimeout(() => {
        // Only update URL if different from current search query
        if (trimmedInput !== urlSearchQuery) {
          const params = new URLSearchParams();
          if (selectedCityId) {
            params.set('cityId', selectedCityId);
          }
          if (trimmedInput) {
            params.set('search', trimmedInput);
          }
          router.push(`/?${params.toString()}`);
        }
      }, 500); // 500ms debounce

      return () => clearTimeout(timeoutId);
    }
  }, [searchInput, urlSearchQuery, selectedCityId, router, pathname]);
  
  // Filter out Tehran and get only parent categories
  const filteredCities = cities.filter(city => {
    const cityNameFa = city.name?.fa?.toLowerCase() || '';
    const cityNameDe = city.name?.de?.toLowerCase() || '';
    const cityNameEn = city.name?.en?.toLowerCase() || '';
    return !cityNameFa.includes('تهران') && !cityNameDe.includes('tehran') && !cityNameEn.includes('tehran');
  });
  
  const parentCategories = categories.filter(cat => !cat.parentId);
  
  // Get selected city display name
  const selectedCityName = selectedCity 
    ? getLocalizedName(filteredCities.find(c => c.id === selectedCity)?.name, locale)
    : (locale === 'fa' ? 'همه شهرها' : 'Alle Städte');
  
  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoriesRef.current && !categoriesRef.current.contains(event.target as Node)) {
        setShowCategories(false);
      }
      if (citiesRef.current && !citiesRef.current.contains(event.target as Node)) {
        setShowCities(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = searchInput.trim();
    if (trimmedInput) {
      const params = new URLSearchParams();
      if (selectedCityId) {
        params.set('cityId', selectedCityId);
      }
      params.set('search', trimmedInput);
      router.push(`/?${params.toString()}`);
    }
  };

  const toggleLocale = () => {
    setLocale(locale === 'fa' ? 'de' : 'fa');
  };

  return (
    <nav className="hidden md:block bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Left side - Back Button, Logo and Location */}
          <div className="flex items-center gap-4 flex-shrink-0">
            {/* Back Button */}
            {showBackButton && <BackButton variant="icon-only" />}
            
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">{isRTL ? 'دی' : 'A'}</span>
              </div>
              <span className="text-xl font-bold text-gray-900 mr-2 hidden sm:inline">
                {isRTL ? 'دیوار' : 'Anzeigen'}
              </span>
            </Link>

            {/* Location Selector */}
            <div className="hidden md:block relative" ref={citiesRef}>
              <button
                onClick={() => {
                  setShowCities(!showCities);
                  setShowCategories(false);
                }}
                className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-lg hover:border-red-500 transition-colors"
              >
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm font-medium text-gray-700" dir={isRTL ? 'rtl' : 'ltr'}>
                  {citiesLoading ? t('common.loading') : selectedCityName}
                </span>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Cities Dropdown */}
              {showCities && (
                <div className={`absolute top-full ${isRTL ? 'right-0' : 'left-0'} mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto`}>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setSelectedCity(null);
                        setShowCities(false);
                        router.push('/');
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      dir={isRTL ? 'rtl' : 'ltr'}
                    >
                      {locale === 'fa' ? 'همه شهرها' : 'Alle Städte'}
                    </button>
                    {filteredCities.map((city) => (
                      <Link
                        key={city.id}
                        href={`/?cityId=${city.id}`}
                        onClick={() => {
                          setSelectedCity(city.id);
                          setShowCities(false);
                        }}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        dir={isRTL ? 'rtl' : 'ltr'}
                      >
                        {getLocalizedName(city.name, locale)}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Categories Dropdown */}
            <div className="hidden md:block relative" ref={categoriesRef}>
              <button
                onClick={() => {
                  setShowCategories(!showCategories);
                  setShowCities(false);
                }}
                className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-lg hover:border-red-500 transition-colors"
              >
                <span className="text-sm font-medium text-gray-700">{t('nav.categories')}</span>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Categories Dropdown Menu */}
              {showCategories && (
                <div className={`absolute top-full ${isRTL ? 'right-0' : 'left-0'} mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto`}>
                  <div className="py-1">
                    <Link
                      href="/categories"
                      onClick={() => setShowCategories(false)}
                      className="block px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-100 border-b border-gray-200"
                      dir={isRTL ? 'rtl' : 'ltr'}
                    >
                      {locale === 'fa' ? 'همه دسته‌بندی‌ها' : 'Alle Kategorien'}
                    </Link>
                    {categoriesLoading ? (
                      <div className="px-4 py-2 text-sm text-gray-500">{t('common.loading')}</div>
                    ) : (
                      parentCategories.map((category) => (
                        <Link
                          key={category.id}
                          href={`/category/${category.id}`}
                          onClick={() => setShowCategories(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          dir={isRTL ? 'rtl' : 'ltr'}
                        >
                          {getLocalizedCategoryName(category.name, locale)}
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Center - Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-4 hidden md:block">
            <div className="relative flex items-center">
              <span className={`absolute ${isRTL ? 'right-4' : 'left-4'} text-sm text-gray-500 pointer-events-none z-10`}>
                {isRTL ? 'جستجو' : 'Search'}
              </span>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder=""
                className={`w-full py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm bg-gray-50 ${
                  isRTL ? 'pl-4 pr-16' : 'pr-4 pl-16'
                }`}
                dir={isRTL ? 'rtl' : 'ltr'}
              />
              <button
                type="submit"
                className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-600 z-10`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </form>

          {/* Right side - Navigation */}
          <div className="flex items-center gap-2 sm:gap-3">
            {isAuthenticated ? (
              <>
                {(user?.role?.name === 'ADMIN' || user?.role?.name === 'SUPER_ADMIN') && (
                  <Link 
                    href="/admin" 
                    className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-700 hover:text-red-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span className="hidden lg:inline">{isRTL ? 'پنل مدیریت' : 'Admin Panel'}</span>
                  </Link>
                )}
                <Link 
                  href="/dashboard" 
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-700 hover:text-red-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="hidden lg:inline">{isRTL ? 'دیوار من' : 'Mein Bereich'}</span>
                </Link>
                <Link 
                  href="/messages" 
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-700 hover:text-red-600 transition-colors"
                >
                  <div className="relative inline-flex">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    {isAuthenticated && typeof unreadCount === 'number' && unreadCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center min-w-[20px] px-1 shadow-lg z-10 leading-none">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </div>
                  <span className="hidden lg:inline">{isRTL ? 'چت و تماس' : 'Chat'}</span>
                </Link>
                <Link 
                  href="/support" 
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-700 hover:text-red-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="hidden lg:inline">{isRTL ? 'پشتیبانی' : 'Support'}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-700 hover:text-red-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="hidden lg:inline">{isRTL ? 'خروج' : 'Logout'}</span>
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-700 hover:text-red-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="hidden lg:inline">{t('nav.login')}</span>
                </Link>
              </>
            )}

            {/* Post Ad Button */}
            <Link 
              href="/create-ad" 
              className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">{isRTL ? 'ثبت آگهی' : 'Anzeige aufgeben'}</span>
            </Link>

            {/* Language Toggle - Hidden on mobile */}
            <button
              onClick={toggleLocale}
              className="hidden md:block px-2 py-1 text-xs font-medium text-gray-600 hover:text-red-600 border border-gray-300 rounded hover:border-red-600 transition-colors"
            >
              {locale === 'fa' ? 'DE' : 'FA'}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default function Navbar() {
  return (
    <Suspense fallback={
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-2 sm:px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <Link href="/" className="text-xl sm:text-2xl font-bold text-red-600">
                آگهی‌ها
              </Link>
            </div>
          </div>
        </div>
      </nav>
    }>
      <NavbarContent />
    </Suspense>
  );
}
