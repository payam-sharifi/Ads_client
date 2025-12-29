import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: {
    id: string;
    name: 'SUPER_ADMIN' | 'ADMIN' | 'USER';
    description?: string;
  };
  isBlocked: boolean;
  isSuspended: boolean;
  suspendedUntil?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUsersResponse {
  data: AdminUser[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateAdminRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
}

/**
 * Admin Users Hooks
 * 
 * Provides React Query hooks for admin user management:
 * - Fetch all users
 * - Block/unblock users
 * - Suspend users
 * - Create admin users (Super Admin only)
 */
export const useAdminUsers = (filters?: {
  roleId?: string;
  isBlocked?: boolean;
  isSuspended?: boolean;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['admin', 'users', filters],
    queryFn: async () => {
      const response = await apiClient.get<AdminUsersResponse>('/users', { params: filters });
      return response.data;
    },
  });
};

export const useAdminUser = (id: string) => {
  return useQuery({
    queryKey: ['admin', 'users', id],
    queryFn: async () => {
      const response = await apiClient.get<AdminUser>(`/users/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

export const useBlockUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await apiClient.patch<AdminUser>(`/users/${userId}/block`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
};

export const useUnblockUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await apiClient.patch<AdminUser>(`/users/${userId}/unblock`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
};

export const useSuspendUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, until }: { userId: string; until: Date }) => {
      const response = await apiClient.patch<AdminUser>(`/users/${userId}/suspend`, { until });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
};

export const useCreateAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateAdminRequest) => {
      const response = await apiClient.post<AdminUser>('/users/admin', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: Partial<AdminUser & { password?: string }> }) => {
      const response = await apiClient.patch<AdminUser>(`/users/${userId}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users', variables.userId] });
    },
  });
};

