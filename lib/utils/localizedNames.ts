import { Locale } from '@/lib/i18n';
import { PropertyType, ServiceCategory } from '@/lib/types/category.types';

/**
 * Multilingual name structure from backend
 */
export interface MultilingualName {
  fa?: string;
  de?: string;
  en?: string;
}

/**
 * Get localized name for categories and cities
 * Returns the name in the specified locale, with fallback to other languages
 * 
 * @param name - Multilingual name object from backend
 * @param locale - Current locale (fa, de, en)
 * @returns Localized name string
 */
export function getLocalizedName(
  name: MultilingualName | undefined | null,
  locale: Locale
): string {
  if (!name) return '';
  
  // Priority: current locale -> fallback languages
  if (locale === 'fa') {
    return name.fa || name.de || name.en || '';
  } else if (locale === 'de') {
    return name.de || name.fa || name.en || '';
  } else {
    // English
    return name.en || name.de || name.fa || '';
  }
}

/**
 * Get localized name for categories (fa/de only, no en)
 * Used when English is not supported
 */
export function getLocalizedCategoryName(
  name: MultilingualName | undefined | null,
  locale: Locale
): string {
  if (!name) return '';
  
  if (locale === 'fa') {
    return name.fa || name.de || '';
  } else {
    // German or English - use German
    return name.de || name.fa || '';
  }
}

/**
 * Get localized name for property types
 */
export function getLocalizedPropertyType(
  propertyType: PropertyType | string | undefined | null,
  locale: Locale
): string {
  if (!propertyType) return '';
  
  const propertyTypeMap: Record<PropertyType, { fa: string; de: string }> = {
    [PropertyType.APARTMENT]: { fa: 'آپارتمان', de: 'Wohnung' },
    [PropertyType.HOUSE]: { fa: 'خانه', de: 'Haus' },
    [PropertyType.COMMERCIAL]: { fa: 'تجاری', de: 'Gewerbe' },
    [PropertyType.LAND]: { fa: 'زمین', de: 'Grundstück' },
    [PropertyType.PARKING]: { fa: 'پارکینگ', de: 'Parkplatz' },
  };
  
  const type = propertyType as PropertyType;
  const localized = propertyTypeMap[type];
  
  if (!localized) return String(propertyType);
  
  return locale === 'fa' ? localized.fa : localized.de;
}

/**
 * Get localized name for service categories
 */
export function getLocalizedServiceCategory(
  serviceCategory: ServiceCategory | string | undefined | null,
  locale: Locale
): string {
  if (!serviceCategory) return '';
  
  const serviceCategoryMap: Record<ServiceCategory, { fa: string; de: string }> = {
    [ServiceCategory.CONSTRUCTION]: { fa: 'ساختمان', de: 'Bauwesen' },
    [ServiceCategory.TRANSPORT]: { fa: 'حمل و نقل', de: 'Transport' },
    [ServiceCategory.SHIPPING]: { fa: 'ارسال بار', de: 'Versand' },
    [ServiceCategory.REPAIRS]: { fa: 'تعمیرات', de: 'Reparaturen' },
    [ServiceCategory.EDUCATION]: { fa: 'آموزش', de: 'Bildung' },
    [ServiceCategory.PERSONAL_SERVICES]: { fa: 'خدمات شخصی', de: 'Persönliche Dienstleistungen' },
  };
  
  const type = serviceCategory as ServiceCategory;
  const localized = serviceCategoryMap[type];
  
  if (!localized) return String(serviceCategory).replace('_', ' ');
  
  return locale === 'fa' ? localized.fa : localized.de;
}
