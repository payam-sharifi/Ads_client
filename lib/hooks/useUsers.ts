import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';

/**
 * User Types and Interfaces
 * 
 * Matches backend User entity structure
 */
export interface User {
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
  updatedAt?: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
  phone: string;
  password: string;
  role?: 'SUPER_ADMIN' | 'ADMIN' | 'USER';
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  role?: 'SUPER_ADMIN' | 'ADMIN' | 'USER';
}

export interface UsersResponse {
  data: User[];
  total: number;
  page: number;
  limit: number;
}

/**
 * API Hook: GET /api/users/profile
 * Get current user profile (requires auth)
 */
export const useUserProfile = () => {
  return useQuery({
    queryKey: ['user', 'profile'],
    queryFn: async () => {
      const response = await apiClient.get<User>('/users/profile');
      return response.data;
    },
  });
};

/**
 * API Hook: PUT /api/users/profile
 * Update current user profile (requires auth)
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: UpdateUserDto) => {
      const response = await apiClient.put<User>('/users/profile', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] });
    },
  });
};

/**
 * API Hook: GET /api/users
 * Get all users (Admin/Super Admin only - requires users.view permission)
 */
export const useUsers = (filters?: { roleId?: string; isBlocked?: boolean; isSuspended?: boolean; page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['users', filters],
    queryFn: async () => {
      const response = await apiClient.get<UsersResponse>('/users', { params: filters });
      return response.data;
    },
  });
};

/**
 * API Hook: GET /api/users/:id
 * Get user by ID (Admin/Super Admin only - requires users.view permission)
 */
export const useUser = (id: string) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: async () => {
      const response = await apiClient.get<User>(`/users/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

/**
 * API Hook: POST /api/users/admin
 * Create admin user (Super Admin only - requires admins.manage permission)
 */
export const useCreateAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateUserDto) => {
      const response = await apiClient.post<User>('/users/admin', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

/**
 * API Hook: PATCH /api/users/:id/block
 * Block user (Admin/Super Admin only - requires users.block permission)
 */
export const useBlockUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.patch<User>(`/users/${id}/block`);
      return response.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', id] });
    },
  });
};

/**
 * API Hook: PATCH /api/users/:id/unblock
 * Unblock user (Admin/Super Admin only - requires users.block permission)
 */
export const useUnblockUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.patch<User>(`/users/${id}/unblock`);
      return response.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', id] });
    },
  });
};

/**
 * API Hook: PATCH /api/users/:id/suspend
 * Suspend user (Admin/Super Admin only - requires users.suspend permission)
 */
export const useSuspendUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, until }: { id: string; until: Date }) => {
      const response = await apiClient.patch<User>(`/users/${id}/suspend`, { until: until.toISOString() });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', variables.id] });
    },
  });
};

