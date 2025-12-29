import { Locale } from '@/lib/i18n';

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

