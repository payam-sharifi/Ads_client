import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import { useAuthStore } from '@/lib/stores/authStore';

/**
 * Ad Types and Interfaces
 * 
 * Matches backend Ad entity structure
 */
export interface Ad {
  id: string;
  title: string;
  description: string;
  price: number;
  categoryId: string;
  subcategoryId?: string;
  userId: string;
  cityId: string;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'EXPIRED' | 'SUSPENDED';
  condition?: 'NEW' | 'LIKE_NEW' | 'USED';
  views: number;
  isPremium: boolean;
  showEmail?: boolean;
  showPhone?: boolean;
  isNegotiable?: boolean;
  rejectionReason?: string;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  category?: {
    id: string;
    name: {
      en?: string;
      de?: string;
      fa?: string;
    };
    categoryType?: string;
  };
  subcategory?: {
    id: string;
    name: {
      en?: string;
      de?: string;
      fa?: string;
    };
  };
  city?: {
    id: string;
    name: {
      en?: string;
      de?: string;
      fa?: string;
    };
  };
  images?: Array<{
    id: string;
    url: string;
    adId: string;
    order?: number;
  }>;
  metadata?: Record<string, any>; // Category-specific fields (e.g., real estate details, vehicle specs)
}

export interface FilterAdsParams {
  categoryId?: string;
  subcategoryId?: string;
  cityId?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: string;
  search?: string;
  userId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface AdsResponse {
  data: Ad[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * API Hook: GET /api/ads
 * Get all ads with filtering and pagination (public)
 */
export const useAds = (filters?: FilterAdsParams) => {
  return useQuery({
    queryKey: ['ads', filters],
    queryFn: async () => {
      const response = await apiClient.get<AdsResponse>('/ads', { params: filters });
      return response.data;
    },
  });
};

/**
 * API Hook: GET /api/ads (Infinite Query)
 * Get all ads with infinite scroll support (public)
 */
export const useInfiniteAds = (filters?: Omit<FilterAdsParams, 'page'>) => {
  return useInfiniteQuery({
    queryKey: ['ads', 'infinite', filters],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await apiClient.get<AdsResponse>('/ads', {
        params: {
          ...filters,
          page: pageParam,
          limit: filters?.limit || 20,
        },
      });
      return response.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.page < lastPage.pagination.totalPages) {
        return lastPage.pagination.page + 1;
      }
      return undefined;
    },
  });
};

/**
 * API Hook: GET /api/ads/:id
 * Get ad by ID (public)
 */
export const useAd = (id: string) => {
  return useQuery({
    queryKey: ['ad', id],
    queryFn: async () => {
      const response = await apiClient.get<Ad>(`/ads/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

/**
 * API Hook: GET /api/ads/user/my
 * Get current user's ads (requires auth)
 */
export const useMyAds = () => {
  return useQuery({
    queryKey: ['ads', 'my'],
    queryFn: async () => {
      const response = await apiClient.get<Ad[]>('/ads/user/my');
      return response.data;
    },
  });
};

/**
 * API Hook: GET /api/ads/user/:userId
 * Get user's ads (requires auth)
 */
export const useUserAds = (userId: string) => {
  return useQuery({
    queryKey: ['ads', 'user', userId],
    queryFn: async () => {
      const response = await apiClient.get<Ad[]>(`/ads/user/${userId}`);
      return response.data;
    },
    enabled: !!userId,
  });
};

/**
 * API Hook: POST /api/ads
 * Create new ad (requires auth)
 */
export const useCreateAd = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newAd: Partial<Ad>) => {
      try {
        const response = await apiClient.post<Ad>('/ads', newAd);
        return response.data;
      } catch (error: any) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ads'] });
      queryClient.invalidateQueries({ queryKey: ['ads', 'my'] });
    },
  });
};

/**
 * API Hook: PATCH /api/ads/:id
 * Update ad (owner or admin)
 */
export const useUpdateAd = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Ad> }) => {
      const response = await apiClient.patch<Ad>(`/ads/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ads'] });
      queryClient.invalidateQueries({ queryKey: ['ad', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['ads', 'my'] });
    },
  });
};

/**
 * API Hook: DELETE /api/ads/:id
 * Delete ad (owner or admin)
 */
export const useDeleteAd = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/ads/${id}`);
      return id;
    },
    onSuccess: (id) => {
      // Remove the deleted ad from cache immediately
      queryClient.setQueryData<Ad[]>(['ads', 'my'], (oldData) => {
        if (!oldData) return oldData;
        return oldData.filter(ad => ad.id !== id);
      });
      // Invalidate all ad-related queries to ensure UI updates
      queryClient.invalidateQueries({ queryKey: ['ads'] });
      queryClient.invalidateQueries({ queryKey: ['ads', 'my'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'ads'] });
      queryClient.invalidateQueries({ queryKey: ['ad', id] }); // Also invalidate the specific ad
      // Force refetch to ensure deleted ad is removed from list
      queryClient.refetchQueries({ queryKey: ['ads', 'my'] });
      queryClient.refetchQueries({ queryKey: ['admin', 'ads'] }); // Also refetch admin ads list
    },
  });
};

/**
 * API Hook: POST /api/ads/:id/approve
 * Approve ad (Admin/Super Admin with ads.approve permission)
 */
export const useApproveAd = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes?: string }) => {
      const response = await apiClient.post<Ad>(`/ads/${id}/approve`, { notes });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ads'] });
      queryClient.invalidateQueries({ queryKey: ['ad', variables.id] });
    },
  });
};

/**
 * API Hook: POST /api/ads/:id/reject
 * Reject ad (Admin/Super Admin with ads.reject permission)
 */
export const useRejectAd = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const response = await apiClient.post<Ad>(`/ads/${id}/reject`, { reason });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ads'] });
      queryClient.invalidateQueries({ queryKey: ['ad', variables.id] });
    },
  });
};

/**
 * API Hook: POST /api/ads/:id/suspend
 * Suspend ad (Admin/Super Admin with ads.manage permission)
 */
export const useSuspendAd = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post<Ad>(`/ads/${id}/suspend`);
      return response.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['ads'] });
      queryClient.invalidateQueries({ queryKey: ['ad', id] });
    },
  });
};

/**
 * API Hook: POST /api/ads/:id/unsuspend
 * Unsuspend ad (Admin/Super Admin with ads.manage permission)
 */
export const useUnsuspendAd = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post<Ad>(`/ads/${id}/unsuspend`);
      return response.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['ads'] });
      queryClient.invalidateQueries({ queryKey: ['ad', id] });
    },
  });
};

/**
 * API Hook: POST /api/ads/:id/bookmark
 * Bookmark an ad (requires auth)
 */
export const useBookmarkAd = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post(`/ads/${id}/bookmark`);
      return response.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['ads', 'bookmarked'] });
      queryClient.invalidateQueries({ queryKey: ['ad', id] });
    },
  });
};

/**
 * API Hook: DELETE /api/ads/:id/bookmark
 * Remove bookmark from an ad (requires auth)
 */
export const useUnbookmarkAd = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/ads/${id}/bookmark`);
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: ['ads', 'bookmarked'] });
      queryClient.invalidateQueries({ queryKey: ['ad', id] });
    },
  });
};

/**
 * API Hook: GET /api/ads/bookmarked
 * Get user's bookmarked ads (requires auth)
 */
export const useBookmarkedAds = (page: number = 1, limit: number = 20) => {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ['ads', 'bookmarked', page, limit],
    queryFn: async () => {
      const response = await apiClient.get<AdsResponse>('/ads/bookmarked', {
        params: { page, limit },
      });
      return response.data;
    },
    enabled: isAuthenticated, // Only fetch when authenticated
  });
};
