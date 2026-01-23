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
    cityId: '',
    showInAllCities: false,
  });

  // Step 2: Basic Info
  const [step2Data, setStep2Data] = useState({
    title: '',
    description: '',
    showEmail: false,
    showPhone: false,
    price: undefined as number | undefined,
    isNegotiable: false,
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

  // Load city from store on mount and sync when selectedCityId changes
  useEffect(() => {
    // Only set if we have a valid city ID (not null, not 'all', not empty)
    if (selectedCityId && selectedCityId !== 'all' && typeof selectedCityId === 'string' && selectedCityId.trim() !== '') {
      setStep1Data(prev => {
        // Only update if different to avoid unnecessary re-renders
        if (prev.cityId !== selectedCityId) {
          return { ...prev, cityId: selectedCityId };
        }
        return prev;
      });
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
        // If switching to MISC and we're on step 3, go back to step 2 (MISC only has 2 steps)
        if (value) {
          const newCategory = categories?.find((c) => c.id === value);
          if (newCategory?.categoryType === MainCategoryType.MISC && currentStep === 3) {
            setCurrentStep(2);
          }
        }
      }
      return newData;
    });
  };

  const handleStep2Change = (name: string, value: string | boolean | number | undefined) => {
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
    if (!step1Data.showInAllCities && !step1Data.cityId) {
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
    if (!categoryType) {
      return true; // No category selected, skip validation
    }

    // For Misc category, validate title and description in step 2
    if (categoryType === MainCategoryType.MISC) {
      if (!step2Data.title.trim() || step2Data.title.trim().length < 3) {
        toast.error(isRTL ? 'عنوان باید حداقل 3 کاراکتر باشد' : 'Title must be at least 3 characters');
        return false;
      }
      if (!step2Data.description.trim() || step2Data.description.trim().length < 10) {
        toast.error(isRTL ? 'توضیحات باید حداقل 10 کاراکتر باشد' : 'Description must be at least 10 characters');
        return false;
      }
      // Validate price if not negotiable
      if (!step2Data.isNegotiable && (!step2Data.price || step2Data.price <= 0)) {
        toast.error(isRTL ? 'لطفا قیمت را وارد کنید' : 'Please enter a price');
        return false;
      }
      return true;
    }


    let errors: any[] = [];
    const errorMap: Record<string, string> = {};

    // Use step3Data directly for validation (condition is now only in step2 for vehicles)
    const validationData = step3Data;


    switch (categoryType) {
      case MainCategoryType.REAL_ESTATE:
        errors = validateRealEstate(validationData);
        break;
      case MainCategoryType.VEHICLES:
        errors = validateVehicle(validationData);
        break;
      case MainCategoryType.SERVICES:
        errors = validateService(validationData);
        break;
      case MainCategoryType.JOBS:
        errors = validateJob(validationData);
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

  const validateStep3 = () => {
    // For Jobs, title and description are in Step 2, so skip validation here
    // For Misc, validation is done in step 2, so skip here
    if (categoryType === MainCategoryType.JOBS || categoryType === MainCategoryType.MISC) {
      return true;
    }
    
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

  const handleNext = () => {
    if (currentStep === 1) {
      if (validateStep1()) {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      if (validateStep2()) {
        // For MISC category, step 2 is the final step, so don't go to step 3
        if (categoryType === MainCategoryType.MISC) {
          // Step 2 is final for MISC, submit will be handled by form
          return;
        }
        setCurrentStep(3);
      }
    }
  };

  // Reset errors when step changes
  useEffect(() => {
    if (currentStep !== 2) {
      setStep3Errors({});
    }
  }, [currentStep]);

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as FormStep);
    }
  };

  const handleStepClick = (step: number) => {
    // Allow clicking on completed steps (steps that are before current step)
    if (step < currentStep) {
      setCurrentStep(step as FormStep);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep1() || !validateStep2() || !validateStep3()) {
      return;
    }

    // Validate images based on category
    const requiresImages = categoryType !== MainCategoryType.JOBS && categoryType !== MainCategoryType.MISC;
    if (requiresImages && imageFiles.length === 0) {
      toast.error(isRTL ? 'حداقل یک تصویر الزامی است' : 'At least one image is required');
      return;
    }

    if (imageFiles.length > 3) {
      toast.error(isRTL ? 'شما می‌توانید حداکثر 3 عکس آپلود کنید' : 'You can upload a maximum of 3 images');
      return;
    }
    
    try {
      // Build request data with category-specific fields
      const requestData: any = {
        title: step2Data.title.trim(),
        description: step2Data.description.trim(),
        categoryId: step1Data.categoryId,
        cityId: step1Data.showInAllCities ? undefined : step1Data.cityId,
        showEmail: step2Data.showEmail || false,
        showPhone: step2Data.showPhone || false,
        ...step3Data, // Merge all category-specific fields (condition is now in step3Data for vehicles)
      };

      // For vehicles, ensure condition is in lowercase format expected by backend
      if (categoryType === MainCategoryType.VEHICLES && requestData.condition) {
        // Convert uppercase to lowercase (USED -> used, NEW -> new)
        requestData.condition = requestData.condition.toLowerCase();
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
      } else if (categoryType === MainCategoryType.MISC) {
        // For MISC: use price from step2Data, or 0 if negotiable
        requestData.price = step2Data.isNegotiable ? 0 : (step2Data.price || 0);
        // Store negotiable flag in metadata
        if (step2Data.isNegotiable) {
          requestData.metadata = { ...requestData.metadata, isNegotiable: true };
        }
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
      <div className="container mx-auto px-4 py-8 max-w-xl pb-40 md:pb-8 overflow-visible">
        <h1 className="text-3xl font-bold mb-8">{isRTL ? 'ثبت آگهی جدید' : 'Create New Ad'}</h1>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center w-full">
            {(categoryType === MainCategoryType.MISC ? [1, 2] : [1, 2, 3]).map((step) => {
              const isCompleted = step < currentStep;
              const isClickable = isCompleted;
              
              return (
                <React.Fragment key={step}>
                  <div 
                    className={`flex items-center flex-shrink-0 ${isClickable ? 'cursor-pointer' : 'cursor-default'}`}
                    onClick={() => isClickable && handleStepClick(step)}
                  >
                    <div
                      className={`w-6 h-6 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-xs md:text-base transition-colors ${
                        currentStep >= step
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-200 text-gray-600'
                      } ${isClickable ? 'hover:bg-red-700' : ''}`}
                    >
                      {step}
                    </div>
                    <span className={`ml-1 md:ml-2 text-xs md:text-sm font-medium whitespace-nowrap transition-colors ${currentStep >= step ? 'text-red-600' : 'text-gray-600'} ${isClickable ? 'hover:text-red-700' : ''}`}>
                      {step === 1 && (isRTL ? 'دسته‌بندی و شهر' : 'Category & City')}
                      {step === 2 && categoryType === MainCategoryType.MISC && (isRTL ? 'اطلاعات و تصاویر' : 'Info & Images')}
                      {step === 2 && categoryType !== MainCategoryType.MISC && (isRTL ? 'جزئیات و تصاویر' : 'Details & Images')}
                      {step === 3 && (isRTL ? 'اطلاعات پایه' : 'Basic Info')}
                    </span>
                  </div>
                  {((categoryType === MainCategoryType.MISC && step < 2) || (categoryType !== MainCategoryType.MISC && step < 3)) && (
                    <div 
                      className={`flex-1 h-[2px] md:h-1.5 mx-1 md:mx-4 transition-colors ${currentStep > step ? 'bg-red-600' : 'bg-gray-500'} ${isClickable ? 'cursor-pointer hover:bg-red-700' : ''}`} 
                      style={{ minWidth: '16px' }}
                      onClick={() => isClickable && handleStepClick(step)}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md space-y-6 mb-8 overflow-visible relative">
          {/* Step 1: Category & City */}
        {currentStep === 1 && (
          <div className="space-y-6 overflow-visible">
            <h2 className="text-2xl font-bold mb-4">{isRTL ? 'انتخاب دسته‌بندی و شهر' : 'Select Category & City'}</h2>
            
            <div className="space-y-4">
              <div className="relative z-10 w-full md:w-1/2">
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

              <div className="relative z-10 w-full md:w-1/2">
                <label className={`block text-sm font-medium mb-2 ${step1Data.showInAllCities ? 'text-gray-400' : ''}`}>
                  {isRTL ? 'شهر' : 'City'}
                </label>
                <select
                  value={step1Data.cityId}
                  onChange={(e) => handleStep1Change('cityId', e.target.value)}
                  required={!step1Data.showInAllCities}
                  disabled={step1Data.showInAllCities}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 relative z-20 transition-colors ${
                    step1Data.showInAllCities 
                      ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' 
                      : 'border-gray-300'
                  }`}
                  style={{ zIndex: 1000 }}
                >
                  <option value="">{isRTL ? 'انتخاب کنید' : 'Please select'}</option>
                  {filteredCities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {getLocalizedName(city.name, locale)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Show in all cities toggle */}
              <div className="flex items-center gap-3 py-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      checked={step1Data.showInAllCities}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setStep1Data(prev => ({
                          ...prev,
                          showInAllCities: checked,
                          // Clear cityId if checking "all cities"
                          cityId: checked ? '' : prev.cityId
                        }));
                      }}
                      className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-gray-300 transition-all checked:border-red-600 checked:bg-red-600 focus:outline-none"
                    />
                    <svg
                      className="pointer-events-none absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-red-600 transition-colors">
                    {isRTL ? 'نمایش در کل شهرها' : 'Show in all cities'}
                  </span>
                </label>
              </div>
            </div>

            {selectedCityId && (
              <p className="text-sm text-gray-500 mt-1">
                {isRTL ? 'شهر انتخاب شده از صفحه اصلی' : 'City selected from homepage'}
              </p>
            )}
          </div>
        )}

        {/* Step 2: Category-specific Details & Images (or Info & Images for MISC) */}
        {currentStep === 2 && (
          <div className="space-y-6 w-full">
            <h2 className="text-2xl font-bold mb-4">
              {categoryType === MainCategoryType.MISC 
                ? (isRTL ? 'اطلاعات و تصاویر' : 'Info & Images')
                : (isRTL ? 'جزئیات و تصاویر' : 'Details & Images')
              }
            </h2>
            
            {/* For MISC: Show Title, Description, and Images in Step 2 */}
            {categoryType === MainCategoryType.MISC && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">{isRTL ? 'عنوان آگهی' : 'Ad Title'}</label>
                  <input
                    type="text"
                    value={step2Data.title}
                    onChange={(e) => handleStep2Change('title', e.target.value)}
                    required
                    placeholder={isRTL ? 'عنوان آگهی را وارد کنید' : 'Enter ad title'}
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

                {/* Price Field for MISC */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold mb-4">{isRTL ? 'قیمت' : 'Price'}</h3>
                  <div className="space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={step2Data.isNegotiable}
                        onChange={(e) => {
                          handleStep2Change('isNegotiable', e.target.checked);
                          if (e.target.checked) {
                            handleStep2Change('price', undefined);
                          }
                        }}
                        className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
                      />
                      <span className="text-sm text-gray-700">
                        {isRTL ? 'قیمت توافقی' : 'Negotiable Price'}
                      </span>
                    </label>
                    {!step2Data.isNegotiable && (
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          {isRTL ? 'قیمت (€)' : 'Price (€)'} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={step2Data.price || ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            const numValue = value === '' ? undefined : Math.round(parseFloat(value) || 0);
                            handleStep2Change('price', numValue);
                          }}
                          placeholder={isRTL ? 'قیمت را وارد کنید' : 'Enter price'}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                          dir="ltr"
                          min="0"
                          step="1"
                          required={!step2Data.isNegotiable}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Privacy Settings for MISC */}
                <div className="border-t border-gray-200 pt-6">
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
              </>
            )}
            
            {/* Category-specific Forms (for non-MISC categories) */}
            {categoryType && categoryType !== MainCategoryType.MISC && (
              <div className="space-y-4">
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
            <div className={`border-t border-gray-300 pt-6 ${categoryType === MainCategoryType.MISC ? '' : 'mt-6'}`}>
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
                className={`border-2 border-dashed rounded-lg p-4 md:p-6 text-center cursor-pointer transition-colors touch-manipulation relative ${
                  imageFiles.length >= 3 
                    ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50' 
                    : isDragActive 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-gray-300 hover:border-gray-400 active:bg-gray-50'
                }`}
                style={{ WebkitTapHighlightColor: 'transparent', minHeight: '60px' }}
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
                <p className="text-gray-600 pointer-events-none text-sm">
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

        {/* Step 3: Basic Info */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">{isRTL ? 'عنوان' : 'Title'}</h2>
            
            {/* Title and Description - Hidden for Jobs and Misc (will be in Step 2 for Jobs, not needed for Misc) */}
            {categoryType !== MainCategoryType.JOBS && categoryType !== MainCategoryType.MISC && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">{isRTL ? 'عنوان آگهی' : 'Ad Title'}</label>
                  <input
                    type="text"
                    value={step2Data.title}
                    onChange={(e) => handleStep2Change('title', e.target.value)}
                    required
                    placeholder={
                      categoryType === MainCategoryType.REAL_ESTATE
                        ? (isRTL ? 'مثال: آپارتمان 3 خوابه در مرکز شهر' : 'Example: 3-bedroom apartment in city center')
                        : categoryType === MainCategoryType.VEHICLES
                        ? (isRTL ? 'مثال: BMW 320d، دوچرخه برقی، موتورسیکلت و...' : 'Example: BMW 320d, Electric bike, Motorcycle, etc.')
                        : categoryType === MainCategoryType.SERVICES
                        ? (isRTL ? 'مثال: خدمات تعمیرات ساختمان' : 'Example: Building repair services')
                        : (isRTL ? 'عنوان آگهی را وارد کنید' : 'Enter ad title')
                    }
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
                    placeholder={
                      categoryType === MainCategoryType.REAL_ESTATE
                        ? (isRTL ? 'توضیحات کامل ملک: متراژ، موقعیت، امکانات و...' : 'Full property description: area, location, features...')
                        : categoryType === MainCategoryType.VEHICLES
                        ? (isRTL ? 'توضیحات وسیله نقلیه: وضعیت، کارکرد، ویژگی‌ها، امکانات و...' : 'Vehicle description: condition, mileage, features, equipment...')
                        : categoryType === MainCategoryType.SERVICES
                        ? (isRTL ? 'توضیحات خدمات: تجربه، تخصص، گواهینامه‌ها و...' : 'Service description: experience, expertise, certificates...')
                        : (isRTL ? 'توضیحات کامل آگهی را اینجا بنویسید...' : 'Write detailed description here...')
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </>
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
            {categoryType === MainCategoryType.MISC ? (
              // For MISC, step 2 is the final step
              currentStep === 2 ? (
                <Button type="submit" className="flex-1" disabled={createAdMutation.isPending}>
                  {createAdMutation.isPending ? (isRTL ? 'در حال ایجاد...' : 'Creating...') : (isRTL ? 'ثبت آگهی' : 'Create Ad')}
                </Button>
              ) : (
                <Button type="button" onClick={handleNext} className="flex-1">
                  {isRTL ? 'بعدی' : 'Next'}
                </Button>
              )
            ) : (
              // For other categories, use the original 3-step flow
              currentStep < 3 ? (
                <Button type="button" onClick={handleNext} className="flex-1">
                  {isRTL ? 'بعدی' : 'Next'}
                </Button>
              ) : currentStep === 3 ? (
                <Button type="submit" className="flex-1" disabled={createAdMutation.isPending}>
                  {createAdMutation.isPending ? (isRTL ? 'در حال ایجاد...' : 'Creating...') : (isRTL ? 'ثبت آگهی' : 'Create Ad')}
                </Button>
              ) : null
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
