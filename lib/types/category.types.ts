/**
 * Category Types - Frontend
 * 
 * Matches backend category structure
 */

export enum MainCategoryType {
  REAL_ESTATE = 'real_estate',
  VEHICLES = 'vehicles',
  SERVICES = 'services',
  JOBS = 'jobs',
  MISC = 'misc',
}

export interface Category {
  id: string;
  name: {
    fa?: string;
    de?: string;
    en?: string;
  };
  icon?: string;
  categoryType?: MainCategoryType;
  parentId?: string | null;
  parent?: Category;
  children?: Category[];
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
}

// Real Estate Types
export enum RealEstateOfferType {
  SALE = 'sale',
  RENT = 'rent',
}

export enum PropertyType {
  APARTMENT = 'apartment',
  HOUSE = 'house',
  COMMERCIAL = 'commercial',
  LAND = 'land',
  PARKING = 'parking',
}

export interface RealEstateMetadata {
  offerType: RealEstateOfferType;
  propertyType: PropertyType;
  postalCode: string;
  district?: string;
  price?: number;
  coldRent?: number;
  additionalCosts?: number;
  deposit?: number;
  livingArea: number;
  rooms: number;
  floor?: number;
  totalFloors?: number;
  yearBuilt?: number;
  availableFrom?: string;
  furnished?: boolean;
  balcony?: boolean;
  elevator?: boolean;
  parkingIncluded?: boolean;
  cellar?: boolean;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
}

// Vehicle Types
export enum VehicleType {
  CAR = 'car',
  MOTORCYCLE = 'motorcycle',
  VAN = 'van',
  BIKE = 'bike',
}

export enum FuelType {
  PETROL = 'petrol',
  DIESEL = 'diesel',
  ELECTRIC = 'electric',
  HYBRID = 'hybrid',
}

export enum TransmissionType {
  MANUAL = 'manual',
  AUTOMATIC = 'automatic',
}

export enum DamageStatus {
  NONE = 'none',
  ACCIDENT = 'accident',
}

export enum BikeType {
  NORMAL = 'normal',
  ELECTRIC = 'electric',
}

export interface VehicleMetadata {
  vehicleType: VehicleType;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  fuelType: FuelType;
  transmission: TransmissionType;
  powerHP?: number;
  condition: 'new' | 'used';
  damageStatus: DamageStatus;
  inspectionValidUntil?: string;
  postalCode: string;
  contactName?: string;
  contactPhone?: string;
  // Additional fields for different vehicle types
  engineSize?: number; // CC for motorcycles/cars
  frameSize?: string; // For bikes
  gears?: number; // Number of gears for bikes
  brakeType?: string; // Brake type for bikes
  wheelSize?: string; // Wheel size for bikes
  bikeType?: BikeType; // Electric or normal bike
  doors?: number; // Number of doors for cars
  seats?: number; // Number of seats
  loadCapacity?: number; // Load capacity for vans (kg)
  price?: number; // Price
}

// Service Types
export enum ServiceCategory {
  HOME_SERVICES = 'home_services',
  TRANSPORT = 'transport',
  REPAIRS = 'repairs',
  IT_DESIGN = 'it_design',
  EDUCATION = 'education',
  PERSONAL_SERVICES = 'personal_services',
}

export enum PricingType {
  FIXED = 'fixed',
  HOURLY = 'hourly',
  NEGOTIABLE = 'negotiable',
}

export interface ServiceMetadata {
  serviceCategory: ServiceCategory;
  pricingType: PricingType;
  price?: number;
  serviceRadius?: number;
  experienceYears?: number;
  certificates?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
}

// Job Types
export enum JobType {
  FULL_TIME = 'full-time',
  PART_TIME = 'part-time',
  MINI_JOB = 'mini-job',
  FREELANCE = 'freelance',
  INTERNSHIP = 'internship',
}

export enum ExperienceLevel {
  JUNIOR = 'junior',
  MID = 'mid',
  SENIOR = 'senior',
}

export enum SalaryType {
  HOURLY = 'hourly',
  MONTHLY = 'monthly',
}

export interface JobMetadata {
  jobTitle: string;
  jobDescription: string;
  jobType: JobType;
  industry: string;
  experienceLevel?: ExperienceLevel;
  educationRequired?: string;
  languageRequired?: string;
  remotePossible?: boolean;
  salaryFrom?: number;
  salaryTo?: number;
  salaryType?: SalaryType;
  companyName: string;
  contactName: string;
  contactEmail: string;
}

export type CategoryMetadata = 
  | RealEstateMetadata 
  | VehicleMetadata 
  | ServiceMetadata 
  | JobMetadata;

