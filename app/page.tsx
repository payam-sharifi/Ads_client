'use client';

import React, { Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useI18n } from '@/lib/contexts/I18nContext';
import { useCategories } from '@/lib/hooks/useCategories';
import { useInfiniteAds } from '@/lib/hooks/useAds';
import { useCities } from '@/lib/hooks/useCities';
import { useCityStore } from '@/lib/stores/cityStore';
import AdCard from '@/components/common/AdCard';
import { toast } from 'react-toastify';
import { getLocalizedCategoryName, getLocalizedName } from '@/lib/utils/localizedNames';
import CitySelectionLanding from '@/components/landing/CitySelectionLanding';
import BottomNavigation from '@/components/layout/BottomNavigation';

function HomePageContent() {
  const { t, locale, isRTL } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams?.get('search') || '';
  const cityIdFromUrl = searchParams?.get('cityId') || '';
  const { selectedCityId, hasSelectedCity, setSelectedCity } = useCityStore();

  // Use cityId from URL or store
  // 'all' means show all cities, empty means show landing page
  const activeCityId = cityIdFromUrl || selectedCityId;

  // Fetch categories and cities - always call hooks, even if we'll show landing page
  const { data: categories, isLoading: categoriesLoading, error: categoriesError } = useCategories();
  const { data: cities = [] } = useCities();
  const [showCitySelector, setShowCitySelector] = React.useState(false);
  const [searchInput, setSearchInput] = React.useState(searchQuery);

  // If cityId is in URL, save it to store (but not if it's 'all')
  useEffect(() => {
    if (cityIdFromUrl && cityIdFromUrl !== 'all' && cityIdFromUrl !== selectedCityId) {
      setSelectedCity(cityIdFromUrl);
    }
  }, [cityIdFromUrl, selectedCityId, setSelectedCity]);

  // Sync search input with URL query
  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  // Auto-search when user types 3+ characters (with debounce)
  useEffect(() => {
    const trimmedInput = searchInput.trim();
    
    // Only search if input has 3+ characters or is empty (to clear search)
    if (trimmedInput.length >= 3 || trimmedInput.length === 0) {
      const timeoutId = setTimeout(() => {
        // Only update URL if different from current search query
        if (trimmedInput !== searchQuery) {
          const params = new URLSearchParams();
          if (activeCityId) {
            params.set('cityId', activeCityId);
          }
          if (trimmedInput) {
            params.set('search', trimmedInput);
          }
          router.push(`/?${params.toString()}`);
        }
      }, 500); // 500ms debounce

      return () => clearTimeout(timeoutId);
    }
  }, [searchInput, searchQuery, activeCityId, router]);

  // Fetch ads with infinite scroll support
  // API: GET /api/ads (public - only shows APPROVED ads)
  // Only fetch if we have a city selected
  const {
    data: adsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: adsLoading,
    error: adsError,
  } = useInfiniteAds({
    status: 'APPROVED', // Backend only shows APPROVED ads to public
    search: searchQuery || undefined,
    cityId: activeCityId && activeCityId !== 'all' ? activeCityId : undefined, // Don't send 'all' to API
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'DESC',
  });

  // Show error toasts
  React.useEffect(() => {
    if (categoriesError) {
      toast.error('Failed to load categories');
    }
    if (adsError) {
      toast.error('Failed to load ads');
    }
  }, [categoriesError, adsError]);

  // Intersection Observer for infinite scroll - must be called before conditional return
  const loadMoreRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!activeCityId || !loadMoreRef.current || !hasNextPage || isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(loadMoreRef.current);

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [activeCityId, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Sync search input with URL query
  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  // Auto-search when user types 3+ characters (with debounce)
  useEffect(() => {
    const trimmedInput = searchInput.trim();
    
    // Only search if input has 3+ characters or is empty (to clear search)
    if (trimmedInput.length >= 3 || trimmedInput.length === 0) {
      const timeoutId = setTimeout(() => {
        // Only update URL if different from current search query
        if (trimmedInput !== searchQuery) {
          const params = new URLSearchParams();
          if (activeCityId) {
            params.set('cityId', activeCityId);
          }
          if (trimmedInput) {
            params.set('search', trimmedInput);
          }
          router.push(`/?${params.toString()}`);
        }
      }, 500); // 500ms debounce

      return () => clearTimeout(timeoutId);
    }
  }, [searchInput, searchQuery, activeCityId, router]);

  // Show landing page only if no city is selected (not 'all')
  // 'all' means show all cities, so don't show landing page
  if (!activeCityId || activeCityId === '') {
    return <CitySelectionLanding />;
  }

  // Main page content when city is selected
  const loading = categoriesLoading || adsLoading;
  
  // Flatten infinite query pages into a single array
  const recentAds = adsData?.pages.flatMap((page) => page.data) || [];
  // Filter only main categories (with categoryType, no parent)
  const parentCategories = categories?.filter(cat => !cat.parentId && cat.categoryType) || [];
  
  // Get selected city name
  const selectedCity = activeCityId && activeCityId !== 'all' ? cities.find(city => city.id === activeCityId) : null;
  const selectedCityName = selectedCity ? getLocalizedName(selectedCity.name, locale) : '';
  
  // Filter cities for selector (exclude Tehran)
  const availableCities = cities.filter(city => {
    const cityNameFa = city.name?.fa?.toLowerCase() || '';
    const cityNameDe = city.name?.de?.toLowerCase() || '';
    const cityNameEn = city.name?.en?.toLowerCase() || '';
    return !cityNameFa.includes('تهران') && !cityNameDe.includes('tehran') && !cityNameEn.includes('tehran');
  });
  
  const handleCityChange = (cityId: string | null) => {
    if (cityId) {
      setSelectedCity(cityId);
      router.push(`/?cityId=${cityId}${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''}`);
    } else {
      // Show all cities - use 'all' as special value
      setSelectedCity('all');
      router.push(`/?cityId=all${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''}`);
    }
    setShowCitySelector(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
      {/* Search Bar with City Selector - Mobile */}
      <div className="bg-white border-b border-gray-200 md:hidden sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const trimmedInput = searchInput.trim();
              if (trimmedInput) {
                router.push(`/?cityId=${activeCityId}&search=${encodeURIComponent(trimmedInput)}`);
              }
            }}
            className="flex items-center gap-1 bg-gray-50 rounded-lg border border-gray-300 px-2 py-1.5 min-w-0"
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            {/* Search Input */}
            <input
              type="text"
              name="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={isRTL ? 'جستجو در همه آگهی‌ها' : 'Suche in allen Anzeigen'}
              className="flex-1 bg-transparent text-gray-700 text-xs outline-none placeholder-gray-500 min-w-0"
              dir={isRTL ? 'rtl' : 'ltr'}
              style={{ fontSize: '12px' }}
            />
            
            {/* Separator */}
            <div className="h-3 w-px bg-gray-300 flex-shrink-0" />
            
            {/* Search Icon Button */}
            <button
              type="submit"
              className="text-gray-500 hover:text-gray-700 transition-colors flex-shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            
            {/* Separator */}
            <div className="h-3 w-px bg-gray-300 flex-shrink-0" />
            
            {/* City Selector Button */}
            <button
              type="button"
              onClick={() => setShowCitySelector(true)}
              className="flex items-center gap-1 text-gray-700 hover:text-gray-900 transition-colors flex-shrink-0 min-w-0"
            >
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-xs font-medium truncate max-w-[60px] sm:max-w-none" style={{ fontSize: '11px' }}>
                {activeCityId === 'all' 
                  ? (isRTL ? 'همه شهرها' : 'Alle Städte')
                  : (selectedCityName || (isRTL ? 'انتخاب شهر' : 'Stadt wählen'))
                }
              </span>
            </button>
          </form>
        </div>
      </div>
      
      {/* City Selector Modal - Mobile */}
      {showCitySelector && (
        <>
          <div
            className="fixed inset-0 backdrop-blur-sm bg-white/30 z-50 md:hidden"
            onClick={() => setShowCitySelector(false)}
          />
          <div className={`fixed ${isRTL ? 'left-0' : 'right-0'} top-0 bottom-0 w-80 bg-white z-50 md:hidden overflow-y-auto shadow-xl`}>
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                {isRTL ? 'انتخاب شهر' : 'Stadt wählen'}
              </h2>
              <button
                onClick={() => setShowCitySelector(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <div className="space-y-2">
                {/* All Cities Option */}
                <button
                  onClick={() => handleCityChange(null)}
                  className={`
                    w-full text-right px-4 py-3 rounded-lg border transition-all
                    ${activeCityId === 'all'
                      ? 'bg-red-50 border-red-300 text-red-700 font-medium'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-red-300 hover:bg-gray-50'
                    }
                  `}
                  dir={isRTL ? 'rtl' : 'ltr'}
                >
                  {isRTL ? 'همه شهرها' : 'Alle Städte'}
                </button>
                
                {/* Cities List */}
                {availableCities.map((city) => {
                  const cityName = getLocalizedName(city.name, locale) || 'Unknown';
                  const isSelected = city.id === activeCityId;
                  return (
                    <button
                      key={city.id}
                      onClick={() => handleCityChange(city.id)}
                      className={`
                        w-full text-right px-4 py-3 rounded-lg border transition-all
                        ${isSelected
                          ? 'bg-red-50 border-red-300 text-red-700 font-medium'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-red-300 hover:bg-gray-50'
                        }
                      `}
                      dir={isRTL ? 'rtl' : 'ltr'}
                    >
                      {cityName}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}

      <div className="container mx-auto px-3 py-3">
        {/* Categories Grid */}
        <div className="mb-6">
          <div className="grid grid-cols-4 gap-3 md:gap-4">
            {parentCategories.slice(0, 8).map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.id}${activeCityId && activeCityId !== 'all' ? `?cityId=${activeCityId}` : ''}`}
                className="flex flex-col items-center justify-center bg-white rounded-lg border border-gray-200 p-1 hover:border-red-300 hover:shadow-md transition-all group"
              >
                <div className="text-2xl md:text-4xl mb-2 group-hover:scale-110 transition-transform">
                  {category.icon || '📦'}
                </div>
                <span className="text-xs md:text-sm font-medium text-gray-700 text-center line-clamp-2 group-hover:text-red-600 transition-colors">
                  {getLocalizedCategoryName(category.name, locale) || 'N/A'}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Page Title */}
        <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">
          {isRTL ? 'انواع آگهی‌ها و نیازمندی‌ها' : 'Alle Anzeigen und Bedarfe'}
        </h2>

        {/* Ads List */}
        {loading ? (
          <div className="flex flex-col">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-lg border border-gray-200 overflow-hidden mb-4">
                <div className="flex">
                  <div className="w-32 h-32 bg-gray-200 flex-shrink-0"></div>
                  <div className="p-3 space-y-3 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : recentAds.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-500">{t('home.noAds')}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {recentAds.map((ad) => (
                <AdCard key={ad.id} ad={ad} variant="compact" />
              ))}
            </div>
            
            {/* Infinite Scroll Trigger */}
            {hasNextPage && (
              <div ref={loadMoreRef} className="py-8 flex justify-center">
                {isFetchingNextPage ? (
                  <div className="flex items-center gap-2 text-gray-500">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
                    <span>{isRTL ? 'در حال بارگذاری...' : 'Lädt...'}</span>
                  </div>
                ) : (
                  <div className="h-8" /> // Spacer for intersection observer
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="bg-gray-50 min-h-screen flex items-center justify-center">
          <div className="text-gray-500">Loading...</div>
        </div>
      }
    >
      <HomePageContent />
    </Suspense>
  );
}
