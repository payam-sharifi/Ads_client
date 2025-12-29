import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';

/**
 * City Types and Interfaces
 * 
 * Matches backend City entity structure
 */
export interface City {
  id: string;
  name: {
    en?: string;
    de?: string;
    fa?: string;
  };
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
}

export interface CreateCityDto {
  name: {
    en?: string;
    de?: string;
    fa?: string;
  };
}

/**
 * API Hook: GET /api/cities
 * Get all cities (public)
 */
export const useCities = () => {
  return useQuery({
    queryKey: ['cities'],
    queryFn: async () => {
      const response = await apiClient.get<City[]>('/cities');
      return response.data;
    },
  });
};

/**
 * API Hook: GET /api/cities/:id
 * Get city by ID (public)
 */
export const useCity = (id: string) => {
  return useQuery({
    queryKey: ['city', id],
    queryFn: async () => {
      const response = await apiClient.get<City>(`/cities/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

/**
 * API Hook: POST /api/cities
 * Create city (Admin/Super Admin only)
 */
export const useCreateCity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateCityDto) => {
      const response = await apiClient.post<City>('/cities', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cities'] });
    },
  });
};

