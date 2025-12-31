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
      {/* Service Category */}
      <div className="relative z-10">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {isRTL ? 'دسته خدمات' : 'Service Category'} <span className="text-red-500">*</span>
        </label>
        <div className="relative" style={{ zIndex: 1000 }}>
          <select
            value={data.serviceCategory || ''}
            onChange={(e) => updateField('serviceCategory', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
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
          className="w-full px-3 py-2 border border-gray-300 rounded-lg relative z-20"
          style={{ zIndex: 1000 }}
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          <option value="">{isRTL ? 'انتخاب کنید' : 'Select...'}</option>
          <option value={PricingType.FIXED}>{isRTL ? 'قیمت ثابت' : 'Fixed Price'}</option>
          <option value={PricingType.HOURLY}>{isRTL ? 'ساعتی' : 'Hourly'}</option>
          <option value={PricingType.NEGOTIABLE}>{isRTL ? 'قابل مذاکره' : 'Negotiable'}</option>
        </select>
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
            onChange={(e) => updateField('price', parseFloat(e.target.value) || 0)}
            placeholder={isRTL ? '25' : '25'}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            dir="ltr"
            min="0"
          />
        </div>
      )}

      {/* Service Radius */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {isRTL ? 'شعاع خدمات (km)' : 'Service Radius (km)'} <span className="text-gray-400 text-xs">({isRTL ? 'اختیاری' : 'Optional'})</span>
        </label>
        <input
          type="number"
          value={data.serviceRadius || ''}
          onChange={(e) => updateField('serviceRadius', parseFloat(e.target.value) || undefined)}
          placeholder={isRTL ? '50' : '50'}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          dir="ltr"
          min="1"
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

      {/* Contact */}
      <div className="pt-4 border-t">
        <h3 className="text-lg font-medium text-gray-900 mb-3">{isRTL ? 'اطلاعات تماس' : 'Contact Information'}</h3>
        
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {isRTL ? 'نام' : 'Name'} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.contactName || ''}
            onChange={(e) => updateField('contactName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            dir={isRTL ? 'rtl' : 'ltr'}
          />
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {isRTL ? 'تلفن' : 'Phone'} <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={data.contactPhone || ''}
            onChange={(e) => updateField('contactPhone', e.target.value)}
            placeholder={isRTL ? '+49123456789' : '+49123456789'}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            dir="ltr"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {isRTL ? 'ایمیل' : 'Email'} <span className="text-gray-400 text-xs">({isRTL ? 'اختیاری' : 'Optional'})</span>
          </label>
          <input
            type="email"
            value={data.contactEmail || ''}
            onChange={(e) => updateField('contactEmail', e.target.value)}
            placeholder={isRTL ? 'ali@example.com' : 'ali@example.com'}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            dir="ltr"
          />
        </div>
      </div>
    </div>
  );
}

