import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';

/**
 * Image Types and Interfaces
 * 
 * Matches backend Image entity structure
 */
export interface Image {
  id: string;
  url: string;
  adId: string;
  order?: number;
  createdAt: string;
}

/**
 * API Hook: GET /api/images/ad/:adId
 * Get all images for an ad (public)
 */
export const useAdImages = (adId: string) => {
  return useQuery({
    queryKey: ['images', 'ad', adId],
    queryFn: async () => {
      const response = await apiClient.get<Image[]>(`/images/ad/${adId}`);
      return response.data;
    },
    enabled: !!adId,
  });
};

/**
 * API Hook: GET /api/images/:id
 * Get image by ID (public)
 */
export const useImage = (id: string) => {
  return useQuery({
    queryKey: ['image', id],
    queryFn: async () => {
      const response = await apiClient.get<Image>(`/images/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

/**
 * API Hook: POST /api/images/:adId
 * Upload image for an ad (requires auth, owner only)
 */
export const useUploadImage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ adId, file, order }: { adId: string; file: File; order?: number }) => {
      if (!adId) {
        throw new Error('Ad ID is required');
      }
      
      const formData = new FormData();
      formData.append('file', file);
      
      // Build URL with order query parameter if provided
      // Note: baseURL already includes '/api', so we use '/images/:adId'
      let url = `/images/${adId}`;
      if (order !== undefined && order !== null) {
        url += `?order=${order}`;
      }
      
      // Validate adId is a valid UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(adId)) {
        throw new Error(`Invalid adId format: ${adId}`);
      }
      
      // Log in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Uploading image:', {
          adId,
          url,
          order,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
        });
      }
      
      try {
        // Don't set Content-Type header manually - let axios set it automatically with boundary
        // This is important for multipart/form-data
        const response = await apiClient.post<Image>(url, formData);
        return response.data;
      } catch (error: any) {
        // Enhanced error logging
        if (process.env.NODE_ENV === 'development') {
          console.error('Image upload error:', {
            url,
            adId,
            status: error?.response?.status,
            statusText: error?.response?.statusText,
            data: error?.response?.data,
            message: error?.message,
          });
        }
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['images', 'ad', variables.adId] });
      queryClient.invalidateQueries({ queryKey: ['ad', variables.adId] });
      // Also invalidate ads lists to ensure dashboard shows updated ad with images
      queryClient.invalidateQueries({ queryKey: ['ads'] });
      queryClient.invalidateQueries({ queryKey: ['ads', 'my'] });
      // Force refetch to ensure UI updates immediately (similar to useDeleteAd)
      queryClient.refetchQueries({ queryKey: ['ads', 'my'] });
      queryClient.refetchQueries({ queryKey: ['ad', variables.adId] });
    },
  });
};

/**
 * API Hook: DELETE /api/images/:id
 * Delete image (requires auth, owner or admin)
 */
export const useDeleteImage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      // First get the image to know which ad it belongs to
      const imageResponse = await apiClient.get<Image>(`/images/${id}`);
      const image = imageResponse.data;
      
      await apiClient.delete(`/images/${id}`);
      return { id, adId: image.adId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['images'] });
      queryClient.invalidateQueries({ queryKey: ['images', 'ad', data.adId] });
      queryClient.invalidateQueries({ queryKey: ['ad', data.adId] });
    },
  });
};

