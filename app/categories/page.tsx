'use client';

import React from 'react';
import Link from 'next/link';
import { useCategories } from '@/lib/hooks/useCategories';
import { Category } from '@/lib/hooks/useCategories';
import { useI18n } from '@/lib/contexts/I18nContext';
import { getLocalizedCategoryName } from '@/lib/utils/localizedNames';
import { useCityStore } from '@/lib/stores/cityStore';

/**
 * Categories List Page
 * 
 * API: GET /api/categories
 * Displays all categories in a grid layout (divar.ir style)
 */
export default function CategoriesPage() {
  const { data: categories, isLoading } = useCategories();
  const { locale, isRTL } = useI18n();
  const { selectedCityId } = useCityStore();

  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
                <div className="h-12 w-12 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Filter only main categories (with categoryType, no parent)
  const mainCategories = categories?.filter(cat => !cat.parentId && cat.categoryType) || [];

  const renderCategory = (category: Category, level = 0) => (
    <Link
      key={category.id}
      href={`/category/${category.id}${selectedCityId && selectedCityId !== 'all' ? `?cityId=${selectedCityId}` : ''}`}
      className={`block bg-white rounded-lg border border-gray-200 p-6 hover:border-red-500 hover:shadow-md transition-all ${
        level > 0 ? 'ml-6' : ''
      }`}
    >
      <div className="flex items-center gap-4">
        {category.icon && (
          <div className="text-4xl">{category.icon}</div>
        )}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1" dir={isRTL ? 'rtl' : 'ltr'}>
            {getLocalizedCategoryName(category.name, locale)}
          </h3>
          {category.children && category.children.length > 0 && (
            <p className="text-sm text-gray-500" dir={isRTL ? 'rtl' : 'ltr'}>
              {locale === 'fa' 
                ? `${category.children.length} زیردسته‌بندی`
                : `${category.children.length} Unterkategorien`}
            </p>
          )}
        </div>
        <svg
          className="w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
      {category.children && category.children.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="grid grid-cols-1 gap-2">
            {category.children.map((child) => renderCategory(child, level + 1))}
          </div>
        </div>
      )}
    </Link>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2" dir={isRTL ? 'rtl' : 'ltr'}>
            {locale === 'fa' ? 'همه دسته‌بندی‌ها' : 'Alle Kategorien'}
          </h1>
          <p className="text-gray-600" dir={isRTL ? 'rtl' : 'ltr'}>
            {locale === 'fa' ? 'مرور همه دسته‌بندی‌های موجود' : 'Alle verfügbaren Kategorien durchsuchen'}
          </p>
        </div>

        {!mainCategories || mainCategories.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-500" dir={isRTL ? 'rtl' : 'ltr'}>
              {locale === 'fa' ? 'هیچ دسته‌بندی موجود نیست' : 'Keine Kategorien verfügbar'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mainCategories.map((category) => renderCategory(category))}
          </div>
        )}
      </div>
    </div>
  );
}
