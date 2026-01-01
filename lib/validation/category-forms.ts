/**
 * Client-side validation schemas for category-specific forms
 */

export interface ValidationError {
  field: string;
  message: string;
}

// Real Estate Validation
export function validateRealEstate(data: any): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.offerType) {
    errors.push({ field: 'offerType', message: 'وارد کردن این مقدار اجباری است' });
  }

  if (!data.propertyType) {
    errors.push({ field: 'propertyType', message: 'وارد کردن این مقدار اجباری است' });
  }

  if (data.postalCode && data.postalCode.trim().length > 0 && data.postalCode.trim().length < 5) {
    errors.push({ field: 'postalCode', message: 'کد پستی باید حداقل 5 کاراکتر باشد' });
  }

  if (data.offerType === 'sale' && (!data.price || data.price <= 0)) {
    errors.push({ field: 'price', message: 'وارد کردن این مقدار اجباری است' });
  }

  if (data.offerType === 'rent' && (!data.coldRent || data.coldRent <= 0)) {
    errors.push({ field: 'coldRent', message: 'وارد کردن این مقدار اجباری است' });
  }

  if (!data.livingArea || data.livingArea <= 0) {
    errors.push({ field: 'livingArea', message: 'وارد کردن این مقدار اجباری است' });
  }

  if (!data.rooms || data.rooms <= 0) {
    errors.push({ field: 'rooms', message: 'وارد کردن این مقدار اجباری است' });
  }

  return errors;
}

// Vehicle Validation
export function validateVehicle(data: any): ValidationError[] {
  const errors: ValidationError[] = [];
  const isBike = data.vehicleType === 'bike';

  if (!data.vehicleType) {
    errors.push({ field: 'vehicleType', message: 'وارد کردن این مقدار اجباری است' });
  }

  if (!data.brand || data.brand.trim().length < 2) {
    errors.push({ field: 'brand', message: 'وارد کردن این مقدار اجباری است' });
  }

  if (!data.model || data.model.trim().length < 1) {
    errors.push({ field: 'model', message: 'وارد کردن این مقدار اجباری است' });
  }

  if (!data.year || data.year < 1900 || data.year > new Date().getFullYear() + 1) {
    errors.push({ field: 'year', message: 'وارد کردن این مقدار اجباری است' });
  }

  // Bike type is required for bikes
  if (isBike && !data.bikeType) {
    errors.push({ field: 'bikeType', message: 'وارد کردن این مقدار اجباری است' });
  }

  // Mileage is required for cars, motorcycles, vans, but not for bikes
  if (!isBike && (!data.mileage || data.mileage < 0)) {
    errors.push({ field: 'mileage', message: 'وارد کردن این مقدار اجباری است' });
  }

  // Fuel type and transmission are only required for motorized vehicles
  if (!isBike && !data.fuelType) {
    errors.push({ field: 'fuelType', message: 'وارد کردن این مقدار اجباری است' });
  }

  if (!isBike && !data.transmission) {
    errors.push({ field: 'transmission', message: 'وارد کردن این مقدار اجباری است' });
  }

  if (!data.condition) {
    errors.push({ field: 'condition', message: 'وارد کردن این مقدار اجباری است' });
  }

  // Damage status is only required for motorized vehicles
  if (!isBike && !data.damageStatus) {
    errors.push({ field: 'damageStatus', message: 'وارد کردن این مقدار اجباری است' });
  }

  if (!data.price || data.price <= 0) {
    errors.push({ field: 'price', message: 'وارد کردن این مقدار اجباری است' });
  }

  if (data.postalCode && data.postalCode.trim().length > 0 && data.postalCode.trim().length < 5) {
    errors.push({ field: 'postalCode', message: 'کد پستی باید حداقل 5 کاراکتر باشد' });
  }

  return errors;
}

// Service Validation
export function validateService(data: any): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.serviceCategory) {
    errors.push({ field: 'serviceCategory', message: 'وارد کردن این مقدار اجباری است' });
  }

  if (!data.pricingType) {
    errors.push({ field: 'pricingType', message: 'وارد کردن این مقدار اجباری است' });
  }

  if (data.pricingType && data.pricingType !== 'negotiable' && (!data.price || data.price <= 0)) {
    errors.push({ field: 'price', message: 'وارد کردن این مقدار اجباری است' });
  }

  return errors;
}

// Job Validation
export function validateJob(data: any): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.jobTitle || data.jobTitle.trim().length < 3) {
    errors.push({ field: 'jobTitle', message: 'وارد کردن این مقدار اجباری است' });
  }

  if (!data.jobDescription || data.jobDescription.trim().length < 10) {
    errors.push({ field: 'jobDescription', message: 'وارد کردن این مقدار اجباری است' });
  }

  if (!data.jobType) {
    errors.push({ field: 'jobType', message: 'وارد کردن این مقدار اجباری است' });
  }

  if (!data.industry || data.industry.trim().length < 2) {
    errors.push({ field: 'industry', message: 'وارد کردن این مقدار اجباری است' });
  }

  if (!data.companyName || data.companyName.trim().length < 2) {
    errors.push({ field: 'companyName', message: 'وارد کردن این مقدار اجباری است' });
  }

  return errors;
}

