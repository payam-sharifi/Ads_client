'use client';

import React from 'react';
import { useI18n } from '@/lib/contexts/I18nContext';

/**
 * FilterBar Component
 * 
 * Provides filtering UI for list pages
 * 
 * Usage:
 * <FilterBar
 *   filters={filterState}
 *   onFilterChange={handleFilterChange}
 *   onReset={handleReset}
 * />
 */

export interface FilterOption {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'number';
  options?: { value: string; label: string }[];
  placeholder?: string;
}

interface FilterBarProps {
  filters: Record<string, any>;
  filterOptions: FilterOption[];
  onFilterChange: (key: string, value: any) => void;
  onReset?: () => void;
  className?: string;
}

export default function FilterBar({
  filters,
  filterOptions,
  onFilterChange,
  onReset,
  className = '',
}: FilterBarProps) {
  const { locale, isRTL, t } = useI18n();
  
  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-2 md:p-3 ${className}`}>
      <div className="flex flex-col gap-3">
        {filterOptions.map((option) => (
          <div key={option.key}>
            <label className="block text-sm font-medium text-gray-700 mb-1" dir={isRTL ? 'rtl' : 'ltr'}>
              {option.label}
            </label>
            {option.type === 'text' && (
              <input
                type="text"
                value={filters[option.key] || ''}
                onChange={(e) => onFilterChange(option.key, e.target.value)}
                placeholder={option.placeholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                dir={isRTL ? 'rtl' : 'ltr'}
              />
            )}
            {option.type === 'select' && (
              <select
                value={filters[option.key] || ''}
                onChange={(e) => onFilterChange(option.key, e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                dir={isRTL ? 'rtl' : 'ltr'}
              >
                {option.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}
            {option.type === 'number' && (
              <input
                type="number"
                value={filters[option.key] || ''}
                onChange={(e) => onFilterChange(option.key, e.target.value ? Number(e.target.value) : undefined)}
                placeholder={option.placeholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                dir="ltr"
              />
            )}
            {option.type === 'date' && (
              <input
                type="date"
                value={filters[option.key] || ''}
                onChange={(e) => onFilterChange(option.key, e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                dir="ltr"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

