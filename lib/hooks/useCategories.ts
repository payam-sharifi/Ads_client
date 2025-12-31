import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import { Category, MainCategoryType } from '@/lib/types/category.types';

// Re-export types for backward compatibility
export type { Category, MainCategoryType };

export interface CreateCategoryDto {
  name: {
    en?: string;
    de?: string;
    fa?: string;
  };
  icon?: string;
  parentId?: string;
}

export interface UpdateCategoryDto {
  name?: {
    en?: string;
    de?: string;
    fa?: string;
  };
  icon?: string;
  parentId?: string;
}

/**
 * API Hook: GET /api/categories
 * Get all categories (public)
 */
export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await apiClient.get<Category[]>('/categories');
      return response.data;
    },
  });
};

/**
 * API Hook: GET /api/categories/:id
 * Get category by ID (public)
 */
export const useCategory = (id: string) => {
  return useQuery({
    queryKey: ['category', id],
    queryFn: async () => {
      const response = await apiClient.get<Category>(`/categories/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

/**
 * API Hook: POST /api/categories
 * Create category (Admin/Super Admin only)
 */
export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateCategoryDto) => {
      const response = await apiClient.post<Category>('/categories', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

/**
 * API Hook: PATCH /api/categories/:id
 * Update category (Admin/Super Admin only)
 */
export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateCategoryDto }) => {
      const response = await apiClient.patch<Category>(`/categories/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['category', variables.id] });
    },
  });
};

/**
 * API Hook: DELETE /api/categories/:id
 * Delete category (Admin/Super Admin only)
 */
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/categories/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

