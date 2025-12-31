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
  // #region agent log
  fetch('http://127.0.0.1:7245/ingest/8e3d4fb4-043c-450e-b118-fed88d4cad9f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'validation/category-forms.ts:validateVehicle',message:'Vehicle validation started',data:{dataKeys:Object.keys(data),data},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  // #endregion

  const errors: ValidationError[] = [];

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

  if (!data.mileage || data.mileage < 0) {
    errors.push({ field: 'mileage', message: 'وارد کردن این مقدار اجباری است' });
  }

  if (!data.fuelType) {
    errors.push({ field: 'fuelType', message: 'وارد کردن این مقدار اجباری است' });
  }

  if (!data.transmission) {
    errors.push({ field: 'transmission', message: 'وارد کردن این مقدار اجباری است' });
  }

  if (!data.condition) {
    errors.push({ field: 'condition', message: 'وارد کردن این مقدار اجباری است' });
  }

  if (!data.damageStatus) {
    errors.push({ field: 'damageStatus', message: 'وارد کردن این مقدار اجباری است' });
  }

  if (!data.price || data.price <= 0) {
    errors.push({ field: 'price', message: 'وارد کردن این مقدار اجباری است' });
  }

  if (data.postalCode && data.postalCode.trim().length > 0 && data.postalCode.trim().length < 5) {
    errors.push({ field: 'postalCode', message: 'کد پستی باید حداقل 5 کاراکتر باشد' });
  }

  // #region agent log
  fetch('http://127.0.0.1:7245/ingest/8e3d4fb4-043c-450e-b118-fed88d4cad9f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'validation/category-forms.ts:validateVehicle',message:'Vehicle validation completed',data:{errorsCount:errors.length,errors},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  // #endregion

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

