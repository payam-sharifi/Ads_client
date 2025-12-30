'use client';

import React, { useEffect, useCallback } from 'react';
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
import Button from '@/components/common/Button';
import { toast } from 'react-toastify';

export default function EditAdPage() {
  const params = useParams();
  const router = useRouter();
  const adId = params.id as string;
  const { t, locale, isRTL } = useI18n();
  const { isAuthenticated, user } = useAuthStore();
  const [newImageFiles, setNewImageFiles] = React.useState<File[]>([]);
  const [formData, setFormData] = React.useState({
    title: '',
    description: '',
    price: '',
    categoryId: '',
    subcategoryId: '',
    cityId: '',
    condition: 'USED' as 'NEW' | 'LIKE_NEW' | 'USED',
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
        toast.error('You can only edit your own ads');
        router.push('/dashboard');
        return;
      }
      // Convert condition from backend format ('new', 'like-new', 'used') to frontend format ('NEW', 'LIKE_NEW', 'USED')
      const conditionFromBackend = ad.condition?.toUpperCase().replace('-', '_') || 'USED';
      const conditionMap: Record<string, 'NEW' | 'LIKE_NEW' | 'USED'> = {
        'NEW': 'NEW',
        'LIKE_NEW': 'LIKE_NEW',
        'LIKE-NEW': 'LIKE_NEW',
        'USED': 'USED',
      };
      
      setFormData({
        title: ad.title,
        description: ad.description,
        price: String(ad.price),
        categoryId: ad.categoryId,
        subcategoryId: ad.subcategoryId || '',
        cityId: ad.cityId,
        condition: conditionMap[conditionFromBackend] || 'USED',
        showEmail: ad.showEmail || false,
        showPhone: ad.showPhone || false,
      });
    }
  }, [ad, user, router]);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => {
      const newData = { ...prev, [name]: type === 'checkbox' ? checked : value };
      if (name === 'categoryId') {
        newData.subcategoryId = '';
      }
      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate total images count (existing + new) doesn't exceed 3
    const totalImages = (existingImages?.length || 0) + newImageFiles.length;
    if (totalImages > 3) {
      toast.error(isRTL ? 'شما می‌توانید حداکثر 3 عکس برای آگهی داشته باشید' : 'You can have a maximum of 3 images for an ad');
      return;
    }
    
    try {
      // API: PATCH /api/ads/:id
      // Convert condition from 'NEW'/'LIKE_NEW'/'USED' to 'new'/'like-new'/'used'
      const conditionMap: Record<string, string> = {
        'NEW': 'new',
        'LIKE_NEW': 'like-new',
        'USED': 'used',
      };
      
      await updateAdMutation.mutateAsync({
        id: adId,
        data: {
          title: formData.title.trim(),
          description: formData.description.trim(),
          price: Number(formData.price) || 0,
          categoryId: formData.categoryId,
          subcategoryId: formData.subcategoryId || undefined,
          cityId: formData.cityId,
          condition: conditionMap[formData.condition] || formData.condition.toLowerCase(),
          showEmail: formData.showEmail || false,
          showPhone: formData.showPhone || false,
        },
      });

      // Upload new images
      // API: POST /api/images/:adId
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

      toast.success('Ad updated successfully');
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to update ad');
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

  const selectedCategory = categories?.find((c) => c.id === formData.categoryId);
  const subcategories = selectedCategory?.children || [];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">{t('createAd.editTitle')}</h1>

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

        {/* Privacy Settings */}
        <div className="border-t border-gray-200 pt-6 mt-6">
          <h3 className="text-lg font-semibold mb-4">{isRTL ? 'تنظیمات حریم خصوصی' : 'Privacy Settings'}</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="showEmail"
                checked={formData.showEmail}
                onChange={handleChange}
                className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
              />
              <span className="text-sm text-gray-700">
                {isRTL ? 'نمایش عمومی ایمیل من' : 'Show my email publicly'}
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="showPhone"
                checked={formData.showPhone}
                onChange={handleChange}
                className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
              />
              <span className="text-sm text-gray-700">
                {isRTL ? 'نمایش عمومی شماره موبایل من' : 'Show my phone number publicly'}
              </span>
            </label>
          </div>
        </div>

        {/* Existing Images */}
        {existingImages && existingImages.length > 0 && (
          <div>
            <label className="block text-sm font-medium mb-2">Current Images</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {existingImages.map((img) => (
                <div key={img.id} className="relative group">
                  <div className="relative h-32 w-full rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={img.url.startsWith('http') ? img.url : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3001'}${img.url}`}
                      alt="Ad image"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteImage(img.id)}
                    disabled={deleteImageMutation.isPending}
                    className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Add New Images
            <span className="text-gray-500 text-xs ml-2">
              ({isRTL ? 'حداکثر 3 عکس' : 'Max 3 images'}: {(existingImages?.length || 0) + newImageFiles.length}/3)
            </span>
          </label>
          {((existingImages?.length || 0) + newImageFiles.length) >= 3 ? (
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center bg-gray-50 opacity-50">
              <p className="text-gray-600">
                {isRTL ? 'حداکثر 3 عکس آپلود شده است' : 'Maximum 3 images uploaded'}
              </p>
            </div>
          ) : (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              <p className="text-gray-600">
                {isDragActive
                  ? (isRTL ? 'تصاویر را اینجا رها کنید' : 'Bilder hier ablegen')
                  : (isRTL ? 'تصاویر را بکشید و رها کنید یا کلیک کنید' : 'Ziehen Sie Bilder hierher oder klicken Sie zum Auswählen')}
              </p>
            </div>
          )}

          {/* New Image Preview */}
          {newImageFiles.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {newImageFiles.map((file, index) => (
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
                    onClick={() => removeNewImage(index)}
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
          <Button type="submit" className="flex-1" disabled={updateAdMutation.isPending}>
            {updateAdMutation.isPending ? t('common.loading') : t('createAd.form.update')}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            {t('common.cancel')}
          </Button>
        </div>
      </form>
    </div>
  );
}
