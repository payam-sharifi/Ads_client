import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import { Ad } from '@/lib/hooks/useAds';

export interface AdminAdsResponse {
  data: Ad[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApproveAdRequest {
  notes?: string;
}

export interface RejectAdRequest {
  reason: string;
}

/**
 * Admin Ads Hooks
 * 
 * Provides React Query hooks for admin ad management:
 * - Fetch all ads with filters (including pending/rejected)
 * - Approve ads
 * - Reject ads
 * - Edit ads
 */
export const useAdminAds = (filters?: {
  status?: string;
  categoryId?: string;
  cityId?: string;
  userId?: string;
  search?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['admin', 'ads', filters],
    queryFn: async () => {
      const response = await apiClient.get<AdminAdsResponse>('/ads', { params: filters });
      // Filter out any deleted ads that might have been cached
      // Check both deletedAt and ensure it's truly null/undefined (not empty string or invalid date)
      const filteredData = {
        ...response.data,
        data: response.data.data.filter(ad => {
          const isDeleted = ad.deletedAt !== null && ad.deletedAt !== undefined;
          return !isDeleted;
        }),
      };
      return filteredData;
    },
    staleTime: 0, // Always refetch to ensure deleted ads are not shown
    cacheTime: 0, // Don't cache to prevent showing deleted ads
  });
};

export const useApproveAd = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ApproveAdRequest }) => {
      const response = await apiClient.post<Ad>(`/ads/${id}/approve`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'ads'] });
      queryClient.invalidateQueries({ queryKey: ['ads'] });
    },
  });
};

export const useRejectAd = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: RejectAdRequest }) => {
      const response = await apiClient.post<Ad>(`/ads/${id}/reject`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'ads'] });
      queryClient.invalidateQueries({ queryKey: ['ads'] });
    },
  });
};

export const useUpdateAd = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Ad> }) => {
      const response = await apiClient.patch<Ad>(`/ads/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'ads'] });
      queryClient.invalidateQueries({ queryKey: ['ads'] });
      queryClient.invalidateQueries({ queryKey: ['ad', variables.id] });
    },
  });
};

