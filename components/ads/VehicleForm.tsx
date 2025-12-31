'use client';

import React from 'react';
import { useI18n } from '@/lib/contexts/I18nContext';
import { VehicleType, FuelType, TransmissionType, DamageStatus, VehicleMetadata } from '@/lib/types/category.types';

interface VehicleFormProps {
  data: Partial<VehicleMetadata>;
  onChange: (data: Partial<VehicleMetadata>) => void;
  errors?: Record<string, string>;
}

export default function VehicleForm({ data, onChange, errors = {} }: VehicleFormProps) {
  const { locale, isRTL } = useI18n();

  const updateField = (field: keyof VehicleMetadata, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const getFieldError = (field: string) => {
    return errors[field];
  };

  return (
    <div className="space-y-4 overflow-visible relative">
      {/* Vehicle Type */}
      <div className="relative z-10">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {isRTL ? 'نوع خودرو' : 'Vehicle Type'} <span className="text-red-500">*</span>
        </label>
        <div className="relative" style={{ zIndex: 1000 }}>
          <select
            value={data.vehicleType || ''}
            onChange={(e) => updateField('vehicleType', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg ${
              getFieldError('vehicleType') ? 'border-red-500' : 'border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-red-500`}
            dir={isRTL ? 'rtl' : 'ltr'}
            required
          >
            <option value="">{isRTL ? 'انتخاب کنید' : 'Select...'}</option>
            <option value={VehicleType.CAR}>{isRTL ? 'خودرو' : 'Car'}</option>
            <option value={VehicleType.MOTORCYCLE}>{isRTL ? 'موتورسیکلت' : 'Motorcycle'}</option>
            <option value={VehicleType.VAN}>{isRTL ? 'ون' : 'Van'}</option>
            <option value={VehicleType.BIKE}>{isRTL ? 'دوچرخه' : 'Bike'}</option>
          </select>
        </div>
        {getFieldError('vehicleType') && (
          <p className="mt-1 text-sm text-red-600">{getFieldError('vehicleType')}</p>
        )}
      </div>

      {/* Brand & Model */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {isRTL ? 'برند' : 'Brand'} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.brand || ''}
            onChange={(e) => updateField('brand', e.target.value)}
            placeholder={isRTL ? 'BMW' : 'BMW'}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            dir="ltr"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {isRTL ? 'مدل' : 'Model'} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.model || ''}
            onChange={(e) => updateField('model', e.target.value)}
            placeholder={isRTL ? '320d' : '320d'}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            dir="ltr"
          />
        </div>
      </div>

      {/* Year & Mileage */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {isRTL ? 'سال' : 'Year'} <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={data.year || ''}
            onChange={(e) => updateField('year', parseInt(e.target.value) || 0)}
            placeholder={isRTL ? '2020' : '2020'}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            dir="ltr"
            min="1900"
            max={new Date().getFullYear() + 1}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {isRTL ? 'کارکرد (km)' : 'Mileage (km)'} <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={data.mileage || ''}
            onChange={(e) => updateField('mileage', parseFloat(e.target.value) || 0)}
            placeholder={isRTL ? '50000' : '50000'}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            dir="ltr"
            min="0"
          />
        </div>
      </div>

      {/* Fuel Type & Transmission */}
      <div className="grid grid-cols-2 gap-4">
        <div className="relative z-10">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {isRTL ? 'نوع سوخت' : 'Fuel Type'} <span className="text-red-500">*</span>
          </label>
          <div className="relative" style={{ zIndex: 1000 }}>
            <select
              value={data.fuelType || ''}
              onChange={(e) => updateField('fuelType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              dir={isRTL ? 'rtl' : 'ltr'}
            >
            <option value="">{isRTL ? 'انتخاب کنید' : 'Select...'}</option>
            <option value={FuelType.PETROL}>{isRTL ? 'بنزین' : 'Petrol'}</option>
            <option value={FuelType.DIESEL}>{isRTL ? 'دیزل' : 'Diesel'}</option>
            <option value={FuelType.ELECTRIC}>{isRTL ? 'برقی' : 'Electric'}</option>
            <option value={FuelType.HYBRID}>{isRTL ? 'هیبریدی' : 'Hybrid'}</option>
          </select>
        </div>
        </div>
        <div className="relative z-10">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {isRTL ? 'گیربکس' : 'Transmission'} <span className="text-red-500">*</span>
          </label>
          <div className="relative" style={{ zIndex: 1000 }}>
            <select
              value={data.transmission || ''}
              onChange={(e) => updateField('transmission', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              dir={isRTL ? 'rtl' : 'ltr'}
            >
            <option value="">{isRTL ? 'انتخاب کنید' : 'Select...'}</option>
            <option value={TransmissionType.MANUAL}>{isRTL ? 'دستی' : 'Manual'}</option>
            <option value={TransmissionType.AUTOMATIC}>{isRTL ? 'اتوماتیک' : 'Automatic'}</option>
          </select>
        </div>
        </div>
      </div>

      {/* Power HP */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {isRTL ? 'قدرت (HP)' : 'Power (HP)'} <span className="text-gray-400 text-xs">({isRTL ? 'اختیاری' : 'Optional'})</span>
        </label>
        <input
          type="number"
          value={data.powerHP || ''}
          onChange={(e) => updateField('powerHP', parseInt(e.target.value) || undefined)}
          placeholder={isRTL ? '190' : '190'}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          dir="ltr"
          min="1"
        />
      </div>

      {/* Condition & Damage Status */}
      <div className="grid grid-cols-2 gap-4">
        <div className="relative z-10">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {isRTL ? 'وضعیت' : 'Condition'} <span className="text-red-500">*</span>
          </label>
          <div className="relative" style={{ zIndex: 1000 }}>
            <select
              value={data.condition || ''}
              onChange={(e) => updateField('condition', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              dir={isRTL ? 'rtl' : 'ltr'}
            >
              <option value="">{isRTL ? 'انتخاب کنید' : 'Select...'}</option>
              <option value="new">{isRTL ? 'نو' : 'New'}</option>
              <option value="used">{isRTL ? 'کارکرده' : 'Used'}</option>
            </select>
          </div>
        </div>
        <div className="relative z-10">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {isRTL ? 'وضعیت تصادف' : 'Damage Status'} <span className="text-red-500">*</span>
          </label>
          <div className="relative" style={{ zIndex: 1000 }}>
            <select
              value={data.damageStatus || ''}
              onChange={(e) => updateField('damageStatus', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              dir={isRTL ? 'rtl' : 'ltr'}
            >
              <option value="">{isRTL ? 'انتخاب کنید' : 'Select...'}</option>
              <option value={DamageStatus.NONE}>{isRTL ? 'بدون تصادف' : 'No Damage'}</option>
              <option value={DamageStatus.ACCIDENT}>{isRTL ? 'تصادف داشته' : 'Accident'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Inspection Valid Until */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {isRTL ? 'معاینه فنی تا' : 'Inspection Valid Until'} <span className="text-gray-400 text-xs">({isRTL ? 'اختیاری' : 'Optional'})</span>
        </label>
        <input
          type="date"
          value={data.inspectionValidUntil || ''}
          onChange={(e) => updateField('inspectionValidUntil', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          dir="ltr"
        />
      </div>

      {/* Postal Code */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {isRTL ? 'کد پستی' : 'Postal Code'} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={data.postalCode || ''}
          onChange={(e) => updateField('postalCode', e.target.value)}
          placeholder={isRTL ? '10115' : '10115'}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          dir="ltr"
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

        <div>
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
      </div>
    </div>
  );
}

