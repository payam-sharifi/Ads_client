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
  const { locale, isRTL ,t} = useI18n();

  const updateField = (field: keyof ServiceMetadata, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const getFieldError = (field: string) => {
    return errors[field];
  };

  const serviceCategoryLabels: Record<ServiceCategory, { fa: string; de: string }> = {
    [ServiceCategory.CONSTRUCTION]: { fa: 'ساختمان', de: 'Bauwesen' },
    [ServiceCategory.TRANSPORT]: { fa: 'حمل و نقل', de: 'Transport' },
    [ServiceCategory.REPAIRS]: { fa: 'تعمیرات', de: 'Repairs' },
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
            {t('ad.serviceCategory')} <span className="text-primary-500">*</span>
          </label>
          <div className="relative" style={{ zIndex: 1000 }}>
            <select
              value={data.serviceCategory || ''}
              onChange={(e) => updateField('serviceCategory', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg ${
              getFieldError('serviceCategory') ? 'border-primary-500' : 'border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-primary-500`}
              dir={isRTL ? 'rtl' : 'ltr'}
            >
            <option value="">{t('common.select')}...</option>
            {Object.entries(serviceCategoryLabels).map(([value, labels]) => (
              <option key={value} value={value}>
                {isRTL ? labels.fa : labels.de}
              </option>
            ))}
          </select>
          </div>
          {getFieldError('serviceCategory') && (
            <p className="mt-1 text-sm text-primary-600">{getFieldError('serviceCategory')}</p>
          )}
        </div>

        {/* Pricing Type */}
        <div className="relative z-10">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('ad.pricingType')} <span className="text-primary-500">*</span>
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
              getFieldError('pricingType') ? 'border-primary-500' : 'border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-primary-500`}
            style={{ zIndex: 1000 }}
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            <option value="">{t('common.select')}...</option>
            <option value={PricingType.FIXED}>{t('ad.fixedPrice')}</option>
            <option value={PricingType.HOURLY}>{t('ad.hourly')}</option>
            <option value={PricingType.NEGOTIABLE}>{t('ad.negotiable')}</option>
          </select>
          {getFieldError('pricingType') && (
            <p className="mt-1 text-sm text-primary-600">{getFieldError('pricingType')}</p>
          )}
        </div>
      </div>

      {/* Price (if not negotiable) */}
      {data.pricingType && data.pricingType !== PricingType.NEGOTIABLE && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {data.pricingType === PricingType.HOURLY 
              ? (t('ad.pricePerHour') + ' (€)')
              : (t('ad.price') + ' (€)')
            } <span className="text-primary-500">*</span>
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
              getFieldError('price') ? 'border-primary-500' : 'border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-primary-500`}
            dir="ltr"
            min="0"
            step="1"
          />
          {getFieldError('price') && (
            <p className="mt-1 text-sm text-primary-600">{getFieldError('price')}</p>
          )}
        </div>
      )}

      {/* Service Area & Experience Years */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('ad.areaOrDistrict')} <span className="text-gray-400 text-xs">({t('common.optional')})</span>
          </label>
          <input
            type="text"
            value={data.serviceRadius ? String(data.serviceRadius) : ''}
            onChange={(e) => updateField('serviceRadius', e.target.value || undefined)}
            placeholder={t('ad.serviceArea')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            dir={isRTL ? 'rtl' : 'ltr'}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('ad.yearsOfExperience')} <span className="text-gray-400 text-xs">({t('common.optional')})</span>
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
      </div>

      {/* Certificates */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('ad.certificates')} <span className="text-gray-400 text-xs">({t('common.optional')})</span>
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

