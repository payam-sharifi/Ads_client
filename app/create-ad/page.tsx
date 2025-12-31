'use client';

import React, { useEffect, useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { useI18n } from '@/lib/contexts/I18nContext';
import { useAuthStore } from '@/lib/stores/authStore';
import { useCityStore } from '@/lib/stores/cityStore';
import { useCategories } from '@/lib/hooks/useCategories';
import { useCities } from '@/lib/hooks/useCities';
import { getLocalizedCategoryName, getLocalizedName } from '@/lib/utils/localizedNames';
import { useCreateAd } from '@/lib/hooks/useAds';
import { useUploadImage } from '@/lib/hooks/useImages';
import { MainCategoryType } from '@/lib/types/category.types';
import RealEstateForm from '@/components/ads/RealEstateForm';
import VehicleForm from '@/components/ads/VehicleForm';
import ServiceForm from '@/components/ads/ServiceForm';
import JobForm from '@/components/ads/JobForm';
import { validateRealEstate, validateVehicle, validateService, validateJob } from '@/lib/validation/category-forms';
import Button from '@/components/common/Button';
import { toast } from 'react-toastify';

type FormStep = 1 | 2 | 3;

export default function CreateAdPage() {
  const router = useRouter();
  const { t, locale, isRTL } = useI18n();
  const { isAuthenticated, user } = useAuthStore();
  const { selectedCityId, setSelectedCity } = useCityStore();
  const [currentStep, setCurrentStep] = useState<FormStep>(1);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  
  // Step 1: Category & City
  const [step1Data, setStep1Data] = useState({
    categoryId: '',
    subcategoryId: '',
    cityId: selectedCityId || '',
  });

  // Step 2: Basic Info
  const [step2Data, setStep2Data] = useState({
    title: '',
    description: '',
    condition: 'USED' as 'NEW' | 'LIKE_NEW' | 'USED',
    showEmail: false,
    showPhone: false,
  });

  // Step 3: Category-specific details (metadata)
  const [step3Data, setStep3Data] = useState<Record<string, any>>({});
  const [step3Errors, setStep3Errors] = useState<Record<string, string>>({});
  const [isMobile, setIsMobile] = React.useState(false);
  
  React.useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/login');
    }
  }, [isAuthenticated, user, router]);

  // Load city from store on mount
  useEffect(() => {
    if (selectedCityId && !step1Data.cityId) {
      setStep1Data(prev => ({ ...prev, cityId: selectedCityId }));
    }
  }, [selectedCityId]);

  // Fetch data
  const { data: categories } = useCategories();
  const { data: cities } = useCities();
  
  const filteredCities = cities?.filter(city => {
    const cityNameFa = city.name?.fa?.toLowerCase() || '';
    const cityNameDe = city.name?.de?.toLowerCase() || '';
    const cityNameEn = city.name?.en?.toLowerCase() || '';
    return !cityNameFa.includes('تهران') && !cityNameDe.includes('tehran') && !cityNameEn.includes('tehran');
  }) || [];
  
  const createAdMutation = useCreateAd();
  const uploadImageMutation = useUploadImage();

  const selectedCategory = categories?.find((c) => c.id === step1Data.categoryId);
  const categoryType = selectedCategory?.categoryType as MainCategoryType | undefined;

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setImageFiles((prev) => {
      const total = prev.length + acceptedFiles.length;
      if (total > 3) {
        toast.error(isRTL ? 'شما می‌توانید حداکثر 3 عکس آپلود کنید' : 'You can upload a maximum of 3 images');
        const remaining = 3 - prev.length;
        return remaining > 0 ? [...prev, ...acceptedFiles.slice(0, remaining)] : prev;
      }
      return [...prev, ...acceptedFiles];
    });
  }, [isRTL]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
    },
    multiple: true,
    noClick: false, // Enable click on mobile
    noKeyboard: false,
    disabled: imageFiles.length >= 3,
  });

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleStep1Change = (name: string, value: string) => {
    setStep1Data((prev) => {
      const newData = { ...prev, [name]: value };
      if (name === 'categoryId') {
        setStep3Data({}); // Reset category-specific data when category changes
      }
      return newData;
    });
  };

  const handleStep2Change = (name: string, value: string | boolean) => {
    setStep2Data((prev) => ({ ...prev, [name]: value }));
  };

  const handleStep3Change = (data: Record<string, any>) => {
    setStep3Data((prev) => ({ ...prev, ...data }));
    // Clear errors for updated fields
    const clearedErrors = { ...step3Errors };
    Object.keys(data).forEach((key) => {
      delete clearedErrors[key];
    });
    setStep3Errors(clearedErrors);
  };

  const validateStep1 = () => {
    if (!step1Data.categoryId) {
      toast.error(isRTL ? 'لطفا دسته‌بندی را انتخاب کنید' : 'Please select a category');
      return false;
    }
    if (!step1Data.cityId) {
      toast.error(isRTL ? 'لطفا شهر را انتخاب کنید' : 'Please select a city');
      return false;
    }
    // Save city to store
    if (step1Data.cityId) {
      setSelectedCity(step1Data.cityId);
    }
    return true;
  };

  const validateStep2 = () => {
    if (!step2Data.title.trim() || step2Data.title.trim().length < 3) {
      toast.error(isRTL ? 'عنوان باید حداقل 3 کاراکتر باشد' : 'Title must be at least 3 characters');
      return false;
    }
    if (!step2Data.description.trim() || step2Data.description.trim().length < 10) {
      toast.error(isRTL ? 'توضیحات باید حداقل 10 کاراکتر باشد' : 'Description must be at least 10 characters');
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (!categoryType) {
      return true; // No category selected, skip validation
    }

    let errors: any[] = [];
    const errorMap: Record<string, string> = {};

    switch (categoryType) {
      case MainCategoryType.REAL_ESTATE:
        errors = validateRealEstate(step3Data);
        break;
      case MainCategoryType.VEHICLES:
        errors = validateVehicle(step3Data);
        break;
      case MainCategoryType.SERVICES:
        errors = validateService(step3Data);
        break;
      case MainCategoryType.JOBS:
        errors = validateJob(step3Data);
        break;
    }

    // Convert errors array to error map
    errors.forEach((error) => {
      errorMap[error.field] = error.message;
    });

    setStep3Errors(errorMap);

    if (errors.length > 0) {
      toast.error(isRTL ? 'لطفا فیلدهای الزامی را تکمیل کنید' : 'Please fill in all required fields');
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (validateStep1()) {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      if (validateStep2()) {
        setCurrentStep(3);
      }
    }
  };

  // Reset errors when step changes
  useEffect(() => {
    if (currentStep !== 3) {
      setStep3Errors({});
    }
  }, [currentStep]);

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as FormStep);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep1() || !validateStep2() || !validateStep3()) {
      return;
    }

    // Validate images based on category
    const requiresImages = categoryType !== MainCategoryType.JOBS;
    if (requiresImages && imageFiles.length === 0) {
      toast.error(isRTL ? 'حداقل یک تصویر الزامی است' : 'At least one image is required');
      return;
    }

    if (imageFiles.length > 3) {
      toast.error(isRTL ? 'شما می‌توانید حداکثر 3 عکس آپلود کنید' : 'You can upload a maximum of 3 images');
      return;
    }
    
    try {
      const conditionMap: Record<string, string> = {
        'NEW': 'new',
        'LIKE_NEW': 'like-new',
        'USED': 'used',
      };
      
      // Build request data with category-specific fields
      const requestData: any = {
        title: step2Data.title.trim(),
        description: step2Data.description.trim(),
        categoryId: step1Data.categoryId,
        cityId: step1Data.cityId,
        showEmail: step2Data.showEmail || false,
        showPhone: step2Data.showPhone || false,
        ...step3Data, // Merge all category-specific fields
      };

      // For vehicles, add condition from step2
      if (categoryType === MainCategoryType.VEHICLES && step2Data.condition) {
        requestData.condition = step2Data.condition;
      }

      // For jobs, use jobTitle and jobDescription from step3Data, fallback to title/description
      if (categoryType === MainCategoryType.JOBS) {
        if (step3Data.jobTitle) {
          requestData.title = step3Data.jobTitle;
        }
        if (step3Data.jobDescription) {
          requestData.description = step3Data.jobDescription;
        }
      }

      // Price handling
      if (categoryType === MainCategoryType.REAL_ESTATE) {
        // Real estate uses price or coldRent
        requestData.price = step3Data.price || step3Data.coldRent || 0;
      } else if (categoryType === MainCategoryType.VEHICLES) {
        requestData.price = step3Data.price || 0;
      } else if (categoryType === MainCategoryType.SERVICES) {
        requestData.price = step3Data.price || 0;
      } else {
        requestData.price = 0; // Jobs don't have price
      }
      
      const newAd = await createAdMutation.mutateAsync(requestData);

      if (!newAd || !newAd.id) {
        throw new Error('Failed to create ad: No ID returned');
      }

      // Upload images
      if (imageFiles.length > 0 && newAd.id) {
        for (let index = 0; index < imageFiles.length; index++) {
          const file = imageFiles[index];
          try {
            await uploadImageMutation.mutateAsync({
              adId: newAd.id,
              file,
              order: index + 1,
            });
          } catch (uploadError: any) {
            console.error(`Failed to upload image ${index + 1}:`, uploadError);
            toast.error(`Failed to upload image ${index + 1}: ${uploadError?.response?.data?.message || uploadError?.message}`);
          }
        }
      }

      toast.success(isRTL ? 'آگهی با موفقیت ایجاد شد! پس از بررسی منتشر خواهد شد.' : 'Ad created successfully! It will be reviewed before being published.');
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (error: any) {
      console.error('Create ad error:', error);
      let errorMessage = isRTL ? 'خطا در ایجاد آگهی' : 'Failed to create ad';
      
      if (error?.response?.data) {
        const errorData = error.response.data;
        if (errorData.message && Array.isArray(errorData.message)) {
          const validationErrors = errorData.message.map((err: any) => {
            if (typeof err === 'string') return err;
            return Object.values(err.constraints || {}).join(', ');
          }).join('\n');
          errorMessage = validationErrors;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    }
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="w-full min-h-screen overflow-visible">
      <div className="container mx-auto px-4 py-8 max-w-4xl pb-40 md:pb-8 overflow-visible">
        <h1 className="text-3xl font-bold mb-8">{isRTL ? 'ثبت آگهی جدید' : 'Create New Ad'}</h1>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((step) => (
              <React.Fragment key={step}>
                <div className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      currentStep >= step
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {step}
                  </div>
                  <span className={`ml-2 text-sm font-medium ${currentStep >= step ? 'text-red-600' : 'text-gray-600'}`}>
                    {step === 1 && (isRTL ? 'دسته‌بندی و شهر' : 'Category & City')}
                    {step === 2 && (isRTL ? 'اطلاعات پایه' : 'Basic Info')}
                    {step === 3 && (isRTL ? 'جزئیات و تصاویر' : 'Details & Images')}
                  </span>
                </div>
                {step < 3 && (
                  <div className={`flex-1 h-1 mx-4 ${currentStep > step ? 'bg-red-600' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md space-y-6 mb-8 overflow-visible relative">
          {/* Step 1: Category & City */}
        {currentStep === 1 && (
          <div className="space-y-6 overflow-visible">
            <h2 className="text-2xl font-bold mb-4">{isRTL ? 'انتخاب دسته‌بندی و شهر' : 'Select Category & City'}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative z-10">
                <label className="block text-sm font-medium mb-2">{isRTL ? 'دسته‌بندی' : 'Category'}</label>
                <select
                  value={step1Data.categoryId}
                  onChange={(e) => handleStep1Change('categoryId', e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 relative z-20"
                  style={{ zIndex: 1000 }}
                >
                  <option value="">{isRTL ? 'انتخاب کنید' : 'Please select'}</option>
                  {categories?.filter(cat => !cat.parentId && cat.categoryType).map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {getLocalizedCategoryName(cat.name, locale)}
                    </option>
                  ))}
                </select>
              </div>

            </div>

            <div className="relative z-10">
              <label className="block text-sm font-medium mb-2">{isRTL ? 'شهر' : 'City'}</label>
              <select
                value={step1Data.cityId}
                onChange={(e) => handleStep1Change('cityId', e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 relative z-20"
                style={{ zIndex: 1000 }}
              >
                <option value="">{isRTL ? 'انتخاب کنید' : 'Please select'}</option>
                {filteredCities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {getLocalizedName(city.name, locale)}
                  </option>
                ))}
              </select>
              {selectedCityId && (
                <p className="text-sm text-gray-500 mt-1">
                  {isRTL ? 'شهر انتخاب شده از صفحه اصلی' : 'City selected from homepage'}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Basic Info */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">{isRTL ? 'اطلاعات پایه آگهی' : 'Basic Ad Information'}</h2>
            
            <div>
              <label className="block text-sm font-medium mb-2">{isRTL ? 'عنوان آگهی' : 'Ad Title'}</label>
              <input
                type="text"
                value={step2Data.title}
                onChange={(e) => handleStep2Change('title', e.target.value)}
                required
                placeholder={isRTL ? 'مثال: آپارتمان 3 خوابه در مرکز شهر' : 'Example: 3-bedroom apartment in city center'}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{isRTL ? 'توضیحات' : 'Description'}</label>
              <textarea
                value={step2Data.description}
                onChange={(e) => handleStep2Change('description', e.target.value)}
                required
                rows={8}
                placeholder={isRTL ? 'توضیحات کامل آگهی را اینجا بنویسید...' : 'Write detailed description here...'}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* Condition field - only show for Vehicles */}
            {categoryType === MainCategoryType.VEHICLES && (
              <div className="relative z-10">
                <label className="block text-sm font-medium mb-2">{isRTL ? 'وضعیت' : 'Condition'}</label>
                <select
                  value={step2Data.condition}
                  onChange={(e) => handleStep2Change('condition', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 relative z-20"
                  style={{ zIndex: 1000 }}
                >
                  <option value="NEW">{isRTL ? 'نو' : 'New'}</option>
                  <option value="LIKE_NEW">{isRTL ? 'در حد نو' : 'Like New'}</option>
                  <option value="USED">{isRTL ? 'کارکرده' : 'Used'}</option>
                </select>
              </div>
            )}

            {/* Privacy Settings */}
            <div className="border-t border-gray-200 pt-6 mt-6">
              <h3 className="text-lg font-semibold mb-4">{isRTL ? 'تنظیمات حریم خصوصی' : 'Privacy Settings'}</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={step2Data.showEmail}
                    onChange={(e) => handleStep2Change('showEmail', e.target.checked)}
                    className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
                  />
                  <span className="text-sm text-gray-700">
                    {isRTL ? 'نمایش عمومی ایمیل من' : 'Show my email publicly'}
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={step2Data.showPhone}
                    onChange={(e) => handleStep2Change('showPhone', e.target.checked)}
                    className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
                  />
                  <span className="text-sm text-gray-700">
                    {isRTL ? 'نمایش عمومی شماره موبایل من' : 'Show my phone number publicly'}
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Category-specific Details & Images */}
        {currentStep === 3 && (
          <div className="space-y-6 w-full">
            <h2 className="text-2xl font-bold mb-4">{isRTL ? 'جزئیات و تصاویر' : 'Details & Images'}</h2>
            
            {/* Category-specific Forms */}
            {categoryType && (
              <div 
                className="space-y-4 p-4 bg-gray-50 rounded-lg overflow-y-auto overflow-x-visible"
                style={{ 
                  WebkitOverflowScrolling: 'touch', 
                  overflowY: 'auto',
                  overflowX: 'visible',
                  touchAction: 'pan-y',
                  maxHeight: isMobile ? '400px' : '600px',
                  height: 'auto'
                }}
              >
                {categoryType === MainCategoryType.REAL_ESTATE && (
                  <RealEstateForm 
                    data={step3Data} 
                    onChange={handleStep3Change}
                    errors={step3Errors}
                  />
                )}
                {categoryType === MainCategoryType.VEHICLES && (
                  <VehicleForm 
                    data={step3Data} 
                    onChange={handleStep3Change}
                    errors={step3Errors}
                  />
                )}
                {categoryType === MainCategoryType.SERVICES && (
                  <ServiceForm 
                    data={step3Data} 
                    onChange={handleStep3Change}
                    errors={step3Errors}
                  />
                )}
                {categoryType === MainCategoryType.JOBS && (
                  <JobForm 
                    data={step3Data} 
                    onChange={handleStep3Change}
                    errors={step3Errors}
                  />
                )}
              </div>
            )}

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium mb-2">
                {isRTL ? 'تصاویر' : 'Images'} 
                <span className="text-gray-500 text-xs ml-2">
                  ({isRTL ? 'حداکثر 3 عکس' : 'Max 3 images'}: {imageFiles.length}/3)
                </span>
              </label>
              <div
                {...getRootProps({
                  onClick: (e) => {
                    if (imageFiles.length >= 3) {
                      e.preventDefault();
                      e.stopPropagation();
                      return;
                    }
                  }
                })}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors touch-manipulation relative ${
                  imageFiles.length >= 3 
                    ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50' 
                    : isDragActive 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-gray-300 hover:border-gray-400 active:bg-gray-50'
                }`}
                style={{ WebkitTapHighlightColor: 'transparent', minHeight: '120px' }}
              >
                <input 
                  {...getInputProps({
                    disabled: imageFiles.length >= 3,
                    onClick: (e) => {
                      e.stopPropagation();
                    },
                    style: { display: 'block', width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, opacity: 0, cursor: 'pointer', zIndex: 10, pointerEvents: 'auto' }
                  })} 
                />
                <p className="text-gray-600 pointer-events-none">
                  {imageFiles.length >= 3
                    ? (isRTL ? 'حداکثر 3 عکس آپلود شده است' : 'Maximum 3 images uploaded')
                    : isDragActive
                    ? (isRTL ? 'تصاویر را اینجا رها کنید' : 'Drop images here')
                    : (isRTL ? 'تصاویر را بکشید و رها کنید یا کلیک کنید' : 'Drag and drop images or click to select')}
                </p>
              </div>

              {imageFiles.length > 0 && (
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mt-4">
                  {imageFiles.map((file, index) => (
                    <div key={index} className="relative group">
                      <div className="relative h-20 md:h-24 w-full rounded-lg overflow-hidden bg-gray-100">
                        <Image
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-sm"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-4 justify-between">
          <div>
            {currentStep > 1 && (
              <Button type="button" variant="outline" onClick={handleBack}>
                {isRTL ? 'قبلی' : 'Back'}
              </Button>
            )}
          </div>
          <div className="flex gap-4">
            {currentStep < 3 ? (
              <Button type="button" onClick={handleNext} className="flex-1">
                {isRTL ? 'بعدی' : 'Next'}
              </Button>
            ) : (
              <Button type="submit" className="flex-1" disabled={createAdMutation.isPending}>
                {createAdMutation.isPending ? (isRTL ? 'در حال ایجاد...' : 'Creating...') : (isRTL ? 'ثبت آگهی' : 'Create Ad')}
              </Button>
            )}
            <Button type="button" variant="outline" onClick={() => router.back()}>
              {isRTL ? 'لغو' : 'Cancel'}
            </Button>
          </div>
        </div>
      </form>
      </div>
    </div>
  );
}
