/**
 * Category Constants
 * 
 * Centralized constants for the 4 main categories
 * These match the backend MainCategoryType enum
 */

export const MAIN_CATEGORIES = {
  REAL_ESTATE: 'real_estate',
  VEHICLES: 'vehicles',
  SERVICES: 'services',
  JOBS: 'jobs',
} as const;

/**
 * Category display names in Persian
 */
export const CATEGORY_NAMES_FA = {
  [MAIN_CATEGORIES.REAL_ESTATE]: 'املاک',
  [MAIN_CATEGORIES.VEHICLES]: 'خودرو',
  [MAIN_CATEGORIES.SERVICES]: 'خدمات',
  [MAIN_CATEGORIES.JOBS]: 'آگهی استخدام',
} as const;

/**
 * Category display names in German
 */
export const CATEGORY_NAMES_DE = {
  [MAIN_CATEGORIES.REAL_ESTATE]: 'Immobilien',
  [MAIN_CATEGORIES.VEHICLES]: 'Auto, Rad & Boot',
  [MAIN_CATEGORIES.SERVICES]: 'Dienstleistungen',
  [MAIN_CATEGORIES.JOBS]: 'Jobs',
} as const;

