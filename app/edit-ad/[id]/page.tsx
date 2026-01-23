'use client';

import React, { useEffect, useCallback, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { useI18n } from '@/lib/contexts/I18nContext';
import { useAuthStore } from '@/lib/stores/authStore';
import { useAd, useUpdateAd } from '@/lib/hooks/useAds';
import { useCategories } from '@/lib/hooks/useCategories';
import { useCities } from '@/lib/hooks/useCities';
import { getLocalizedCategoryName, getLocalizedName } from '@/lib/utils/localizedNames';
import { useUploadImage, useDeleteImage, useAdImages } from '@/lib/hooks/useImages';
import { MainCategoryType } from '@/lib/types/category.types';
import RealEstateForm from '@/components/ads/RealEstateForm';
import VehicleForm from '@/components/ads/VehicleForm';
import ServiceForm from '@/components/ads/ServiceForm';
import JobForm from '@/components/ads/JobForm';
import { validateRealEstate, validateVehicle, validateService, validateJob } from '@/lib/validation/category-forms';
import Button from '@/components/common/Button';
import { toast } from 'react-toastify';

type FormStep = 1 | 2 | 3;

export default function EditAdPage() {
  const params = useParams();
  const router = useRouter();
  const adId = params.id as string;
  const { t, locale, isRTL } = useI18n();
  const { isAuthenticated, user } = useAuthStore();
  const [currentStep, setCurrentStep] = useState<FormStep>(1);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  
  // Step 1: Category & City
  const [step1Data, setStep1Data] = useState({
    categoryId: '',
    subcategoryId: '',
    cityId: '',
    showInAllCities: false,
  });

  // Step 2: Category-specific details (metadata)
  const [step2Data, setStep2Data] = useState<Record<string, any>>({});
  const [step2Errors, setStep2Errors] = useState<Record<string, string>>({});

  // Step 3: Basic Info
  const [step3Data, setStep3Data] = useState({
    title: '',
    description: '',
    showEmail: false,
    showPhone: false,
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/login');
    }
  }, [isAuthenticated, user, router]);

  // Fetch data with React Query
  // API: GET /api/ads/:id
  const { data: ad, isLoading: adLoading, error: adError } = useAd(adId);
  // API: GET /api/images/ad/:adId
  const { data: existingImages } = useAdImages(adId);
  // API: GET /api/categories
  const { data: categories } = useCategories();
  // API: GET /api/cities
  const { data: cities } = useCities();
  
  // Filter out Tehran
  const filteredCities = cities?.filter(city => {
    const cityNameFa = city.name?.fa?.toLowerCase() || '';
    const cityNameDe = city.name?.de?.toLowerCase() || '';
    const cityNameEn = city.name?.en?.toLowerCase() || '';
    return !cityNameFa.includes('تهران') && !cityNameDe.includes('tehran') && !cityNameEn.includes('tehran');
  }) || [];
  
  // API: PATCH /api/ads/:id
  const updateAdMutation = useUpdateAd();
  // API: POST /api/images/:adId
  const uploadImageMutation = useUploadImage();
  // API: DELETE /api/images/:id
  const deleteImageMutation = useDeleteImage();

  // Populate form when ad loads
  useEffect(() => {
    if (ad) {
      // Check if user owns this ad
      if (ad.userId !== user?.id) {
        toast.error(isRTL ? 'شما فقط می‌توانید آگهی‌های خود را ویرایش کنید' : 'You can only edit your own ads');
        router.push('/dashboard');
        return;
      }
      
      // Step 1: Category & City
      setStep1Data({
        categoryId: ad.categoryId,
        subcategoryId: ad.subcategoryId || '',
        cityId: ad.cityId || '',
        showInAllCities: !ad.cityId,
      });

      // Step 2: Category-specific metadata
      if (ad.metadata) {
        setStep2Data(ad.metadata);
      }

      // Step 3: Basic Info
      setStep3Data({
        title: ad.title,
        description: ad.description,
        showEmail: ad.showEmail || false,
        showPhone: ad.showPhone || false,
      });
    }
  }, [ad, user, router, isRTL]);

  // Show error toast
  useEffect(() => {
    if (adError) {
      toast.error('Failed to load ad');
    }
  }, [adError]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setNewImageFiles((prev) => {
      const totalExisting = existingImages?.length || 0;
      const total = totalExisting + prev.length + acceptedFiles.length;
      if (total > 3) {
        toast.error(isRTL ? 'شما می‌توانید حداکثر 3 عکس برای آگهی داشته باشید' : 'You can have a maximum of 3 images for an ad');
        const remaining = 3 - totalExisting - prev.length;
        return remaining > 0 ? [...prev, ...acceptedFiles.slice(0, remaining)] : prev;
      }
      return [...prev, ...acceptedFiles];
    });
  }, [existingImages, isRTL]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
    },
    multiple: true,
  });

  const removeNewImage = (index: number) => {
    setNewImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;
    try {
      // API: DELETE /api/images/:id
      await deleteImageMutation.mutateAsync(imageId);
      toast.success('Image deleted');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to delete image');
    }
  };

  const selectedCategory = categories?.find((c) => c.id === step1Data.categoryId);
  const categoryType = selectedCategory?.categoryType as MainCategoryType | undefined;

  const handleStep1Change = (name: string, value: string) => {
    setStep1Data((prev) => {
      const newData = { ...prev, [name]: value };
      if (name === 'categoryId') {
        newData.subcategoryId = '';
        setStep2Data({}); // Reset category-specific data when category changes
      }
      return newData;
    });
  };

  const handleStep2Change = (data: Record<string, any>) => {
    setStep2Data((prev) => ({ ...prev, ...data }));
    // Clear errors for updated fields
    const clearedErrors = { ...step2Errors };
    Object.keys(data).forEach((key) => {
      delete clearedErrors[key];
    });
    setStep2Errors(clearedErrors);
  };

  const handleStep3Change = (name: string, value: string | boolean) => {
    setStep3Data((prev) => ({ ...prev, [name]: value }));
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
    return true;
  };

  const validateStep2 = () => {
    if (!categoryType) {
      return true; // No category selected, skip validation
    }

    // For Misc category, no step 2 validation needed
    if (categoryType === MainCategoryType.MISC || categoryType === MainCategoryType.PERSONAL_HOME) {
      return true;
    }

    let errors: any[] = [];
    const errorMap: Record<string, string> = {};

    switch (categoryType) {
      case MainCategoryType.REAL_ESTATE:
        errors = validateRealEstate(step2Data);
        break;
      case MainCategoryType.VEHICLES:
        errors = validateVehicle(step2Data);
        break;
      case MainCategoryType.SERVICES:
        errors = validateService(step2Data);
        break;
      case MainCategoryType.JOBS:
        errors = validateJob(step2Data);
        break;
    }

    // Convert errors array to error map
    errors.forEach((error) => {
      errorMap[error.field] = error.message;
    });

    setStep2Errors(errorMap);

    if (errors.length > 0) {
      toast.error(isRTL ? 'لطفا فیلدهای الزامی را تکمیل کنید' : 'Please fill in all required fields');
      return false;
    }

    return true;
  };

  const validateStep3 = () => {
    // For Jobs, title and description are in Step 2, so skip validation here
    // For Misc, only title and description are needed
    if (categoryType === MainCategoryType.JOBS || categoryType === MainCategoryType.MISC || categoryType === MainCategoryType.PERSONAL_HOME) {
      return true;
    }
    
    if (!step3Data.title.trim() || step3Data.title.trim().length < 3) {
      toast.error(isRTL ? 'عنوان باید حداقل 3 کاراکتر باشد' : 'Title must be at least 3 characters');
      return false;
    }
    if (!step3Data.description.trim() || step3Data.description.trim().length < 10) {
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
        setCurrentStep(3);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as FormStep);
    }
  };

  // Reset errors when step changes
  useEffect(() => {
    if (currentStep !== 2) {
      setStep2Errors({});
    }
  }, [currentStep]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep1() || !validateStep2() || !validateStep3()) {
      return;
    }

    // Validate total images count (existing + new) doesn't exceed 3
    const totalImages = (existingImages?.length || 0) + newImageFiles.length;
    if (totalImages > 3) {
      toast.error(isRTL ? 'شما می‌توانید حداکثر 3 عکس برای آگهی داشته باشید' : 'You can have a maximum of 3 images for an ad');
      return;
    }
    
    try {
      // Build request data with category-specific fields
      const requestData: any = {
        title: step3Data.title.trim(),
        description: step3Data.description.trim(),
        categoryId: step1Data.categoryId,
        cityId: step1Data.showInAllCities ? null : step1Data.cityId,
        subcategoryId: step1Data.subcategoryId || undefined,
        showEmail: step3Data.showEmail || false,
        showPhone: step3Data.showPhone || false,
        ...step2Data, // Merge all category-specific fields
      };

      // For vehicles, ensure condition is in lowercase format expected by backend
      if (categoryType === MainCategoryType.VEHICLES && requestData.condition) {
        requestData.condition = requestData.condition.toLowerCase();
      }

      // For jobs, use jobTitle and jobDescription from step2Data, fallback to title/description
      if (categoryType === MainCategoryType.JOBS) {
        if (step2Data.jobTitle) {
          requestData.title = step2Data.jobTitle;
        }
        if (step2Data.jobDescription) {
          requestData.description = step2Data.jobDescription;
        }
      }

      // Price handling
      if (categoryType === MainCategoryType.REAL_ESTATE) {
        requestData.price = step2Data.price || step2Data.coldRent || 0;
      } else if (categoryType === MainCategoryType.VEHICLES) {
        requestData.price = step2Data.price || 0;
      } else if (categoryType === MainCategoryType.SERVICES) {
        requestData.price = step2Data.price || 0;
      } else {
        requestData.price = 0; // Jobs don't have price
      }
      
      await updateAdMutation.mutateAsync({
        id: adId,
        data: requestData,
      });

      // Upload new images
      if (newImageFiles.length > 0) {
        const uploadPromises = newImageFiles.map((file, index) =>
          uploadImageMutation.mutateAsync({
            adId,
            file,
            order: (existingImages?.length || 0) + index + 1,
          })
        );
        await Promise.all(uploadPromises);
      }

      toast.success(isRTL ? 'آگهی با موفقیت به‌روزرسانی شد!' : 'Ad updated successfully!');
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (error: any) {
      console.error('Update ad error:', error);
      let errorMessage = isRTL ? 'خطا در به‌روزرسانی آگهی' : 'Failed to update ad';
      
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

  if (adLoading) {
    return <div className="container mx-auto px-4 py-8 text-center">{t('common.loading')}</div>;
  }

  if (!ad) {
    return <div className="container mx-auto px-4 py-8 text-center">{t('common.error')}</div>;
  }

  const subcategories = selectedCategory?.children || [];

  return (
    <div className="w-full min-h-screen overflow-visible">
      <div className="container mx-auto px-4 py-8 max-w-xl pb-40 md:pb-8 overflow-visible">
        <h1 className="text-3xl font-bold mb-8">{isRTL ? 'ویرایش آگهی' : 'Edit Ad'}</h1>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center w-full">
            {[1, 2, 3].map((step) => {
              const isCompleted = step < currentStep;
              const isClickable = isCompleted;
              
              return (
                <React.Fragment key={step}>
                  <div 
                    className={`flex items-center flex-shrink-0 ${isClickable ? 'cursor-pointer' : 'cursor-default'}`}
                    onClick={() => isClickable && setCurrentStep(step as FormStep)}
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
                      {step === 2 && (isRTL ? 'جزئیات و تصاویر' : 'Details & Images')}
                      {step === 3 && (isRTL ? 'عنوان' : 'Title')}
                    </span>
                  </div>
                  {step < 3 && (
                    <div 
                      className={`flex-1 h-[2px] md:h-1.5 mx-1 md:mx-4 transition-colors ${currentStep > step ? 'bg-red-600' : 'bg-gray-500'} ${isClickable ? 'cursor-pointer hover:bg-red-700' : ''}`} 
                      style={{ minWidth: '16px' }}
                      onClick={() => isClickable && setCurrentStep(step as FormStep)}
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
            </div>
          )}

          {/* Step 2: Category-specific Details & Images */}
          {currentStep === 2 && (
            <div className="space-y-6 w-full">
              <h2 className="text-2xl font-bold mb-4">{isRTL ? 'جزئیات و تصاویر' : 'Details & Images'}</h2>
              
              {/* Category-specific Forms */}
              {categoryType && (
                <div className="space-y-4">
                  {categoryType === MainCategoryType.REAL_ESTATE && (
                    <RealEstateForm 
                      data={step2Data} 
                      onChange={handleStep2Change}
                      errors={step2Errors}
                    />
                  )}
                  {categoryType === MainCategoryType.VEHICLES && (
                    <VehicleForm 
                      data={step2Data} 
                      onChange={handleStep2Change}
                      errors={step2Errors}
                    />
                  )}
                  {categoryType === MainCategoryType.SERVICES && (
                    <ServiceForm 
                      data={step2Data} 
                      onChange={handleStep2Change}
                      errors={step2Errors}
                    />
                  )}
                  {categoryType === MainCategoryType.JOBS && (
                    <JobForm 
                      data={step2Data} 
                      onChange={handleStep2Change}
                      errors={step2Errors}
                    />
                  )}
                </div>
              )}

              {/* Existing Images */}
              {existingImages && existingImages.length > 0 && (
                <div className="border-t border-gray-300 pt-6">
                  <label className="block text-sm font-medium mb-2">{isRTL ? 'عکس‌های موجود' : 'Current Images'}</label>
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                    {existingImages.map((img) => (
                      <div key={img.id} className="relative group">
                        <div className="relative h-20 md:h-24 w-full rounded-lg overflow-hidden bg-gray-100">
                          <Image
                            src={img.url.startsWith('http') ? img.url : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3001'}${img.url}`}
                            alt="Ad image"
                            fill
                            className="object-cover"
                            unoptimized={true}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteImage(img.id)}
                          disabled={deleteImageMutation.isPending}
                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 text-sm"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Image Upload */}
              <div className="border-t border-gray-300 pt-6">
                <label className="block text-sm font-medium mb-2">
                  {isRTL ? 'تصاویر' : 'Images'} 
                  <span className="text-gray-500 text-xs ml-2">
                    ({isRTL ? 'حداکثر 3 عکس' : 'Max 3 images'}: {(existingImages?.length || 0) + newImageFiles.length}/3)
                  </span>
                </label>
                <div
                  {...getRootProps({
                    onClick: (e) => {
                      if ((existingImages?.length || 0) + newImageFiles.length >= 3) {
                        e.preventDefault();
                        e.stopPropagation();
                        return;
                      }
                    }
                  })}
                  className={`border-2 border-dashed rounded-lg p-4 md:p-6 text-center cursor-pointer transition-colors touch-manipulation relative ${
                    (existingImages?.length || 0) + newImageFiles.length >= 3 
                      ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50' 
                      : isDragActive 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-gray-300 hover:border-gray-400 active:bg-gray-50'
                  }`}
                  style={{ WebkitTapHighlightColor: 'transparent', minHeight: '60px' }}
                >
                  <input 
                    {...getInputProps({
                      disabled: (existingImages?.length || 0) + newImageFiles.length >= 3,
                      onClick: (e) => {
                        e.stopPropagation();
                      },
                      style: { display: 'block', width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, opacity: 0, cursor: 'pointer', zIndex: 10, pointerEvents: 'auto' }
                    })} 
                  />
                  <p className="text-gray-600 pointer-events-none text-sm">
                    {(existingImages?.length || 0) + newImageFiles.length >= 3
                      ? (isRTL ? 'حداکثر 3 عکس آپلود شده است' : 'Maximum 3 images uploaded')
                      : isDragActive
                      ? (isRTL ? 'تصاویر را اینجا رها کنید' : 'Drop images here')
                      : (isRTL ? 'تصاویر را بکشید و رها کنید یا کلیک کنید' : 'Drag and drop images or click to select')}
                  </p>
                </div>

                {newImageFiles.length > 0 && (
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mt-4">
                    {newImageFiles.map((file, index) => (
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
                          onClick={() => removeNewImage(index)}
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
              
              {/* Title and Description - Hidden for Jobs and Misc */}
              {categoryType !== MainCategoryType.JOBS && categoryType !== MainCategoryType.MISC && categoryType !== MainCategoryType.PERSONAL_HOME && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">{isRTL ? 'عنوان آگهی' : 'Ad Title'}</label>
                    <input
                      type="text"
                      value={step3Data.title}
                      onChange={(e) => handleStep3Change('title', e.target.value)}
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
                      value={step3Data.description}
                      onChange={(e) => handleStep3Change('description', e.target.value)}
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
                      checked={step3Data.showEmail}
                      onChange={(e) => handleStep3Change('showEmail', e.target.checked)}
                      className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-700">
                      {isRTL ? 'نمایش عمومی ایمیل من' : 'Show my email publicly'}
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={step3Data.showPhone}
                      onChange={(e) => handleStep3Change('showPhone', e.target.checked)}
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
              {currentStep < 3 ? (
                <Button type="button" onClick={handleNext} className="flex-1">
                  {isRTL ? 'بعدی' : 'Next'}
                </Button>
              ) : currentStep === 3 ? (
                <Button type="submit" className="flex-1" disabled={updateAdMutation.isPending}>
                  {updateAdMutation.isPending ? (isRTL ? 'در حال به‌روزرسانی...' : 'Updating...') : (isRTL ? 'به‌روزرسانی آگهی' : 'Update Ad')}
                </Button>
              ) : null}
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
