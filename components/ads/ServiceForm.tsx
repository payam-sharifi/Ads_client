'use client';

import React from 'react';
import { useI18n } from '@/lib/contexts/I18nContext';
import { ServiceCategory, PricingType, ServiceMetadata } from '@/lib/types/category.types';

interface ServiceFormProps {
  data: Partial<ServiceMetadata>;
  onChange: (data: Partial<ServiceMetadata>) => void;
  errors?: Record<string, string>;
}

export default function ServiceForm({ data, onChange, errors = {} }: ServiceFormProps) {
  const { locale, isRTL } = useI18n();

  const updateField = (field: keyof ServiceMetadata, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const getFieldError = (field: string) => {
    return errors[field];
  };

  const serviceCategoryLabels: Record<ServiceCategory, { fa: string; de: string }> = {
    [ServiceCategory.HOME_SERVICES]: { fa: 'خدمات منزل', de: 'Home Services' },
    [ServiceCategory.TRANSPORT]: { fa: 'حمل و نقل', de: 'Transport' },
    [ServiceCategory.REPAIRS]: { fa: 'تعمیرات', de: 'Repairs' },
    [ServiceCategory.IT_DESIGN]: { fa: 'IT و طراحی', de: 'IT & Design' },
    [ServiceCategory.EDUCATION]: { fa: 'آموزش', de: 'Education' },
    [ServiceCategory.PERSONAL_SERVICES]: { fa: 'خدمات شخصی', de: 'Personal Services' },
  };

  return (
    <div className="space-y-4 overflow-visible relative">
      {/* Dropdowns Row - Desktop: 2 columns, Mobile: 1 column */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Service Category */}
        <div className="relative z-10">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {isRTL ? 'دسته خدمات' : 'Service Category'} <span className="text-red-500">*</span>
          </label>
          <div className="relative" style={{ zIndex: 1000 }}>
            <select
              value={data.serviceCategory || ''}
              onChange={(e) => updateField('serviceCategory', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg ${
              getFieldError('serviceCategory') ? 'border-red-500' : 'border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-red-500`}
              dir={isRTL ? 'rtl' : 'ltr'}
            >
            <option value="">{isRTL ? 'انتخاب کنید' : 'Select...'}</option>
            {Object.entries(serviceCategoryLabels).map(([value, labels]) => (
              <option key={value} value={value}>
                {isRTL ? labels.fa : labels.de}
              </option>
            ))}
          </select>
          </div>
          {getFieldError('serviceCategory') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('serviceCategory')}</p>
          )}
        </div>

        {/* Pricing Type */}
        <div className="relative z-10">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {isRTL ? 'نوع قیمت‌گذاری' : 'Pricing Type'} <span className="text-red-500">*</span>
          </label>
          <select
            value={data.pricingType || ''}
            onChange={(e) => {
              updateField('pricingType', e.target.value);
              if (e.target.value === PricingType.NEGOTIABLE) {
                updateField('price', undefined);
              }
            }}
            className={`w-full px-3 py-2 border rounded-lg relative z-20 ${
              getFieldError('pricingType') ? 'border-red-500' : 'border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-red-500`}
            style={{ zIndex: 1000 }}
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            <option value="">{isRTL ? 'انتخاب کنید' : 'Select...'}</option>
            <option value={PricingType.FIXED}>{isRTL ? 'قیمت ثابت' : 'Fixed Price'}</option>
            <option value={PricingType.HOURLY}>{isRTL ? 'ساعتی' : 'Hourly'}</option>
            <option value={PricingType.NEGOTIABLE}>{isRTL ? 'قابل مذاکره' : 'Negotiable'}</option>
          </select>
          {getFieldError('pricingType') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('pricingType')}</p>
          )}
        </div>
      </div>

      {/* Price (if not negotiable) */}
      {data.pricingType && data.pricingType !== PricingType.NEGOTIABLE && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {data.pricingType === PricingType.HOURLY 
              ? (isRTL ? 'قیمت ساعتی (€)' : 'Price per Hour (€)')
              : (isRTL ? 'قیمت (€)' : 'Price (€)')
            } <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={data.price || ''}
            onChange={(e) => {
              const value = e.target.value;
              // Convert to integer to avoid decimal precision issues
              const intValue = value === '' ? undefined : Math.round(parseFloat(value) || 0);
              updateField('price', intValue);
            }}
            placeholder={isRTL ? '25' : '25'}
            className={`w-full px-3 py-2 border rounded-lg ${
              getFieldError('price') ? 'border-red-500' : 'border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-red-500`}
            dir="ltr"
            min="0"
            step="1"
          />
          {getFieldError('price') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('price')}</p>
          )}
        </div>
      )}

      {/* Service Area */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {isRTL ? 'محدوده یا منطقه' : 'Area or District'} <span className="text-gray-400 text-xs">({isRTL ? 'اختیاری' : 'Optional'})</span>
        </label>
        <input
          type="text"
          value={data.serviceRadius ? String(data.serviceRadius) : ''}
          onChange={(e) => updateField('serviceRadius', e.target.value || undefined)}
          placeholder={isRTL ? 'محدوده خدمات' : 'Service area'}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          dir={isRTL ? 'rtl' : 'ltr'}
        />
      </div>

      {/* Experience Years */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {isRTL ? 'سال‌های تجربه' : 'Years of Experience'} <span className="text-gray-400 text-xs">({isRTL ? 'اختیاری' : 'Optional'})</span>
        </label>
        <input
          type="number"
          value={data.experienceYears || ''}
          onChange={(e) => updateField('experienceYears', parseInt(e.target.value) || undefined)}
          placeholder={isRTL ? '5' : '5'}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          dir="ltr"
          min="0"
        />
      </div>

      {/* Certificates */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {isRTL ? 'گواهینامه‌ها' : 'Certificates'} <span className="text-gray-400 text-xs">({isRTL ? 'اختیاری' : 'Optional'})</span>
        </label>
        <textarea
          value={data.certificates || ''}
          onChange={(e) => updateField('certificates', e.target.value)}
          placeholder={isRTL ? 'Meisterbrief, IHK-Zertifikat...' : 'Meisterbrief, IHK-Zertifikat...'}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          rows={3}
          dir={isRTL ? 'rtl' : 'ltr'}
        />
      </div>

    </div>
  );
}

