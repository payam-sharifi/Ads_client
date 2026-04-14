'use client';

import React from 'react';
import { useI18n } from '@/lib/contexts/I18nContext';
import { MainCategoryType, RealEstateMetadata, VehicleMetadata, ServiceMetadata, JobMetadata } from '@/lib/types/category.types';
import { Ad } from '@/lib/hooks/useAds';
import { getLocalizedPropertyType, getLocalizedHouseSubtype, getLocalizedServiceCategory } from '@/lib/utils/localizedNames';

interface AdMetadataDisplayProps {
  ad: Ad;
}

export default function AdMetadataDisplay({ ad }: AdMetadataDisplayProps) {
  const { locale, isRTL,t } = useI18n();
  const metadata = ad.metadata || {};
  const categoryType = ad.category?.categoryType as MainCategoryType | undefined;

  if (!categoryType || !metadata) {
    return null;
  }

  // Real Estate Display
  if (categoryType === MainCategoryType.REAL_ESTATE) {
    const realEstate = metadata as RealEstateMetadata;
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {realEstate.offerType && (
          <div>
            <span className="text-sm text-gray-500 block mb-1">
              {t('ad.offerType')}
            </span>
            <span className="font-medium text-gray-900">
              {realEstate.offerType === 'sale' ? t('ad.offerTypeSale') : t('ad.offerTypeRent')}
            </span>
          </div>
        )}
        {realEstate.propertyType && (
          <div>
            <span className="text-sm text-gray-500 block mb-1">
              {t('ad.propertyType')}
            </span>
            <span className="font-medium text-gray-900">
              {getLocalizedPropertyType(realEstate.propertyType, locale)}
            </span>
          </div>
        )}
        {realEstate.houseSubtype && (
          <div>
            <span className="text-sm text-gray-500 block mb-1">{t('ad.houseSubtype')}</span>
            <span className="font-medium text-gray-900">
              {getLocalizedHouseSubtype(realEstate.houseSubtype, locale)}
            </span>
          </div>
        )}
        {realEstate.plotArea != null && realEstate.plotArea > 0 && (
          <div>
            <span className="text-sm text-gray-500 block mb-1">{t('ad.plotArea')}</span>
            <span className="font-medium text-gray-900">{realEstate.plotArea} m²</span>
          </div>
        )}
        {realEstate.postalCode && (
          <div>
            <span className="text-sm text-gray-500 block mb-1">
              {t('ad.postalCode')}
            </span>
            <span className="font-medium text-gray-900">{realEstate.postalCode}</span>
          </div>
        )}
        {realEstate.district && (
          <div>
            <span className="text-sm text-gray-500 block mb-1">
             {t('ad.district')}
            </span>
            <span className="font-medium text-gray-900">{realEstate.district}</span>
          </div>
        )}
        {realEstate.price && (
          <div>
            <span className="text-sm text-gray-500 block mb-1">
              {t('ad.price')}
            </span>
            <span className="font-medium text-gray-900">{realEstate.price.toLocaleString()} €</span>
          </div>
        )}
        {realEstate.coldRent && (
          <div>
            <span className="text-sm text-gray-500 block mb-1">
              {t('ad.coldRent')}
            </span>
            <span className="font-medium text-gray-900">{realEstate.coldRent.toLocaleString()} €</span>
          </div>
        )}
        {realEstate.additionalCosts && (
          <div>
            <span className="text-sm text-gray-500 block mb-1">
              {t('ad.additionalCosts')}
            </span>
            <span className="font-medium text-gray-900">{realEstate.additionalCosts.toLocaleString()} €</span>
          </div>
        )}
        {realEstate.deposit && (
          <div>
            <span className="text-sm text-gray-500 block mb-1">
              {t('ad.deposit')}
            </span>
            <span className="font-medium text-gray-900">{realEstate.deposit.toLocaleString()} €</span>
          </div>
        )}
        {realEstate.livingArea && (
          <div>
            <span className="text-sm text-gray-500 block mb-1">
              {t('ad.livingArea')}
            </span>
            <span className="font-medium text-gray-900">{realEstate.livingArea} m²</span>
          </div>
        )}
        {realEstate.rooms && (
          <div>
            <span className="text-sm text-gray-500 block mb-1">
              {t('ad.rooms')}
            </span>
            <span className="font-medium text-gray-900">{realEstate.rooms}</span>
          </div>
        )}
        {realEstate.floor !== undefined && (
          <div>
            <span className="text-sm text-gray-500 block mb-1">
              {t('ad.floor')}
            </span>
            <span className="font-medium text-gray-900">{realEstate.floor}</span>
          </div>
        )}
        {realEstate.totalFloors && (
          <div>
            <span className="text-sm text-gray-500 block mb-1">
              {t('ad.totalFloors')}
            </span>
            <span className="font-medium text-gray-900">{realEstate.totalFloors}</span>
          </div>
        )}
        {realEstate.yearBuilt && (
          <div>
            <span className="text-sm text-gray-500 block mb-1">
              {t('ad.yearBuilt')}
            </span>
            <span className="font-medium text-gray-900">{realEstate.yearBuilt}</span>
          </div>
        )}
        {realEstate.availableFrom && (
          <div>
            <span className="text-sm text-gray-500 block mb-1">
              {t('ad.availableFrom')}
            </span>
            <span className="font-medium text-gray-900">
              {new Date(realEstate.availableFrom).toLocaleDateString(locale === 'fa' ? 'fa-IR' : 'de-DE')}
            </span>
          </div>
        )}
        <div className="sm:col-span-2">
          <span className="text-sm text-gray-500 block mb-2">
            {t('ad.features')}
          </span>
          <div className="flex flex-wrap gap-2">
            {realEstate.furnished && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                {t('ad.furnished')}
              </span>
            )}
            {realEstate.balcony && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                {t('ad.balcony')}
              </span>
            )}
            {realEstate.terrace && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                {t('ad.terrace')}
              </span>
            )}
            {realEstate.elevator && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                {t('ad.elevator')}
              </span>
            )}
            {realEstate.parkingIncluded && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                {t('ad.parking')}
              </span>
            )}
            {realEstate.cellar && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                {t('ad.cellar')}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Vehicle Display
  if (categoryType === MainCategoryType.VEHICLES) {
    const vehicle = metadata as VehicleMetadata;
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {vehicle.vehicleType && (
          <div>
            <span className="text-sm text-gray-500 block mb-1">
              {t('ad.vehicleType')}
            </span>
            <span className="font-medium text-gray-900 capitalize">
              {vehicle.vehicleType}
            </span>
          </div>
        )}
        {vehicle.brand && (
          <div>
            <span className="text-sm text-gray-500 block mb-1">
              {t('ad.brand')}
            </span>
            <span className="font-medium text-gray-900">{vehicle.brand}</span>
          </div>
        )}
        {vehicle.model && (
          <div>
            <span className="text-sm text-gray-500 block mb-1">
              {t('ad.model')}
            </span>
            <span className="font-medium text-gray-900">{vehicle.model}</span>
          </div>
        )}
        {vehicle.year && (
          <div>
            <span className="text-sm text-gray-500 block mb-1">
              {t('ad.year')}
            </span>
            <span className="font-medium text-gray-900">{vehicle.year}</span>
          </div>
        )}
        {vehicle.mileage && (
          <div>
            <span className="text-sm text-gray-500 block mb-1">
              {t('ad.mileage')}
            </span>
            <span className="font-medium text-gray-900">
              {vehicle.mileage.toLocaleString()} km
            </span>
          </div>
        )}
        {vehicle.fuelType && (
          <div>
            <span className="text-sm text-gray-500 block mb-1">
              {t('ad.fuelType')}
            </span>
            <span className="font-medium text-gray-900 capitalize">
              {vehicle.fuelType}
            </span>
          </div>
        )}
        {vehicle.transmission && (
          <div>
            <span className="text-sm text-gray-500 block mb-1">
              {t('ad.transmission')}
            </span>
            <span className="font-medium text-gray-900">
              {vehicle.transmission === 'manual' ? t('ad.manual') :
               vehicle.transmission === 'automatic' ? t('ad.automatic') :
               vehicle.transmission}
            </span>
          </div>
        )}
        {vehicle.powerHP && (
          <div>
            <span className="text-sm text-gray-500 block mb-1">
              {t('ad.power')}
            </span>
            <span className="font-medium text-gray-900">{vehicle.powerHP} HP</span>
          </div>
        )}
        {vehicle.condition && (
          <div>
            <span className="text-sm text-gray-500 block mb-1">
              {t('ad.condition')}
            </span>
            <span className="font-medium text-gray-900 capitalize">
              {vehicle.condition === 'new' ? t('ad.new') : t('ad.used')}
            </span>
          </div>
        )}
        {vehicle.damageStatus && (
          <div>
            <span className="text-sm text-gray-500 block mb-1">
              {t('ad.damageStatus')}
            </span>
            <span className="font-medium text-gray-900">
              {vehicle.damageStatus === 'none' ? t('ad.noDamage') :
               vehicle.damageStatus === 'accident' ? t('ad.accident') :
               vehicle.damageStatus}
            </span>
          </div>
        )}
        {vehicle.inspectionValidUntil && (
          <div>
            <span className="text-sm text-gray-500 block mb-1">
              {t('ad.inspectionValidUntil')}
            </span>
            <span className="font-medium text-gray-900">
              {new Date(vehicle.inspectionValidUntil).toLocaleDateString(locale === 'fa' ? 'fa-IR' : 'de-DE')}
            </span>
          </div>
        )}
        {vehicle.postalCode && (
          <div>
            <span className="text-sm text-gray-500 block mb-1">
              {t('ad.postalCode')}
            </span>
            <span className="font-medium text-gray-900">{vehicle.postalCode}</span>
          </div>
        )}
      </div>
    );
  }

  // Service Display
  if (categoryType === MainCategoryType.SERVICES) {
    const service = metadata as ServiceMetadata;
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {service.serviceCategory && (
          <div>
            <span className="text-sm text-gray-500 block mb-1">
              {t('ad.serviceCategory')}
            </span>
            <span className="font-medium text-gray-900 capitalize">
              {getLocalizedServiceCategory(service.serviceCategory, locale)}
            </span>
          </div>
        )}
        {service.pricingType && (
          <div>
            <span className="text-sm text-gray-500 block mb-1">
              {t('ad.pricingType')}
            </span>
            <span className="font-medium text-gray-900 capitalize">
              {service.pricingType}
            </span>
          </div>
        )}
        {service.price && (
          <div>
            <span className="text-sm text-gray-500 block mb-1">
              {service.pricingType === 'hourly' ? t('ad.pricePerHour') : t('ad.price')}
            </span>
            <span className="font-medium text-gray-900">{service.price.toLocaleString()} €</span>
          </div>
        )}
        {service.serviceRadius && (
          <div>
            <span className="text-sm text-gray-500 block mb-1">
              {t('ad.areaOrDistrict')}
            </span>
            <span className="font-medium text-gray-900">{service.serviceRadius}</span>
          </div>
        )}
        {service.experienceYears && (
          <div>
            <span className="text-sm text-gray-500 block mb-1">
              {t('ad.yearsOfExperience')}
            </span>
            <span className="font-medium text-gray-900">{service.experienceYears}</span>
          </div>
        )}
        {service.certificates && (
          <div className="sm:col-span-2">
            <span className="text-sm text-gray-500 block mb-1">
              {t('ad.certificates')}
            </span>
            <span className="font-medium text-gray-900">{service.certificates}</span>
          </div>
        )}
      </div>
    );
  }

  // Job Display
  if (categoryType === MainCategoryType.JOBS) {
    const job = metadata as JobMetadata;
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {job.jobType && (
          <div>
            <span className="text-sm text-gray-500 block mb-1">
              {t('ad.jobType')}
            </span>
            <span className="font-medium text-gray-900 capitalize">
              {job.jobType.replace('-', ' ')}
            </span>
          </div>
        )}
        {job.industry && (
          <div>
            <span className="text-sm text-gray-500 block mb-1">
              {t('ad.industry')}
            </span>
            <span className="font-medium text-gray-900">{job.industry}</span>
          </div>
        )}
        {job.experienceLevel && (
          <div>
            <span className="text-sm text-gray-500 block mb-1">
              {t('ad.experienceLevel')}
            </span>
            <span className="font-medium text-gray-900 capitalize">
              {job.experienceLevel}
            </span>
          </div>
        )}
        {job.educationRequired && (
          <div>
            <span className="text-sm text-gray-500 block mb-1">
              {t('ad.educationRequired')}
            </span>
            <span className="font-medium text-gray-900">{job.educationRequired}</span>
          </div>
        )}
        {job.languageRequired && (
          <div>
            <span className="text-sm text-gray-500 block mb-1">
              {t('ad.languageRequired')}
            </span>
            <span className="font-medium text-gray-900">{job.languageRequired}</span>
          </div>
        )}
        {job.remotePossible !== undefined && (
          <div>
            <span className="text-sm text-gray-500 block mb-1">
              {t('ad.remoteWork')}
            </span>
            <span className="font-medium text-gray-900">
              {job.remotePossible ? t('ad.yes') : t('ad.no')}
            </span>
          </div>
        )}
        {(job.salaryFrom || job.salaryTo) && (
          <div>
            <span className="text-sm text-gray-500 block mb-1">
              {t('ad.salary')}
            </span>
            <span className="font-medium text-gray-900">
              {job.salaryFrom && job.salaryTo
                ? `${job.salaryFrom.toLocaleString()} - ${job.salaryTo.toLocaleString()} €`
                : job.salaryFrom
                ? `${t('ad.from')} ${job.salaryFrom.toLocaleString()} €`
                : `${t('ad.upTo')} ${job.salaryTo?.toLocaleString()} €`}
              {job.salaryType && ` ${job.salaryType === 'hourly' ? t('ad.hourly') : t('ad.monthly')}`}
            </span>
          </div>
        )}
        {job.companyName && (
          <div>
            <span className="text-sm text-gray-500 block mb-1">
              {t('ad.companyName')}
            </span>
            <span className="font-medium text-gray-900">{job.companyName}</span>
          </div>
        )}
      </div>
    );
  }

  return null;
}

