'use client';

import React, { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import Image from 'next/image';
import { useI18n } from '@/lib/contexts/I18nContext';
import { useAuthStore } from '@/lib/stores/authStore';
import { useCategories } from '@/lib/hooks/useCategories';
import { useCities } from '@/lib/hooks/useCities';
import { getLocalizedCategoryName, getLocalizedName } from '@/lib/utils/localizedNames';
import { useCreateAd } from '@/lib/hooks/useAds';
import { useUploadImage } from '@/lib/hooks/useImages';
import Button from '@/components/common/Button';
import { toast } from 'react-toastify';

export default function CreateAdPage() {
  const router = useRouter();
  const { t, locale, isRTL } = useI18n();
  const { isAuthenticated, user } = useAuthStore();
  const [imageFiles, setImageFiles] = React.useState<File[]>([]);
  const [formData, setFormData] = React.useState({
    title: '',
    description: '',
    price: '',
    categoryId: '',
    subcategoryId: '',
    cityId: '',
    condition: 'USED' as 'NEW' | 'LIKE_NEW' | 'USED',
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/login');
    }
  }, [isAuthenticated, user, router]);

  // Fetch data with React Query
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
  
  // API: POST /api/ads
  const createAdMutation = useCreateAd();
  // API: POST /api/images/:adId
  const uploadImageMutation = useUploadImage();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setImageFiles((prev) => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
    },
    multiple: true,
  });

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      // Reset subcategory when category changes
      if (name === 'categoryId') {
        newData.subcategoryId = '';
      }
      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title.trim() || formData.title.trim().length < 3) {
      toast.error('Title must be at least 3 characters');
      return;
    }
    
    if (!formData.description.trim() || formData.description.trim().length < 10) {
      toast.error('Description must be at least 10 characters');
      return;
    }
    
    if (!formData.categoryId) {
      toast.error('Please select a category');
      return;
    }
    
    if (!formData.cityId) {
      toast.error('Please select a city');
      return;
    }
    
    try {
      // API: POST /api/ads
      // Status is automatically set to PENDING_APPROVAL by backend
      // Convert condition from 'NEW'/'LIKE_NEW'/'USED' to 'new'/'like-new'/'used'
      const conditionMap: Record<string, string> = {
        'NEW': 'new',
        'LIKE_NEW': 'like-new',
        'USED': 'used',
      };
      
      // Prepare request data - only include fields that are in CreateAdDto
      const requestData: {
        title: string;
        description: string;
        price: number;
        categoryId: string;
        cityId: string;
        subcategoryId?: string;
        condition?: string;
      } = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: Number(formData.price) || 0,
        categoryId: formData.categoryId,
        cityId: formData.cityId,
      };
      
      // Only include subcategoryId if it's not empty (it's optional in DTO)
      if (formData.subcategoryId && formData.subcategoryId.trim()) {
        requestData.subcategoryId = formData.subcategoryId;
      }
      
      // Only include condition if it's valid (it's optional in DTO)
      if (formData.condition) {
        const mappedCondition = conditionMap[formData.condition];
        if (mappedCondition) {
          requestData.condition = mappedCondition;
        }
      }
      
      // Log request data in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Creating ad with data:', requestData);
      }
      
      const newAd = await createAdMutation.mutateAsync(requestData);

      // Validate that ad was created successfully
      if (!newAd || !newAd.id) {
        throw new Error('Failed to create ad: No ID returned');
      }

      // Upload images after ad is created
      // API: POST /api/images/:adId
      if (imageFiles.length > 0 && newAd.id) {
        if (process.env.NODE_ENV === 'development') {
          console.log('Uploading images for ad:', {
            adId: newAd.id,
            imageCount: imageFiles.length,
            fullAd: newAd,
          });
        }
        
        // Upload images sequentially to avoid race conditions
        for (let index = 0; index < imageFiles.length; index++) {
          const file = imageFiles[index];
          try {
            if (process.env.NODE_ENV === 'development') {
              console.log(`Uploading image ${index + 1}/${imageFiles.length} for ad ${newAd.id}`);
            }
            await uploadImageMutation.mutateAsync({
              adId: newAd.id,
              file,
              order: index + 1,
            });
          } catch (uploadError: any) {
            console.error(`Failed to upload image ${index + 1}:`, uploadError);
            // Continue with other images even if one fails
            toast.error(`Failed to upload image ${index + 1}: ${uploadError?.response?.data?.message || uploadError?.message}`);
          }
        }
        
        if (process.env.NODE_ENV === 'development') {
          console.log('Image upload process completed');
        }
      }

      toast.success('Ad created successfully! It will be reviewed before being published.');
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (error: any) {
      console.error('Create ad error:', error);
      
      // Extract error message from validation errors
      let errorMessage = 'Failed to create ad';
      
      if (error?.response?.data) {
        const errorData = error.response.data;
        
        // Handle validation errors from class-validator
        if (errorData.message && Array.isArray(errorData.message)) {
          const validationErrors = errorData.message.map((err: any) => {
            if (typeof err === 'string') return err;
            return Object.values(err.constraints || {}).join(', ');
          }).join('\n');
          errorMessage = validationErrors;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      
      // Log full error for debugging
      if (process.env.NODE_ENV === 'development') {
        console.error('Full error details:', {
          status: error?.response?.status,
          statusText: error?.response?.statusText,
          data: error?.response?.data,
          request: {
            url: error?.config?.url,
            method: error?.config?.method,
            data: error?.config?.data,
          },
        });
      }
    }
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  const selectedCategory = categories?.find((c) => c.id === formData.categoryId);
  const subcategories = selectedCategory?.children || [];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">{t('createAd.title')}</h1>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-2">{t('createAd.form.title')}</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder={t('createAd.form.titlePlaceholder')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-2">{t('createAd.form.description')}</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={8}
            placeholder={t('createAd.form.descriptionPlaceholder')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium mb-2">{t('createAd.form.price')}</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            min="0"
            step="0.01"
            placeholder={t('createAd.form.pricePlaceholder')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            dir="ltr"
          />
        </div>

        {/* Category and Subcategory */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">{t('createAd.form.category')}</label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">{isRTL ? 'انتخاب کنید' : 'Bitte wählen'}</option>
              {categories?.filter(cat => !cat.parentId).map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {getLocalizedCategoryName(cat.name, locale)}
                </option>
              ))}
            </select>
          </div>

          {subcategories.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">{t('createAd.form.subcategory')}</label>
              <select
                name="subcategoryId"
                value={formData.subcategoryId}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">{isRTL ? 'انتخاب کنید' : 'Bitte wählen'}</option>
                {subcategories.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {getLocalizedCategoryName(sub.name, locale)}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* City and Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">{t('createAd.form.city')}</label>
            <select
              name="cityId"
              value={formData.cityId}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">{isRTL ? 'انتخاب کنید' : 'Bitte wählen'}</option>
              {filteredCities.map((city) => (
                <option key={city.id} value={city.id}>
                  {getLocalizedName(city.name, locale)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Condition</label>
            <select
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="NEW">New</option>
              <option value="LIKE_NEW">Like New</option>
              <option value="USED">Used</option>
            </select>
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium mb-2">{t('createAd.form.images')}</label>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input {...getInputProps()} />
            <p className="text-gray-600">
              {isDragActive
                ? isRTL
                  ? 'تصاویر را اینجا رها کنید'
                  : 'Bilder hier ablegen'
                : isRTL
                ? 'تصاویر را بکشید و رها کنید یا کلیک کنید'
                : 'Ziehen Sie Bilder hierher oder klicken Sie zum Auswählen'}
            </p>
          </div>

          {/* Image Preview */}
          {imageFiles.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {imageFiles.map((file, index) => (
                <div key={index} className="relative group">
                  <div className="relative h-32 w-full rounded-lg overflow-hidden bg-gray-100">
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
                    className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <Button type="submit" className="flex-1" disabled={createAdMutation.isPending}>
            {createAdMutation.isPending ? t('common.loading') : t('createAd.form.submit')}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            {t('common.cancel')}
          </Button>
        </div>
      </form>
    </div>
  );
}
