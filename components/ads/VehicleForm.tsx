'use client';

import React from 'react';
import { useI18n } from '@/lib/contexts/I18nContext';
import { VehicleType, FuelType, TransmissionType, DamageStatus, BikeType, VehicleMetadata } from '@/lib/types/category.types';

interface VehicleFormProps {
  data: Partial<VehicleMetadata>;
  onChange: (data: Partial<VehicleMetadata>) => void;
  errors?: Record<string, string>;
}

export default function VehicleForm({ data, onChange, errors = {} }: VehicleFormProps) {
  const { locale, isRTL ,t} = useI18n();

  const updateField = (field: keyof VehicleMetadata, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const getFieldError = (field: string) => {
    return errors[field];
  };

  const vehicleType = data.vehicleType;

  return (
    <div className="space-y-4 overflow-visible relative">
      {/* Vehicle Type */}
      <div className="relative z-10 w-full md:w-1/2">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('ad.vehicleType')} <span className="text-primary-500">*</span>
        </label>
        <div className="relative" style={{ zIndex: 1000 }}>
          <select
            value={data.vehicleType || ''}
            onChange={(e) => updateField('vehicleType', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg ${
              getFieldError('vehicleType') ? 'border-primary-500' : 'border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-primary-500`}
            dir={isRTL ? 'rtl' : 'ltr'}
            required
          >
            <option value="">{t('common.select')}...</option>
            <option value={VehicleType.CAR}>{t('ad.car')}</option>
            <option value={VehicleType.MOTORCYCLE}>{t('ad.motorcycle')}</option>
            <option value={VehicleType.VAN}>{t('ad.van')}</option>
            <option value={VehicleType.BIKE}>{t('ad.bike')}</option>
          </select>
        </div>
        {getFieldError('vehicleType') && (
          <p className="mt-1 text-sm text-primary-600">{getFieldError('vehicleType')}</p>
        )}
      </div>

      {/* Brand & Model - All vehicle types */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('ad.brand')} <span className="text-primary-500">*</span>
          </label>
          <input
            type="text"
            value={data.brand || ''}
            onChange={(e) => updateField('brand', e.target.value)}
            placeholder={isRTL ? 'BMW' : 'BMW'}
            className={`w-full px-3 py-2 border rounded-lg ${
              getFieldError('brand') ? 'border-primary-500' : 'border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-primary-500`}
            dir="ltr"
          />
          {getFieldError('brand') && (
            <p className="mt-1 text-sm text-primary-600">{getFieldError('brand')}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('ad.model')} <span className="text-primary-500">*</span>
          </label>
          <input
            type="text"
            value={data.model || ''}
            onChange={(e) => updateField('model', e.target.value)}
            placeholder={isRTL ? '320d' : '320d'}
            className={`w-full px-3 py-2 border rounded-lg ${
              getFieldError('model') ? 'border-primary-500' : 'border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-primary-500`}
            dir="ltr"
          />
          {getFieldError('model') && (
            <p className="mt-1 text-sm text-primary-600">{getFieldError('model')}</p>
          )}
        </div>
      </div>

      {/* Year - All vehicle types - Full width on mobile, half on desktop */}
      <div className="w-full md:w-1/2">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('ad.year')} <span className="text-primary-500">*</span>
        </label>
        <input
          type="number"
          value={data.year || ''}
          onChange={(e) => updateField('year', parseInt(e.target.value) || 0)}
          placeholder={'2020'}
          className={`w-full px-3 py-2 border rounded-lg ${
            getFieldError('year') ? 'border-primary-500' : 'border-gray-300'
          } focus:outline-none focus:ring-2 focus:ring-primary-500`}
          dir="ltr"
          min="1900"
          max={new Date().getFullYear() + 1}
        />
        {getFieldError('year') && (
          <p className="mt-1 text-sm text-primary-600">{getFieldError('year')}</p>
        )}
      </div>

      {/* BIKE SPECIFIC FIELDS */}
      {vehicleType === VehicleType.BIKE && (
        <>
          {/* Bike Type */}
          <div className="relative z-10">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('ad.bikeType')} <span className="text-primary-500">*</span>
            </label>
            <div className="relative" style={{ zIndex: 1000 }}>
              <select
                value={data.bikeType || ''}
                onChange={(e) => updateField('bikeType', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg ${
                  getFieldError('bikeType') ? 'border-primary-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                dir={isRTL ? 'rtl' : 'ltr'}
              >
                <option value="">{t('common.select')}...</option>
                <option value={BikeType.NORMAL}>{t('ad.normal')}</option>
                <option value={BikeType.ELECTRIC}>{t('ad.electric')}</option>
              </select>
            </div>
            {getFieldError('bikeType') && (
              <p className="mt-1 text-sm text-primary-600">{getFieldError('bikeType')}</p>
            )}
          </div>

          {/* Frame Size & Gears */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('ad.frameSize')} <span className="text-gray-400 text-xs">({t('common.optional')})</span>
              </label>
              <input
                type="text"
                value={data.frameSize || ''}
                onChange={(e) => updateField('frameSize', e.target.value)}
                placeholder={isRTL ? 'M, L, XL' : 'M, L, XL'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('ad.gears')} <span className="text-gray-400 text-xs">({t('common.optional')})</span>
              </label>
              <input
                type="number"
                value={data.gears || ''}
                onChange={(e) => updateField('gears', parseInt(e.target.value) || undefined)}
                placeholder={'21'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                dir="ltr"
                min="1"
              />
            </div>
          </div>

          {/* Brake Type & Wheel Size */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative z-10">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('ad.brakeType')} <span className="text-gray-400 text-xs">({t('common.optional')})</span>
              </label>
              <select
                value={data.brakeType || ''}
                onChange={(e) => updateField('brakeType', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                dir={isRTL ? 'rtl' : 'ltr'}
              >
                <option value="">{t('common.select')}...</option>
                <option value="rim">{t('ad.rimBrake')}</option>
                <option value="disc">{t('ad.discBrake')}</option>
                <option value="drum">{t('ad.drumBrake')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('ad.wheelSize')} <span className="text-gray-400 text-xs">({t('common.optional')})</span>
              </label>
              <input
                type="text"
                value={data.wheelSize || ''}
                onChange={(e) => updateField('wheelSize', e.target.value)}
                placeholder={'26", 27.5", 29"' }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                dir="ltr"
              />
            </div>
          </div>
        </>
      )}

      {/* CAR, MOTORCYCLE, VAN SPECIFIC FIELDS */}
      {(vehicleType === VehicleType.CAR || vehicleType === VehicleType.MOTORCYCLE || vehicleType === VehicleType.VAN) && (
        <>
          {/* Mileage - Required for cars, motorcycles, vans */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('ad.mileage')} <span className="text-primary-500">*</span>
            </label>
            <input
              type="number"
              value={data.mileage || ''}
              onChange={(e) => updateField('mileage', parseFloat(e.target.value) || 0)}
              placeholder={'50000'}
              className={`w-full px-3 py-2 border rounded-lg ${
                getFieldError('mileage') ? 'border-primary-500' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-primary-500`}
              dir="ltr"
              min="0"
            />
            {getFieldError('mileage') && (
              <p className="mt-1 text-sm text-primary-600">{getFieldError('mileage')}</p>
            )}
          </div>

          {/* Fuel Type & Transmission */}
          <div className="grid grid-cols-2 gap-4">
            <div className="relative z-10">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('ad.fuelType')} <span className="text-primary-500">*</span>
              </label>
              <div className="relative" style={{ zIndex: 1000 }}>
                <select
                  value={data.fuelType || ''}
                  onChange={(e) => updateField('fuelType', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    getFieldError('fuelType') ? 'border-primary-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                  dir={isRTL ? 'rtl' : 'ltr'}
                >
                  <option value="">{t('common.select')}...</option>
                  <option value={FuelType.PETROL}>{t('ad.petrol')}</option>
                  <option value={FuelType.DIESEL}>{t('ad.diesel')}</option>
                  <option value={FuelType.ELECTRIC}>{t('ad.electric')}</option>
                  <option value={FuelType.HYBRID}>{t('ad.hybrid')}</option>
                </select>
              </div>
              {getFieldError('fuelType') && (
                <p className="mt-1 text-sm text-primary-600">{getFieldError('fuelType')}</p>
              )}
            </div>
            <div className="relative z-10">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('ad.transmission')} <span className="text-primary-500">*</span>
              </label>
              <div className="relative" style={{ zIndex: 1000 }}>
                <select
                  value={data.transmission || ''}
                  onChange={(e) => updateField('transmission', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    getFieldError('transmission') ? 'border-primary-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                  dir={isRTL ? 'rtl' : 'ltr'}
                >
                  <option value="">{t('common.select')}...</option>
                  <option value={TransmissionType.MANUAL}>{t('ad.manual')}</option>
                  <option value={TransmissionType.AUTOMATIC}>{t('ad.automatic')}</option>
                </select>
              </div>
              {getFieldError('transmission') && (
                <p className="mt-1 text-sm text-primary-600">{getFieldError('transmission')}</p>
              )}
            </div>
          </div>

          {/* Engine Size & Power */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('ad.engineSize')} <span className="text-gray-400 text-xs">({t('common.optional')})</span>
              </label>
              <input
                type="number"
                value={data.engineSize || ''}
                onChange={(e) => updateField('engineSize', parseInt(e.target.value) || undefined)}
                placeholder={ '2000'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                dir="ltr"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('ad.powerHP')} <span className="text-gray-400 text-xs">({t('common.optional')})</span>
              </label>
              <input
                type="number"
                value={data.powerHP || ''}
                onChange={(e) => updateField('powerHP', parseInt(e.target.value) || undefined)}
                placeholder={ '190'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                dir="ltr"
                min="1"
              />
            </div>
          </div>

          {/* CAR SPECIFIC: Doors & Seats */}
          {vehicleType === VehicleType.CAR && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('ad.doors')} <span className="text-gray-400 text-xs">({t('common.optional')})</span>
                </label>
                <input
                  type="number"
                  value={data.doors || ''}
                  onChange={(e) => updateField('doors', parseInt(e.target.value) || undefined)}
                  placeholder={ '4'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  dir="ltr"
                  min="2"
                  max="6"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('ad.seats')} <span className="text-gray-400 text-xs">({t('common.optional')})</span>
                </label>
                <input
                  type="number"
                  value={data.seats || ''}
                  onChange={(e) => updateField('seats', parseInt(e.target.value) || undefined)}
                  placeholder={'5'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  dir="ltr"
                  min="2"
                  max="9"
                />
              </div>
            </div>
          )}

          {/* VAN SPECIFIC: Load Capacity */}
          {vehicleType === VehicleType.VAN && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('ad.loadCapacity')} <span className="text-gray-400 text-xs">({t('common.optional')})</span>
              </label>
              <input
                type="number"
                value={data.loadCapacity || ''}
                onChange={(e) => updateField('loadCapacity', parseInt(e.target.value) || undefined)}
                placeholder={'1000'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                dir="ltr"
                min="1"
              />
            </div>
          )}

          {/* Condition & Damage Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="relative z-10">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('ad.condition')} <span className="text-primary-500">*</span>
              </label>
              <div className="relative" style={{ zIndex: 1000 }}>
                <select
                  value={data.condition || ''}
                  onChange={(e) => updateField('condition', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    getFieldError('condition') ? 'border-primary-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                  dir={isRTL ? 'rtl' : 'ltr'}
                >
                  <option value="">{t('common.select')}...</option>
                  <option value="new">{t('ad.new')}</option>
                  <option value="used">{t('ad.used')}</option>
                </select>
              </div>
              {getFieldError('condition') && (
                <p className="mt-1 text-sm text-primary-600">{getFieldError('condition')}</p>
              )}
            </div>
            <div className="relative z-10">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('ad.damageStatus')} <span className="text-primary-500">*</span>
              </label>
              <div className="relative" style={{ zIndex: 1000 }}>
                <select
                  value={data.damageStatus || ''}
                  onChange={(e) => updateField('damageStatus', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    getFieldError('damageStatus') ? 'border-primary-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-primary-500`}
                  dir={isRTL ? 'rtl' : 'ltr'}
                >
                  <option value="">{t('common.select')}...</option>
                  <option value={DamageStatus.NONE}>{t('ad.noDamage')}</option>
                  <option value={DamageStatus.ACCIDENT}>{t('ad.accident')}</option>
                </select>
              </div>
              {getFieldError('damageStatus') && (
                <p className="mt-1 text-sm text-primary-600">{getFieldError('damageStatus')}</p>
              )}
            </div>
          </div>

          {/* Inspection Valid Until - Only for cars, motorcycles, vans - Full width on mobile, half on desktop */}
          <div className="w-full md:w-1/2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('ad.inspectionValidUntil')} <span className="text-gray-400 text-xs">({t('common.optional')})</span>
            </label>
            <input
              type="date"
              value={data.inspectionValidUntil || ''}
              onChange={(e) => updateField('inspectionValidUntil', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              dir="ltr"
            />
          </div>
        </>
      )}

      {/* Condition - For bikes only */}
      {vehicleType === VehicleType.BIKE && (
        <div className="relative z-10">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('ad.condition')} <span className="text-primary-500">*</span>
          </label>
          <div className="relative" style={{ zIndex: 1000 }}>
            <select
              value={data.condition || ''}
              onChange={(e) => updateField('condition', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg ${
                getFieldError('condition') ? 'border-primary-500' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-primary-500`}
              dir={isRTL ? 'rtl' : 'ltr'}
            >
              <option value="">{t('common.select')}...</option>
              <option value="new">{t('ad.new')}</option>
              <option value="used">{t('ad.used')}</option>
            </select>
          </div>
          {getFieldError('condition') && (
            <p className="mt-1 text-sm text-primary-600">{getFieldError('condition')}</p>
          )}
        </div>
      )}

      {/* Price & Postal Code - All vehicle types */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('ad.price')} <span className="text-primary-500">*</span>
          </label>
          <input
            type="number"
            value={data.price || ''}
            onChange={(e) => {
              const value = e.target.value;
              const intValue = value === '' ? undefined : Math.round(parseFloat(value) || 0);
              updateField('price', intValue);
            }}
            placeholder={'25000'}
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('ad.postalCode')} <span className="text-gray-400 text-xs">({t('common.optional')})</span>
          </label>
          <input
            type="text"
            value={data.postalCode || ''}
            onChange={(e) => updateField('postalCode', e.target.value)}
            placeholder={'10115'}
            className={`w-full px-3 py-2 border rounded-lg ${
              getFieldError('postalCode') ? 'border-primary-500' : 'border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-primary-500`}
            dir="ltr"
          />
          {getFieldError('postalCode') && (
            <p className="mt-1 text-sm text-primary-600">{getFieldError('postalCode')}</p>
          )}
        </div>
      </div>
    </div>
  );
}
