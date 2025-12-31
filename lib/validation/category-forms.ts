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
    errors.push({ field: 'offerType', message: 'نوع آگهی الزامی است' });
  }

  if (!data.propertyType) {
    errors.push({ field: 'propertyType', message: 'نوع ملک الزامی است' });
  }

  if (!data.postalCode || data.postalCode.trim().length < 5) {
    errors.push({ field: 'postalCode', message: 'کد پستی باید حداقل 5 کاراکتر باشد' });
  }

  if (data.offerType === 'sale' && (!data.price || data.price <= 0)) {
    errors.push({ field: 'price', message: 'قیمت فروش الزامی است' });
  }

  if (data.offerType === 'rent' && (!data.coldRent || data.coldRent <= 0)) {
    errors.push({ field: 'coldRent', message: 'اجاره پایه الزامی است' });
  }

  if (!data.livingArea || data.livingArea <= 0) {
    errors.push({ field: 'livingArea', message: 'متراژ الزامی است' });
  }

  if (!data.rooms || data.rooms <= 0) {
    errors.push({ field: 'rooms', message: 'تعداد اتاق الزامی است' });
  }

  if (!data.contactName || data.contactName.trim().length < 2) {
    errors.push({ field: 'contactName', message: 'نام تماس باید حداقل 2 کاراکتر باشد' });
  }

  if (!data.contactPhone || data.contactPhone.trim().length < 10) {
    errors.push({ field: 'contactPhone', message: 'شماره تماس باید حداقل 10 کاراکتر باشد' });
  }

  return errors;
}

// Vehicle Validation
export function validateVehicle(data: any): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.vehicleType) {
    errors.push({ field: 'vehicleType', message: 'نوع خودرو الزامی است' });
  }

  if (!data.brand || data.brand.trim().length < 2) {
    errors.push({ field: 'brand', message: 'برند باید حداقل 2 کاراکتر باشد' });
  }

  if (!data.model || data.model.trim().length < 1) {
    errors.push({ field: 'model', message: 'مدل الزامی است' });
  }

  if (!data.year || data.year < 1900 || data.year > new Date().getFullYear() + 1) {
    errors.push({ field: 'year', message: 'سال ساخت معتبر نیست' });
  }

  if (!data.mileage || data.mileage < 0) {
    errors.push({ field: 'mileage', message: 'کارکرد الزامی است' });
  }

  if (!data.fuelType) {
    errors.push({ field: 'fuelType', message: 'نوع سوخت الزامی است' });
  }

  if (!data.transmission) {
    errors.push({ field: 'transmission', message: 'نوع گیربکس الزامی است' });
  }

  if (!data.condition) {
    errors.push({ field: 'condition', message: 'وضعیت الزامی است' });
  }

  if (!data.damageStatus) {
    errors.push({ field: 'damageStatus', message: 'وضعیت تصادف الزامی است' });
  }

  if (!data.price || data.price <= 0) {
    errors.push({ field: 'price', message: 'قیمت الزامی است' });
  }

  if (!data.postalCode || data.postalCode.trim().length < 5) {
    errors.push({ field: 'postalCode', message: 'کد پستی باید حداقل 5 کاراکتر باشد' });
  }

  if (!data.contactName || data.contactName.trim().length < 2) {
    errors.push({ field: 'contactName', message: 'نام تماس باید حداقل 2 کاراکتر باشد' });
  }

  if (!data.contactPhone || data.contactPhone.trim().length < 10) {
    errors.push({ field: 'contactPhone', message: 'شماره تماس باید حداقل 10 کاراکتر باشد' });
  }

  return errors;
}

// Service Validation
export function validateService(data: any): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.serviceCategory) {
    errors.push({ field: 'serviceCategory', message: 'دسته خدمات الزامی است' });
  }

  if (!data.pricingType) {
    errors.push({ field: 'pricingType', message: 'نوع قیمت‌گذاری الزامی است' });
  }

  if (data.pricingType && data.pricingType !== 'negotiable' && (!data.price || data.price <= 0)) {
    errors.push({ field: 'price', message: 'قیمت الزامی است' });
  }

  if (!data.contactName || data.contactName.trim().length < 2) {
    errors.push({ field: 'contactName', message: 'نام تماس باید حداقل 2 کاراکتر باشد' });
  }

  if (!data.contactPhone || data.contactPhone.trim().length < 10) {
    errors.push({ field: 'contactPhone', message: 'شماره تماس باید حداقل 10 کاراکتر باشد' });
  }

  return errors;
}

// Job Validation
export function validateJob(data: any): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data.jobTitle || data.jobTitle.trim().length < 3) {
    errors.push({ field: 'jobTitle', message: 'عنوان شغل باید حداقل 3 کاراکتر باشد' });
  }

  if (!data.jobDescription || data.jobDescription.trim().length < 10) {
    errors.push({ field: 'jobDescription', message: 'توضیحات شغل باید حداقل 10 کاراکتر باشد' });
  }

  if (!data.jobType) {
    errors.push({ field: 'jobType', message: 'نوع شغل الزامی است' });
  }

  if (!data.industry || data.industry.trim().length < 2) {
    errors.push({ field: 'industry', message: 'صنعت باید حداقل 2 کاراکتر باشد' });
  }

  if (!data.companyName || data.companyName.trim().length < 2) {
    errors.push({ field: 'companyName', message: 'نام شرکت باید حداقل 2 کاراکتر باشد' });
  }

  if (!data.contactName || data.contactName.trim().length < 2) {
    errors.push({ field: 'contactName', message: 'نام تماس باید حداقل 2 کاراکتر باشد' });
  }

  if (!data.contactEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contactEmail)) {
    errors.push({ field: 'contactEmail', message: 'ایمیل معتبر الزامی است' });
  }

  return errors;
}

