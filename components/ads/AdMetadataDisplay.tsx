'use client';

import React from 'react';
import { useI18n } from '@/lib/contexts/I18nContext';
import { MainCategoryType, RealEstateMetadata, VehicleMetadata, ServiceMetadata, JobMetadata } from '@/lib/types/category.types';
import { Ad } from '@/lib/hooks/useAds';

interface AdMetadataDisplayProps {
  ad: Ad;
}

export default function AdMetadataDisplay({ ad }: AdMetadataDisplayProps) {
  const { locale, isRTL } = useI18n();
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
              {isRTL ? 'نوع آگهی' : 'Offer Type'}
            </span>
            <span className="font-medium text-gray-900">
              {realEstate.offerType === 'sale' ? (isRTL ? 'فروش' : 'Sale') : (isRTL ? 'اجاره' : 'Rent')}
            </span>
          </div>
        )}
        {realEstate.propertyType && (
          <div>
            <span className="text-sm text-gray-500 block mb-1">
              {isRTL ? 'نوع ملک' : 'Property Type'}
            </span>
            <span className="font-medium text-gray-900 capitalize">
              {realEstate.propertyType}
            </span>
          </div>
        )}
        {realEstate.postalCode && (
          <div>
            <span className="text-sm text-gray-500 block mb-1">
              {isRTL ? 'کد پستی' : 'Postal Code'}
            </span>
            <span className="font-medium text-gray-900">{realEstate.postalCode}</span>
          </div>
        )}
        {realEstate.district && (
          <div>
            <span className="text-sm text-gray-500 block mb-1">
              {isRTL ? 'محله' : 'District'}
            </span>
            <span className="font-medium text-gray-900">{realEstate.district}</span>
          </div>
        )}
        {realEstate.price && (
          <div>
            <span className="text-sm text-gray-500 block mb-1">
              {isRTL ? 'قیمت فروش' : 'Sale Price'}
            </span>
            <span className="font-medium text-gray-900">{realEstate.price.toLocaleString()} €</span>
          </div>
        )}
        {realEstate.coldRent && (
          <div>
            <span className="text-sm text-gray-500 block mb-1">
              {isRTL ? 'اجاره پایه' : 'Cold Rent'}
            </span>
            <span className="font-medium text-gray-900">{realEstate.coldRent.toLocaleString()} €</span>
          </div>
        )}
        {realEstate.additionalCosts && (
          <div>
            <span className="text-sm text-gray-500 block mb-1">
              {isRTL ? 'هزینه اضافی' : 'Additional Costs'}
            </span>
            <span className="font-medium text-gray-900">{realEstate.additionalCosts.toLocaleString()} €</span>
          </div>
        )}
        {realEstate.deposit && (
          <div>
            <span className="text-sm text-gray-500 block mb-1">
              {isRTL ? 'ودیعه' : 'Deposit'}
            </span>
            <span className="font-medium text-gray-900">{realEstate.deposit.toLocaleString()} €</span>
          </div>
        )}
        {realEstate.livingArea && (
          <div>
            <span className="text-sm text-gray-500 block mb-1">
              {isRTL ? 'متراژ' : 'Living Area'}
            </span>
            <span className="font-medium text-gray-900">{realEstate.livingArea} m²</span>
          </div>
        )}
        {realEstate.rooms && (
          <div>
            <span className="text-sm text-gray-500 block mb-1">
              {isRTL ? 'تعداد اتاق' : 'Rooms'}
            </span>
            <span className="font-medium text-gray-900">{realEstate.rooms}</span>
          </div>
        )}
        {realEstate.floor !== undefined && (
          <div>
            <span className="text-sm text-gray-500 block mb-1">
              {isRTL ? 'طبقه' : 'Floor'}
            </span>
            <span className="font-medium text-gray-900">{realEstate.floor}</span>
          </div>
        )}
        {realEstate.totalFloors && (
          <div>
            <span className="text-sm text-gray-500 block mb-1">
              {isRTL ? 'تعداد طبقات' : 'Total Floors'}
            </span>
            <span className="font-medium text-gray-900">{realEstate.totalFloors}</span>
          </div>
        )}
        {realEstate.yearBuilt && (
          <div>
            <span className="text-sm text-gray-500 block mb-1">
              {isRTL ? 'سال ساخت' : 'Year Built'}
            </span>
            <span className="font-medium text-gray-900">{realEstate.yearBuilt}</span>
          </div>
        )}
        {realEstate.availableFrom && (
          <div>
            <span className="text-sm text-gray-500 block mb-1">
              {isRTL ? 'موجود از' : 'Available From'}
            </span>
            <span className="font-medium text-gray-900">
              {new Date(realEstate.availableFrom).toLocaleDateString(locale === 'fa' ? 'fa-IR' : 'de-DE')}
            </span>
          </div>
        )}
        <div className="sm:col-span-2">
          <span className="text-sm text-gray-500 block mb-2">
            {isRTL ? 'ویژگی‌ها' : 'Features'}
          </span>
          <div className="flex flex-wrap gap-2">
            {realEstate.furnished && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                {isRTL ? 'مبله' : 'Furnished'}
              </span>
            )}
            {realEstate.balcony && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                {isRTL ? 'بالکن' : 'Balcony'}
              </span>
            )}
            {realEstate.elevator && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                {isRTL ? 'آسانسور' : 'Elevator'}
              </span>
            )}
            {realEstate.parkingIncluded && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                {isRTL ? 'پارکینگ' : 'Parking'}
              </span>
            )}
            {realEstate.cellar && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                {isRTL ? 'انباری' : 'Cellar'}
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
              {isRTL ? 'نوع خودرو' : 'Vehicle Type'}
            </span>
            <span className="font-medium text-gray-900 capitalize">
              {vehicle.vehicleType}
            </span>
          </div>
        )}
        {vehicle.brand && (
          <div>
            <span className="text-sm text-gray-500 block mb-1">
              {isRTL ? 'برند' : 'Brand'}
            </span>
            <span className="font-medium text-gray-900">{vehicle.brand}</span>
          </div>
        )}
        {vehicle.model && (
          <div>
            <span className="text-sm text-gray-500 block mb-1">
              {isRTL ? 'مدل' : 'Model'}
            </span>
            <span className="font-medium text-gray-900">{vehicle.model}</span>
          </div>
        )}
        {vehicle.year && (
          <div>
            <span className="text-sm text-gray-500 block mb-1">
              {isRTL ? 'سال' : 'Year'}
            </span>
            <span className="font-medium text-gray-900">{vehicle.year}</span>
          </div>
        )}
        {vehicle.mileage && (
          <div>
            <span className="text-sm text-gray-500 block mb-1">
              {isRTL ? 'کارکرد' : 'Mileage'}
            </span>
            <span className="font-medium text-gray-900">
              {vehicle.mileage.toLocaleString()} km
            </span>
          </div>
        )}
        {vehicle.fuelType && (
          <div>
            <span className="text-sm text-gray-500 block mb-1">
              {isRTL ? 'نوع سوخت' : 'Fuel Type'}
            </span>
            <span className="font-medium text-gray-900 capitalize">
              {vehicle.fuelType}
            </span>
          </div>
        )}
        {vehicle.transmission && (
          <div>
            <span className="text-sm text-gray-500 block mb-1">
              {isRTL ? 'گیربکس' : 'Transmission'}
            </span>
            <span className="font-medium text-gray-900">
              {vehicle.transmission === 'manual' ? (isRTL ? 'دستی' : 'Manual') :
               vehicle.transmission === 'automatic' ? (isRTL ? 'اتوماتیک' : 'Automatic') :
               vehicle.transmission}
            </span>
          </div>
        )}
        {vehicle.powerHP && (
          <div>
            <span className="text-sm text-gray-500 block mb-1">
              {isRTL ? 'قدرت' : 'Power'}
            </span>
            <span className="font-medium text-gray-900">{vehicle.powerHP} HP</span>
          </div>
        )}
        {vehicle.condition && (
          <div>
            <span className="text-sm text-gray-500 block mb-1">
              {isRTL ? 'وضعیت' : 'Condition'}
            </span>
            <span className="font-medium text-gray-900 capitalize">
              {vehicle.condition === 'new' ? (isRTL ? 'نو' : 'New') : (isRTL ? 'کارکرده' : 'Used')}
            </span>
          </div>
        )}
        {vehicle.damageStatus && (
          <div>
            <span className="text-sm text-gray-500 block mb-1">
              {isRTL ? 'وضعیت تصادف' : 'Damage Status'}
            </span>
            <span className="font-medium text-gray-900">
              {vehicle.damageStatus === 'none' ? (isRTL ? 'بدون تصادف' : 'No Damage') :
               vehicle.damageStatus === 'accident' ? (isRTL ? 'تصادف داشته' : 'Accident') :
               vehicle.damageStatus}
            </span>
          </div>
        )}
        {vehicle.inspectionValidUntil && (
          <div>
            <span className="text-sm text-gray-500 block mb-1">
              {isRTL ? 'معاینه فنی تا' : 'Inspection Valid Until'}
            </span>
            <span className="font-medium text-gray-900">
              {new Date(vehicle.inspectionValidUntil).toLocaleDateString(locale === 'fa' ? 'fa-IR' : 'de-DE')}
            </span>
          </div>
        )}
        {vehicle.postalCode && (
          <div>
            <span className="text-sm text-gray-500 block mb-1">
              {isRTL ? 'کد پستی' : 'Postal Code'}
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
              {isRTL ? 'دسته خدمات' : 'Service Category'}
            </span>
            <span className="font-medium text-gray-900 capitalize">
              {service.serviceCategory.replace('_', ' ')}
            </span>
          </div>
        )}
        {service.pricingType && (
          <div>
            <span className="text-sm text-gray-500 block mb-1">
              {isRTL ? 'نوع قیمت‌گذاری' : 'Pricing Type'}
            </span>
            <span className="font-medium text-gray-900 capitalize">
              {service.pricingType}
            </span>
          </div>
        )}
        {service.price && (
          <div>
            <span className="text-sm text-gray-500 block mb-1">
              {service.pricingType === 'hourly' ? (isRTL ? 'قیمت ساعتی' : 'Price per Hour') : (isRTL ? 'قیمت' : 'Price')}
            </span>
            <span className="font-medium text-gray-900">{service.price.toLocaleString()} €</span>
          </div>
        )}
        {service.serviceRadius && (
          <div>
            <span className="text-sm text-gray-500 block mb-1">
              {isRTL ? 'شعاع خدمات' : 'Service Radius'}
            </span>
            <span className="font-medium text-gray-900">{service.serviceRadius} km</span>
          </div>
        )}
        {service.experienceYears && (
          <div>
            <span className="text-sm text-gray-500 block mb-1">
              {isRTL ? 'سال‌های تجربه' : 'Years of Experience'}
            </span>
            <span className="font-medium text-gray-900">{service.experienceYears}</span>
          </div>
        )}
        {service.certificates && (
          <div className="sm:col-span-2">
            <span className="text-sm text-gray-500 block mb-1">
              {isRTL ? 'گواهینامه‌ها' : 'Certificates'}
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
              {isRTL ? 'نوع شغل' : 'Job Type'}
            </span>
            <span className="font-medium text-gray-900 capitalize">
              {job.jobType.replace('-', ' ')}
            </span>
          </div>
        )}
        {job.industry && (
          <div>
            <span className="text-sm text-gray-500 block mb-1">
              {isRTL ? 'صنعت' : 'Industry'}
            </span>
            <span className="font-medium text-gray-900">{job.industry}</span>
          </div>
        )}
        {job.experienceLevel && (
          <div>
            <span className="text-sm text-gray-500 block mb-1">
              {isRTL ? 'سطح تجربه' : 'Experience Level'}
            </span>
            <span className="font-medium text-gray-900 capitalize">
              {job.experienceLevel}
            </span>
          </div>
        )}
        {job.educationRequired && (
          <div>
            <span className="text-sm text-gray-500 block mb-1">
              {isRTL ? 'تحصیلات مورد نیاز' : 'Education Required'}
            </span>
            <span className="font-medium text-gray-900">{job.educationRequired}</span>
          </div>
        )}
        {job.languageRequired && (
          <div>
            <span className="text-sm text-gray-500 block mb-1">
              {isRTL ? 'زبان مورد نیاز' : 'Language Required'}
            </span>
            <span className="font-medium text-gray-900">{job.languageRequired}</span>
          </div>
        )}
        {job.remotePossible !== undefined && (
          <div>
            <span className="text-sm text-gray-500 block mb-1">
              {isRTL ? 'کار از راه دور' : 'Remote Work'}
            </span>
            <span className="font-medium text-gray-900">
              {job.remotePossible ? (isRTL ? 'بله' : 'Yes') : (isRTL ? 'خیر' : 'No')}
            </span>
          </div>
        )}
        {(job.salaryFrom || job.salaryTo) && (
          <div>
            <span className="text-sm text-gray-500 block mb-1">
              {isRTL ? 'حقوق' : 'Salary'}
            </span>
            <span className="font-medium text-gray-900">
              {job.salaryFrom && job.salaryTo
                ? `${job.salaryFrom.toLocaleString()} - ${job.salaryTo.toLocaleString()} €`
                : job.salaryFrom
                ? `${isRTL ? 'از' : 'From'} ${job.salaryFrom.toLocaleString()} €`
                : `${isRTL ? 'تا' : 'Up to'} ${job.salaryTo?.toLocaleString()} €`}
              {job.salaryType && ` ${job.salaryType === 'hourly' ? (isRTL ? '/ساعت' : '/hour') : (isRTL ? '/ماه' : '/month')}`}
            </span>
          </div>
        )}
        {job.companyName && (
          <div>
            <span className="text-sm text-gray-500 block mb-1">
              {isRTL ? 'نام شرکت' : 'Company Name'}
            </span>
            <span className="font-medium text-gray-900">{job.companyName}</span>
          </div>
        )}
      </div>
    );
  }

  return null;
}

