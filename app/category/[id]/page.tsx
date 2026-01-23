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
import { MainCategoryType } from '@/lib/types/category.types';

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
  const pageFromUrl = searchParams?.get('page') || '1';
  const { locale, isRTL, t } = useI18n();
  const { selectedCityId, setSelectedCity } = useCityStore();
  
  // Initialize cityId from URL or store
  const initialCityId = cityIdFromUrl && cityIdFromUrl !== 'all' ? cityIdFromUrl : (selectedCityId && selectedCityId !== 'all' ? selectedCityId : '');
  
  // Initialize filters from URL search params
  const getInitialFilters = () => {
    if (typeof window === 'undefined') {
      return {
        cityId: initialCityId,
        minPrice: '',
        maxPrice: '',
        search: '',
        condition: '',
        offerType: '',
        propertyType: '',
        minArea: '',
        maxArea: '',
        rooms: '',
        brand: '',
        model: '',
        minYear: '',
        maxYear: '',
        maxMileage: '',
        fuelType: '',
        transmission: '',
        serviceCategory: '',
        pricingType: '',
        jobType: '',
        experienceLevel: '',
        minSalary: '',
        maxSalary: '',
      };
    }
    const params = new URLSearchParams(window.location.search);
    return {
      cityId: params.get('cityId') || initialCityId,
      minPrice: params.get('minPrice') || '',
      maxPrice: params.get('maxPrice') || '',
      search: params.get('search') || '',
      condition: params.get('condition') || '',
      // Real Estate filters
      offerType: params.get('offerType') || '',
      propertyType: params.get('propertyType') || '',
      minArea: params.get('minArea') || '',
      maxArea: params.get('maxArea') || '',
      rooms: params.get('rooms') || '',
      // Vehicle filters
      brand: params.get('brand') || '',
      model: params.get('model') || '',
      minYear: params.get('minYear') || '',
      maxYear: params.get('maxYear') || '',
      maxMileage: params.get('maxMileage') || '',
      fuelType: params.get('fuelType') || '',
      transmission: params.get('transmission') || '',
      // Service filters
      serviceCategory: params.get('serviceCategory') || '',
      pricingType: params.get('pricingType') || '',
      // Job filters
      jobType: params.get('jobType') || '',
      experienceLevel: params.get('experienceLevel') || '',
      minSalary: params.get('minSalary') || '',
      maxSalary: params.get('maxSalary') || '',
    };
  };

  const [filters, setFilters] = useState(getInitialFilters());
  const [showCitySelector, setShowCitySelector] = useState(false);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  // Temporary filters for editing in drawer (only applied when drawer is closed)
  const [tempFilters, setTempFilters] = useState(filters);

  const { data: category, isLoading: categoryLoading } = useCategory(categoryId);
  const { data: cities = [] } = useCities();
  
  // Sync filters from URL search params when they change
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const params = new URLSearchParams(window.location.search);
    const updatedFilters: any = {};
    
    const filterKeys = [
      'cityId', 'minPrice', 'maxPrice', 'search', 'condition',
      'offerType', 'propertyType', 'minArea', 'maxArea', 'rooms',
      'brand', 'model', 'minYear', 'maxYear', 'maxMileage', 'fuelType', 'transmission',
      'serviceCategory', 'pricingType',
      'jobType', 'experienceLevel', 'minSalary', 'maxSalary'
    ];

    let hasChanges = false;
    filterKeys.forEach(key => {
      const value = params.get(key) || '';
      if (filters[key as keyof typeof filters] !== value) {
        updatedFilters[key] = value;
        hasChanges = true;
      } else {
        updatedFilters[key] = filters[key as keyof typeof filters];
      }
    });

    if (hasChanges) {
      setFilters(updatedFilters);
      
      // Also sync city store if cityId changed
      if (updatedFilters.cityId && updatedFilters.cityId !== selectedCityId) {
        setSelectedCity(updatedFilters.cityId);
      }
    }
  }, [searchParams, selectedCityId, setSelectedCity]);
  
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
    const params = new URLSearchParams(window.location.search);
    params.delete('page'); // Reset to first page
    if (cityId) {
      setSelectedCity(cityId);
      setFilters(prev => ({ ...prev, cityId }));
      params.set('cityId', cityId);
    } else {
      setFilters(prev => ({ ...prev, cityId: '' }));
      params.set('cityId', 'all');
    }
    router.push(`/category/${categoryId}?${params.toString()}`);
    setShowCitySelector(false);
  };
  
  // Filter out Tehran
  const filteredCities = cities?.filter(city => {
    const cityNameFa = city.name?.fa?.toLowerCase() || '';
    const cityNameDe = city.name?.de?.toLowerCase() || '';
    const cityNameEn = city.name?.en?.toLowerCase() || '';
    return !cityNameFa.includes('تهران') && !cityNameDe.includes('tehran') && !cityNameEn.includes('tehran');
  }) || [];
  
  // Build query params from filters - only include non-empty values
  const adsQueryParams: Record<string, any> = {
    categoryId,
    status: 'APPROVED',
    limit: 20,
    page: Number(pageFromUrl),
  };
  
  // Add cityId if not empty and not 'all'
  if (filters.cityId && filters.cityId !== 'all') {
    adsQueryParams.cityId = filters.cityId;
  }
  
  // Add price filters if they have values
  if (filters.minPrice) {
    adsQueryParams.minPrice = Number(filters.minPrice);
  }
  if (filters.maxPrice) {
    adsQueryParams.maxPrice = Number(filters.maxPrice);
  }
  
  // Add search if it has a value
  if (filters.search) {
    adsQueryParams.search = filters.search;
  }
  
  if (filters.condition) {
    adsQueryParams.condition = filters.condition;
  }
  
  // Add category-specific filters if they have values (will be passed to API, backend may need to support them)
  if (filters.offerType) {
    adsQueryParams.offerType = filters.offerType;
  }
  if (filters.propertyType) {
    adsQueryParams.propertyType = filters.propertyType;
  }
  if (filters.minArea) {
    adsQueryParams.minArea = Number(filters.minArea);
  }
  if (filters.maxArea) {
    adsQueryParams.maxArea = Number(filters.maxArea);
  }
  if (filters.rooms) {
    adsQueryParams.rooms = filters.rooms;
  }
  if (filters.brand) {
    adsQueryParams.brand = filters.brand;
  }
  if (filters.model) {
    adsQueryParams.model = filters.model;
  }
  if (filters.minYear) {
    adsQueryParams.minYear = Number(filters.minYear);
  }
  if (filters.maxYear) {
    adsQueryParams.maxYear = Number(filters.maxYear);
  }
  if (filters.maxMileage) {
    adsQueryParams.maxMileage = Number(filters.maxMileage);
  }
  if (filters.fuelType) {
    adsQueryParams.fuelType = filters.fuelType;
  }
  if (filters.transmission) {
    adsQueryParams.transmission = filters.transmission;
  }
  if (filters.serviceCategory) {
    adsQueryParams.serviceCategory = filters.serviceCategory;
  }
  if (filters.pricingType) {
    adsQueryParams.pricingType = filters.pricingType;
  }
  if (filters.jobType) {
    adsQueryParams.jobType = filters.jobType;
  }
  if (filters.experienceLevel) {
    adsQueryParams.experienceLevel = filters.experienceLevel;
  }
  if (filters.minSalary) {
    adsQueryParams.minSalary = Number(filters.minSalary);
  }
  if (filters.maxSalary) {
    adsQueryParams.maxSalary = Number(filters.maxSalary);
  }
  
  const { data: adsData, isLoading: adsLoading } = useAds(adsQueryParams);

  // Get category type
  const categoryType = category?.categoryType as MainCategoryType | undefined;

  // Build filter options based on category type
  const getFilterOptions = (): FilterOption[] => {
    const baseFilters: FilterOption[] = [];

    if (!categoryType) {
      // Default filters for unknown category types
      return [
        ...baseFilters,
        {
          key: 'minPrice',
          label: locale === 'fa' ? 'حداقل قیمت (€)' : 'Min Price (€)',
          type: 'number',
          placeholder: '0',
        },
        {
          key: 'maxPrice',
          label: locale === 'fa' ? 'حداکثر قیمت (€)' : 'Max Price (€)',
          type: 'number',
          placeholder: '100000',
        },
      ];
    }

    switch (categoryType) {
      case MainCategoryType.REAL_ESTATE:
        return [
          ...baseFilters,
          {
            key: 'offerType',
            label: locale === 'fa' ? 'نوع معامله' : 'Transaction Type',
            type: 'select',
            options: [
              { value: '', label: locale === 'fa' ? 'همه' : 'All' },
              { value: 'sale', label: locale === 'fa' ? 'فروش' : 'Sale' },
              { value: 'rent', label: locale === 'fa' ? 'اجاره' : 'Rent' },
            ],
          },
          {
            key: 'propertyType',
            label: locale === 'fa' ? 'نوع ملک' : 'Property Type',
            type: 'select',
            options: [
              { value: '', label: locale === 'fa' ? 'همه' : 'All' },
              { value: 'apartment', label: locale === 'fa' ? 'آپارتمان' : 'Apartment' },
              { value: 'house', label: locale === 'fa' ? 'خانه' : 'House' },
              { value: 'commercial', label: locale === 'fa' ? 'تجاری' : 'Commercial' },
              { value: 'land', label: locale === 'fa' ? 'زمین' : 'Land' },
              { value: 'parking', label: locale === 'fa' ? 'پارکینگ' : 'Parking' },
            ],
          },
          {
            key: 'minPrice',
            label: locale === 'fa' ? 'حداقل قیمت (€)' : 'Min Price (€)',
            type: 'number',
            placeholder: '0',
          },
          {
            key: 'maxPrice',
            label: locale === 'fa' ? 'حداکثر قیمت (€)' : 'Max Price (€)',
            type: 'number',
            placeholder: '1000000',
          },
          {
            key: 'minArea',
            label: locale === 'fa' ? 'حداقل متراژ (m²)' : 'Min Area (m²)',
            type: 'number',
            placeholder: '0',
          },
          {
            key: 'maxArea',
            label: locale === 'fa' ? 'حداکثر متراژ (m²)' : 'Max Area (m²)',
            type: 'number',
            placeholder: '500',
          },
          {
            key: 'rooms',
            label: locale === 'fa' ? 'تعداد اتاق' : 'Rooms',
            type: 'select',
            options: [
              { value: '', label: locale === 'fa' ? 'همه' : 'All' },
              { value: '1', label: '1' },
              { value: '2', label: '2' },
              { value: '3', label: '3' },
              { value: '4', label: '4' },
              { value: '5+', label: '5+' },
            ],
          },
        ];

      case MainCategoryType.VEHICLES:
        return [
          ...baseFilters,
          {
            key: 'condition',
            label: locale === 'fa' ? 'وضعیت' : 'Condition',
            type: 'select',
            options: [
              { value: '', label: locale === 'fa' ? 'همه' : 'All' },
              { value: 'new', label: locale === 'fa' ? 'نو' : 'New' },
              { value: 'like-new', label: locale === 'fa' ? 'در حد نو' : 'Like New' },
              { value: 'used', label: locale === 'fa' ? 'کارکرده' : 'Used' },
            ],
          },
          {
            key: 'brand',
            label: locale === 'fa' ? 'برند' : 'Brand',
            type: 'text',
            placeholder: locale === 'fa' ? 'مثال: BMW' : 'e.g., BMW',
          },
          {
            key: 'model',
            label: locale === 'fa' ? 'مدل' : 'Model',
            type: 'text',
            placeholder: locale === 'fa' ? 'مثال: X5' : 'e.g., X5',
          },
          {
            key: 'minYear',
            label: locale === 'fa' ? 'حداقل سال' : 'Min Year',
            type: 'number',
            placeholder: '2000',
          },
          {
            key: 'maxYear',
            label: locale === 'fa' ? 'حداکثر سال' : 'Max Year',
            type: 'number',
            placeholder: '2024',
          },
          {
            key: 'maxMileage',
            label: locale === 'fa' ? 'حداکثر کارکرد (km)' : 'Max Mileage (km)',
            type: 'number',
            placeholder: '100000',
          },
          {
            key: 'fuelType',
            label: locale === 'fa' ? 'نوع سوخت' : 'Fuel Type',
            type: 'select',
            options: [
              { value: '', label: locale === 'fa' ? 'همه' : 'All' },
              { value: 'petrol', label: locale === 'fa' ? 'بنزین' : 'Petrol' },
              { value: 'diesel', label: locale === 'fa' ? 'دیزل' : 'Diesel' },
              { value: 'electric', label: locale === 'fa' ? 'الکتریکی' : 'Electric' },
              { value: 'hybrid', label: locale === 'fa' ? 'هیبرید' : 'Hybrid' },
            ],
          },
          {
            key: 'transmission',
            label: locale === 'fa' ? 'گیربکس' : 'Transmission',
            type: 'select',
            options: [
              { value: '', label: locale === 'fa' ? 'همه' : 'All' },
              { value: 'manual', label: locale === 'fa' ? 'دستی' : 'Manual' },
              { value: 'automatic', label: locale === 'fa' ? 'اتوماتیک' : 'Automatic' },
            ],
          },
          {
            key: 'minPrice',
            label: locale === 'fa' ? 'حداقل قیمت (€)' : 'Min Price (€)',
            type: 'number',
            placeholder: '0',
          },
          {
            key: 'maxPrice',
            label: locale === 'fa' ? 'حداکثر قیمت (€)' : 'Max Price (€)',
            type: 'number',
            placeholder: '50000',
          },
        ];

      case MainCategoryType.SERVICES:
        return [
          ...baseFilters,
          {
            key: 'serviceCategory',
            label: locale === 'fa' ? 'دسته خدمات' : 'Service Category',
            type: 'select',
            options: [
              { value: '', label: locale === 'fa' ? 'همه' : 'All' },
              { value: 'construction', label: locale === 'fa' ? 'ساختمان' : 'Bauwesen' },
              { value: 'transport', label: locale === 'fa' ? 'حمل و نقل' : 'Transport' },
              { value: 'repairs', label: locale === 'fa' ? 'تعمیرات' : 'Repairs' },
              { value: 'education', label: locale === 'fa' ? 'آموزش' : 'Education' },
              { value: 'personal_services', label: locale === 'fa' ? 'خدمات شخصی' : 'Personal Services' },
            ],
          },
          {
            key: 'pricingType',
            label: locale === 'fa' ? 'نوع قیمت‌گذاری' : 'Pricing Type',
            type: 'select',
            options: [
              { value: '', label: locale === 'fa' ? 'همه' : 'All' },
              { value: 'fixed', label: locale === 'fa' ? 'قیمت ثابت' : 'Fixed' },
              { value: 'hourly', label: locale === 'fa' ? 'ساعتی' : 'Hourly' },
              { value: 'negotiable', label: locale === 'fa' ? 'توافقی' : 'Negotiable' },
            ],
          },
          {
            key: 'minPrice',
            label: locale === 'fa' ? 'حداقل قیمت (€)' : 'Min Price (€)',
            type: 'number',
            placeholder: '0',
          },
          {
            key: 'maxPrice',
            label: locale === 'fa' ? 'حداکثر قیمت (€)' : 'Max Price (€)',
            type: 'number',
            placeholder: '1000',
          },
        ];

      case MainCategoryType.JOBS:
        return [
          ...baseFilters,
          {
            key: 'jobType',
            label: locale === 'fa' ? 'نوع شغل' : 'Job Type',
            type: 'select',
            options: [
              { value: '', label: locale === 'fa' ? 'همه' : 'All' },
              { value: 'full-time', label: locale === 'fa' ? 'تمام وقت' : 'Full-time' },
              { value: 'part-time', label: locale === 'fa' ? 'پاره وقت' : 'Part-time' },
              { value: 'mini-job', label: locale === 'fa' ? 'مینی جاب' : 'Mini-job' },
              { value: 'freelance', label: locale === 'fa' ? 'فریلنس' : 'Freelance' },
              { value: 'internship', label: locale === 'fa' ? 'کارآموزی' : 'Internship' },
            ],
          },
          {
            key: 'experienceLevel',
            label: locale === 'fa' ? 'سطح تجربه' : 'Experience Level',
            type: 'select',
            options: [
              { value: '', label: locale === 'fa' ? 'همه' : 'All' },
              { value: 'junior', label: locale === 'fa' ? 'جونیور' : 'Junior' },
              { value: 'mid', label: locale === 'fa' ? 'میانی' : 'Mid' },
              { value: 'senior', label: locale === 'fa' ? 'سنیور' : 'Senior' },
            ],
          },
          {
            key: 'minSalary',
            label: locale === 'fa' ? 'حداقل حقوق (€)' : 'Min Salary (€)',
            type: 'number',
            placeholder: '0',
          },
          {
            key: 'maxSalary',
            label: locale === 'fa' ? 'حداکثر حقوق (€)' : 'Max Salary (€)',
            type: 'number',
            placeholder: '100000',
          },
        ];

      case MainCategoryType.PERSONAL_HOME:
      case MainCategoryType.MISC:
      default:
        return [
          ...baseFilters,
          {
            key: 'minPrice',
            label: locale === 'fa' ? 'حداقل قیمت (€)' : 'Min Price (€)',
            type: 'number',
            placeholder: '0',
          },
          {
            key: 'maxPrice',
            label: locale === 'fa' ? 'حداکثر قیمت (€)' : 'Max Price (€)',
            type: 'number',
            placeholder: '100000',
          },
        ];
    }
  };

  const filterOptions = getFilterOptions();

  // Sync tempFilters with filters when drawer opens
  React.useEffect(() => {
    if (showFilterDrawer) {
      setTempFilters(filters);
    }
  }, [showFilterDrawer, filters]);

  const handleFilterChange = (key: string, value: any) => {
    setTempFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    // Reset to default cityId (from URL or store)
    const defaultCityId = cityIdFromUrl && cityIdFromUrl !== 'all' 
      ? cityIdFromUrl 
      : (selectedCityId && selectedCityId !== 'all' ? selectedCityId : '');
    
    const resetFilters = {
      cityId: defaultCityId,
      minPrice: '',
      maxPrice: '',
      search: '',
      condition: '',
      offerType: '',
      propertyType: '',
      minArea: '',
      maxArea: '',
      rooms: '',
      brand: '',
      model: '',
      minYear: '',
      maxYear: '',
      maxMileage: '',
      fuelType: '',
      transmission: '',
      serviceCategory: '',
      pricingType: '',
      jobType: '',
      experienceLevel: '',
      minSalary: '',
      maxSalary: '',
    };
    
    setTempFilters(resetFilters);
    
    // Also update URL immediately or on close? 
    // Usually reset in drawer only resets temp state.
    // The handleCloseFilterDrawer will apply it to URL.
  };

  // Apply filters when drawer is closed
  const handleCloseFilterDrawer = () => {
    setFilters(tempFilters);
    setShowFilterDrawer(false);
    
    // Sync filters to URL
    const params = new URLSearchParams(window.location.search);
    params.delete('page'); // Reset to first page
    Object.entries(tempFilters).forEach(([key, value]) => {
      if (value) {
        params.set(key, String(value));
      } else {
        params.delete(key);
      }
    });
    router.push(`/category/${categoryId}?${params.toString()}`, { scroll: false });
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
                    href={`/category/${category.parent.id}${activeCityId && activeCityId !== 'all' ? `?cityId=${activeCityId}` : ''}`}
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
                    href={`/category/${child.id}${activeCityId && activeCityId !== 'all' ? `?cityId=${activeCityId}` : ''}`}
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
              onClick={handleCloseFilterDrawer}
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
                  onClick={handleCloseFilterDrawer}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-4">
                <div className="bg-white rounded-lg border border-gray-200 p-2 md:p-3">
                  <FilterBar
                    filters={tempFilters}
                    filterOptions={filterOptions}
                    onFilterChange={handleFilterChange}
                    onReset={handleReset}
                  />
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
                  onClick={() => {
                    const params = new URLSearchParams(window.location.search);
                    params.set('page', String(pagination.page - 1));
                    router.push(`/category/${categoryId}?${params.toString()}`);
                  }}
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
                  onClick={() => {
                    const params = new URLSearchParams(window.location.search);
                    params.set('page', String(pagination.page + 1));
                    router.push(`/category/${categoryId}?${params.toString()}`);
                  }}
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
