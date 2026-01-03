'use client';

import React, { useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useCategory } from '@/lib/hooks/useCategories';
import { useAds } from '@/lib/hooks/useAds';
import { useCities } from '@/lib/hooks/useCities';
import { useCityStore } from '@/lib/stores/cityStore';
import AdCard from '@/components/common/AdCard';
import FilterBar, { FilterOption } from '@/components/common/FilterBar';
import { useI18n } from '@/lib/contexts/I18nContext';
import { getLocalizedCategoryName, getLocalizedName } from '@/lib/utils/localizedNames';

/**
 * Category Detail Page
 * 
 * API: GET /api/categories/:id
 * API: GET /api/ads (with category filter)
 * API: GET /api/cities
 * Displays ads in a specific category with filters
 */
export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryId = params?.id as string;
  const cityIdFromUrl = searchParams?.get('cityId') || '';
  const { locale, isRTL, t } = useI18n();
  const { selectedCityId, setSelectedCity } = useCityStore();
  const [filters, setFilters] = useState({
    cityId: '',
    minPrice: '',
    maxPrice: '',
    search: '',
  });
  const [showCitySelector, setShowCitySelector] = useState(false);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  const { data: category, isLoading: categoryLoading } = useCategory(categoryId);
  const { data: cities = [] } = useCities();
  
  // Sync cityId from URL to filters
  React.useEffect(() => {
    if (cityIdFromUrl && cityIdFromUrl !== filters.cityId) {
      if (cityIdFromUrl === 'all') {
        setFilters(prev => ({ ...prev, cityId: '' }));
      } else {
        setFilters(prev => ({ ...prev, cityId: cityIdFromUrl }));
        setSelectedCity(cityIdFromUrl);
      }
    }
  }, [cityIdFromUrl, filters.cityId, setSelectedCity, categoryId]);
  
  // Get selected city name
  const activeCityId = filters.cityId || selectedCityId;
  const selectedCity = cities.find(city => city.id === activeCityId);
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
      setFilters(prev => ({ ...prev, cityId }));
      // Update URL with cityId
      const params = new URLSearchParams();
      params.set('cityId', cityId);
      router.push(`/category/${categoryId}?${params.toString()}`);
    } else {
      // Show all cities
      setFilters(prev => ({ ...prev, cityId: '' }));
      const params = new URLSearchParams();
      params.set('cityId', 'all');
      router.push(`/category/${categoryId}?${params.toString()}`);
    }
    setShowCitySelector(false);
  };
  
  // Filter out Tehran
  const filteredCities = cities?.filter(city => {
    const cityNameFa = city.name?.fa?.toLowerCase() || '';
    const cityNameDe = city.name?.de?.toLowerCase() || '';
    const cityNameEn = city.name?.en?.toLowerCase() || '';
    return !cityNameFa.includes('تهران') && !cityNameDe.includes('tehran') && !cityNameEn.includes('tehran');
  }) || [];
  
  const { data: adsData, isLoading: adsLoading } = useAds({
    categoryId,
    // Don't send cityId if it's empty or 'all' - this shows all cities
    cityId: filters.cityId && filters.cityId !== 'all' ? filters.cityId : undefined,
    minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
    maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
    search: filters.search || undefined,
    status: 'APPROVED',
    limit: 20,
  });

  const filterOptions: FilterOption[] = [
    {
      key: 'cityId',
      label: locale === 'fa' ? 'شهر' : 'Stadt',
      type: 'select',
      options: [
        { value: '', label: locale === 'fa' ? 'همه شهرها' : 'Alle Städte' },
        ...filteredCities.map((city) => ({
          value: city.id,
          label: getLocalizedName(city.name, locale),
        })),
      ],
    },
    {
      key: 'minPrice',
      label: 'Min Price',
      type: 'number',
      placeholder: '0',
    },
    {
      key: 'maxPrice',
      label: 'Max Price',
      type: 'number',
      placeholder: '100000',
    },
    {
      key: 'search',
      label: 'Search',
      type: 'text',
      placeholder: 'Search in ads...',
    },
  ];

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setFilters({ cityId: '', minPrice: '', maxPrice: '', search: '' });
  };

  if (categoryLoading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading category...</div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Category not found</div>
      </div>
    );
  }

  const ads = adsData?.data || [];
  const pagination = adsData?.pagination;

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Search Bar with City Selector - Mobile */}
      <div className="bg-white border-b border-gray-200 md:hidden sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const query = formData.get('search') as string;
              if (query.trim()) {
                setFilters(prev => ({ ...prev, search: query }));
              }
            }}
            className="flex items-center gap-1 bg-gray-50 rounded-lg border border-gray-300 px-2 py-1.5 min-w-0"
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            {/* Search Input */}
            <input
              type="text"
              name="search"
              placeholder={isRTL ? 'جستجو در همه آگهی‌ها' : 'Suche in allen Anzeigen'}
              defaultValue={filters.search}
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
                {selectedCityName || (isRTL ? 'انتخاب شهر' : 'Stadt wählen')}
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
      
      <div className="container mx-auto px-4 py-6">
        {/* Category Header - Sticky */}
        <div className="bg-white rounded-lg border border-gray-200 p-2 md:p-3 mb-3 md:mb-4 sticky top-14 md:top-16 z-30 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {category.icon && <div className="text-2xl md:text-3xl flex-shrink-0">{category.icon}</div>}
              <div className="flex-1 min-w-0">
                <h1 className="text-lg md:text-xl font-bold text-gray-900 truncate" dir={isRTL ? 'rtl' : 'ltr'}>
                  {getLocalizedCategoryName(category.name, locale)}
                </h1>
                {category.parent && (
                  <Link
                    href={`/category/${category.parent.id}`}
                    className="text-xs text-blue-600 hover:text-blue-800"
                    dir={isRTL ? 'rtl' : 'ltr'}
                  >
                    {isRTL ? '← ' : ''}{getLocalizedCategoryName(category.parent.name, locale)}{!isRTL ? ' ←' : ''}
                  </Link>
                )}
              </div>
            </div>
            
            {/* Filter Button */}
            <button
              onClick={() => setShowFilterDrawer(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0"
              dir={isRTL ? 'rtl' : 'ltr'}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span className="text-xs font-medium hidden sm:inline">
                {isRTL ? 'فیلتر' : 'Filter'}
              </span>
            </button>
          </div>
          {category.children && category.children.length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <h3 className="text-xs font-semibold text-gray-700 mb-1.5" dir={isRTL ? 'rtl' : 'ltr'}>
                {locale === 'fa' ? 'زیردسته‌بندی‌ها' : 'Unterkategorien'}
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {category.children.map((child) => (
                  <Link
                    key={child.id}
                    href={`/category/${child.id}`}
                    className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs text-gray-700 transition-colors"
                  >
                    {child.icon && <span className="mr-1">{child.icon}</span>}
                    <span dir={isRTL ? 'rtl' : 'ltr'}>{getLocalizedCategoryName(child.name, locale)}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Filter Drawer */}
        {showFilterDrawer && (
          <>
            <div
              className="fixed inset-0 backdrop-blur-sm bg-white/30 z-50"
              onClick={() => setShowFilterDrawer(false)}
            />
            <div className={`
              fixed top-0 bottom-0 w-80 max-w-[90vw] bg-white z-50 shadow-xl overflow-y-auto
              ${isRTL ? 'left-0' : 'right-0'}
            `}>
              <div className="p-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
                <h2 className="text-lg font-bold text-gray-900">
                  {isRTL ? 'فیلترها' : 'Filter'}
                </h2>
                <button
                  onClick={() => setShowFilterDrawer(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-4">
                <FilterBar
                  filters={filters}
                  filterOptions={filterOptions}
                  onFilterChange={handleFilterChange}
                  onReset={handleReset}
                />
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => {
                      handleReset();
                      setShowFilterDrawer(false);
                    }}
                    className="flex-1 px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    {locale === 'fa' ? 'پاک کردن' : 'Zurücksetzen'}
                  </button>
                  <button
                    onClick={() => setShowFilterDrawer(false)}
                    className="flex-1 px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700"
                  >
                    {locale === 'fa' ? 'اعمال فیلتر' : 'Anwenden'}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Results */}
        <div className="mb-4 md:mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900" dir={isRTL ? 'rtl' : 'ltr'}>
            {adsLoading ? t('common.loading') : `${pagination?.total || 0} ${locale === 'fa' ? 'آگهی یافت شد' : 'Anzeigen gefunden'}`}
          </h2>
        </div>

        {adsLoading ? (
          <div className="flex flex-col">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 overflow-hidden animate-pulse mb-4">
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
        ) : ads.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-500 text-lg" dir={isRTL ? 'rtl' : 'ltr'}>
              {locale === 'fa' ? 'هیچ آگهی‌ای در این دسته‌بندی یافت نشد' : 'Keine Anzeigen in dieser Kategorie gefunden'}
            </p>
            <Link
              href="/create-ad"
              className="mt-4 inline-block px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              {locale === 'fa' ? 'ایجاد اولین آگهی' : 'Erste Anzeige erstellen'}
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {ads.map((ad) => (
                <AdCard key={ad.id} ad={ad} variant="compact" />
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-6 flex justify-center gap-2">
                <button
                  onClick={() => router.push(`/category/${categoryId}?page=${pagination.page - 1}`)}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  dir={isRTL ? 'rtl' : 'ltr'}
                >
                  {locale === 'fa' ? 'قبلی' : 'Zurück'}
                </button>
                <span className="px-4 py-2 text-sm text-gray-700" dir={isRTL ? 'rtl' : 'ltr'}>
                  {locale === 'fa' ? `صفحه ${pagination.page} از ${pagination.totalPages}` : `Seite ${pagination.page} von ${pagination.totalPages}`}
                </span>
                <button
                  onClick={() => router.push(`/category/${categoryId}?page=${pagination.page + 1}`)}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  dir={isRTL ? 'rtl' : 'ltr'}
                >
                  {locale === 'fa' ? 'بعدی' : 'Weiter'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
