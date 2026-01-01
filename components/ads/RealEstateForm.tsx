'use client';

import React from 'react';
import { useI18n } from '@/lib/contexts/I18nContext';
import { RealEstateOfferType, PropertyType, RealEstateMetadata } from '@/lib/types/category.types';

interface RealEstateFormProps {
  data: Partial<RealEstateMetadata>;
  onChange: (data: Partial<RealEstateMetadata>) => void;
  errors?: Record<string, string>;
}

export default function RealEstateForm({ data, onChange, errors = {} }: RealEstateFormProps) {
  const { locale, isRTL } = useI18n();

  const updateField = (field: keyof RealEstateMetadata, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const getFieldError = (field: string) => {
    return errors[field];
  };

  return (
    <div className="space-y-4 overflow-visible relative">
      {/* Offer Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {isRTL ? 'نوع آگهی' : 'Offer Type'} <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-4">
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="offerType"
              value={RealEstateOfferType.RENT}
              checked={data.offerType === RealEstateOfferType.RENT}
              onChange={(e) => updateField('offerType', e.target.value)}
              className={isRTL ? 'ml-3' : 'mr-3'}
              required
            />
            <span>{isRTL ? 'اجاره' : 'Rent'}</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="offerType"
              value={RealEstateOfferType.SALE}
              checked={data.offerType === RealEstateOfferType.SALE}
              onChange={(e) => updateField('offerType', e.target.value)}
              className={isRTL ? 'ml-3' : 'mr-3'}
              required
            />
            <span>{isRTL ? 'فروش' : 'Sale'}</span>
          </label>
        </div>
        {getFieldError('offerType') && (
          <p className="mt-1 text-sm text-red-600">{getFieldError('offerType')}</p>
        )}
      </div>

      {/* Property Type */}
      <div className="relative z-10">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {isRTL ? 'نوع ملک' : 'Property Type'} <span className="text-red-500">*</span>
        </label>
        <select
          value={data.propertyType || ''}
          onChange={(e) => updateField('propertyType', e.target.value)}
          className={`w-full px-3 py-2 border rounded-lg ${
            getFieldError('propertyType') ? 'border-red-500' : 'border-gray-300'
          } focus:outline-none focus:ring-2 focus:ring-red-500 relative z-20`}
          style={{ zIndex: 1000 }}
          dir={isRTL ? 'rtl' : 'ltr'}
          required
        >
          <option value="">{isRTL ? 'انتخاب کنید' : 'Select...'}</option>
          <option value={PropertyType.APARTMENT}>{isRTL ? 'آپارتمان' : 'Apartment'}</option>
          <option value={PropertyType.HOUSE}>{isRTL ? 'خانه' : 'House'}</option>
          <option value={PropertyType.COMMERCIAL}>{isRTL ? 'تجاری' : 'Commercial'}</option>
          <option value={PropertyType.LAND}>{isRTL ? 'زمین' : 'Land'}</option>
          <option value={PropertyType.PARKING}>{isRTL ? 'پارکینگ' : 'Parking'}</option>
        </select>
        {getFieldError('propertyType') && (
          <p className="mt-1 text-sm text-red-600">{getFieldError('propertyType')}</p>
        )}
      </div>

      {/* Postal Code */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {isRTL ? 'کد پستی' : 'Postal Code'} <span className="text-gray-400 text-xs">({isRTL ? 'اختیاری' : 'Optional'})</span>
        </label>
        <input
          type="text"
          value={data.postalCode || ''}
          onChange={(e) => updateField('postalCode', e.target.value)}
          placeholder={isRTL ? '10115' : '10115'}
          className={`w-full px-3 py-2 border rounded-lg ${
            getFieldError('postalCode') ? 'border-red-500' : 'border-gray-300'
          } focus:outline-none focus:ring-2 focus:ring-red-500`}
          dir="ltr"
          minLength={5}
        />
        {getFieldError('postalCode') && (
          <p className="mt-1 text-sm text-red-600">{getFieldError('postalCode')}</p>
        )}
      </div>

      {/* District */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {isRTL ? 'محله' : 'District'} <span className="text-gray-400 text-xs">({isRTL ? 'اختیاری' : 'Optional'})</span>
        </label>
        <input
          type="text"
          value={data.district || ''}
          onChange={(e) => updateField('district', e.target.value)}
          placeholder={isRTL ? 'مثال: میته' : 'e.g. Mitte'}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          dir={isRTL ? 'rtl' : 'ltr'}
        />
      </div>

      {/* Price or Cold Rent */}
      {data.offerType === RealEstateOfferType.SALE ? (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {isRTL ? 'قیمت فروش (€)' : 'Sale Price (€)'} <span className="text-red-500">*</span>
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
            placeholder={isRTL ? '250000' : '250000'}
            className={`w-full px-3 py-2 border rounded-lg ${
              getFieldError('price') ? 'border-red-500' : 'border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-red-500`}
            dir="ltr"
            min="0"
            step="1"
            required={data.offerType === RealEstateOfferType.SALE}
          />
          {getFieldError('price') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('price')}</p>
          )}
        </div>
      ) : data.offerType === RealEstateOfferType.RENT ? (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {isRTL ? 'اجاره پایه (€)' : 'Cold Rent (€)'} <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={data.coldRent || ''}
            onChange={(e) => {
              const value = e.target.value;
              // Convert to integer to avoid decimal precision issues
              const intValue = value === '' ? undefined : Math.round(parseFloat(value) || 0);
              updateField('coldRent', intValue);
            }}
            placeholder={isRTL ? '1200' : '1200'}
            className={`w-full px-3 py-2 border rounded-lg ${
              getFieldError('coldRent') ? 'border-red-500' : 'border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-red-500`}
            dir="ltr"
            min="0"
            step="1"
            required={data.offerType === RealEstateOfferType.RENT}
          />
          {getFieldError('coldRent') && (
            <p className="mt-1 text-sm text-red-600">{getFieldError('coldRent')}</p>
          )}
        </div>
      ) : null}

      {/* Additional Costs */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {isRTL ? 'هزینه اضافی (€)' : 'Additional Costs (€)'} <span className="text-gray-400 text-xs">({isRTL ? 'اختیاری' : 'Optional'})</span>
        </label>
        <input
          type="number"
          value={data.additionalCosts || ''}
          onChange={(e) => updateField('additionalCosts', parseFloat(e.target.value) || 0)}
          placeholder={isRTL ? '200' : '200'}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          dir="ltr"
          min="0"
        />
      </div>

      {/* Deposit */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {isRTL ? 'ودیعه (€)' : 'Deposit (€)'} <span className="text-gray-400 text-xs">({isRTL ? 'اختیاری' : 'Optional'})</span>
        </label>
        <input
          type="number"
          value={data.deposit || ''}
          onChange={(e) => updateField('deposit', parseFloat(e.target.value) || 0)}
          placeholder={isRTL ? '2400' : '2400'}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          dir="ltr"
          min="0"
        />
      </div>

      {/* Living Area */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {isRTL ? 'متراژ (m²)' : 'Living Area (m²)'} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          inputMode="decimal"
          value={data.livingArea !== undefined && data.livingArea !== null ? String(data.livingArea) : ''}
          onChange={(e) => {
            const value = e.target.value.trim();
            // Allow empty, numbers, and one decimal point
            if (value === '') {
              updateField('livingArea', undefined);
            } else if (/^\d+\.?\d*$/.test(value)) {
              // Use Number() instead of parseFloat to preserve precision better
              // But we need to store the exact string value to avoid floating point issues
              // Store as number but the backend should handle it correctly
              const numValue = Number(value);
              if (!isNaN(numValue) && numValue > 0) {
                updateField('livingArea', numValue);
              }
            }
          }}
          placeholder={isRTL ? '80' : '80'}
          className={`w-full px-3 py-2 border rounded-lg ${
            getFieldError('livingArea') ? 'border-red-500' : 'border-gray-300'
          } focus:outline-none focus:ring-2 focus:ring-red-500`}
          dir="ltr"
          required
        />
        {getFieldError('livingArea') && (
          <p className="mt-1 text-sm text-red-600">{getFieldError('livingArea')}</p>
        )}
      </div>

      {/* Rooms */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {isRTL ? 'تعداد اتاق' : 'Rooms'} <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          value={data.rooms || ''}
          onChange={(e) => updateField('rooms', parseInt(e.target.value) || 0)}
          placeholder={isRTL ? '3' : '3'}
          className={`w-full px-3 py-2 border rounded-lg ${
            getFieldError('rooms') ? 'border-red-500' : 'border-gray-300'
          } focus:outline-none focus:ring-2 focus:ring-red-500`}
          dir="ltr"
          min="1"
          required
        />
        {getFieldError('rooms') && (
          <p className="mt-1 text-sm text-red-600">{getFieldError('rooms')}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Floor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {isRTL ? 'طبقه' : 'Floor'} <span className="text-gray-400 text-xs">({isRTL ? 'اختیاری' : 'Optional'})</span>
          </label>
          <input
            type="number"
            value={data.floor || ''}
            onChange={(e) => updateField('floor', parseInt(e.target.value) || undefined)}
            placeholder={isRTL ? '3' : '3'}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            dir="ltr"
          />
        </div>

        {/* Total Floors */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {isRTL ? 'تعداد طبقات' : 'Total Floors'} <span className="text-gray-400 text-xs">({isRTL ? 'اختیاری' : 'Optional'})</span>
          </label>
          <input
            type="number"
            value={data.totalFloors || ''}
            onChange={(e) => updateField('totalFloors', parseInt(e.target.value) || undefined)}
            placeholder={isRTL ? '5' : '5'}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            dir="ltr"
          />
        </div>
      </div>

      {/* Year Built */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {isRTL ? 'سال ساخت' : 'Year Built'} <span className="text-gray-400 text-xs">({isRTL ? 'اختیاری' : 'Optional'})</span>
        </label>
        <input
          type="number"
          value={data.yearBuilt || ''}
          onChange={(e) => updateField('yearBuilt', parseInt(e.target.value) || undefined)}
          placeholder={isRTL ? '2010' : '2010'}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          dir="ltr"
          min="1800"
          max={new Date().getFullYear()}
        />
      </div>

      {/* Available From */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {isRTL ? 'موجود از' : 'Available From'} <span className="text-gray-400 text-xs">({isRTL ? 'اختیاری' : 'Optional'})</span>
        </label>
        <input
          type="date"
          value={data.availableFrom || ''}
          onChange={(e) => updateField('availableFrom', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          dir="ltr"
        />
      </div>

      {/* Features */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {isRTL ? 'ویژگی‌ها' : 'Features'}
        </label>
        <div className="space-y-2">
          {[
            { key: 'furnished' as const, label: isRTL ? 'مبله' : 'Furnished' },
            { key: 'balcony' as const, label: isRTL ? 'بالکن' : 'Balcony' },
            { key: 'elevator' as const, label: isRTL ? 'آسانسور' : 'Elevator' },
            { key: 'parkingIncluded' as const, label: isRTL ? 'پارکینگ' : 'Parking Included' },
            { key: 'cellar' as const, label: isRTL ? 'انباری' : 'Cellar' },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center">
              <input
                type="checkbox"
                checked={data[key] || false}
                onChange={(e) => updateField(key, e.target.checked)}
                className="mr-2"
              />
              {label}
            </label>
          ))}
        </div>
      </div>

    </div>
  );
}

