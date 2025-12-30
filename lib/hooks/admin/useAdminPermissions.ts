import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import { useAdminStore } from '@/lib/stores/adminStore';

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description?: string;
}

export interface AssignPermissionRequest {
  adminId: string;
  permissionId: string;
}

/**
 * Admin Permissions Hooks
 * 
 * Provides React Query hooks for permission management:
 * - Fetch all permissions
 * - Assign permissions to admins
 * - Revoke permissions from admins
 */
export const useAdminPermissions = () => {
  return useQuery({
    queryKey: ['admin', 'permissions'],
    queryFn: async () => {
      const response = await apiClient.get<Permission[]>('/permissions');
      return response.data;
    },
  });
};

export const useAssignPermission = () => {
  const queryClient = useQueryClient();
  const setPermissions = useAdminStore((state) => state.setPermissions);
  
  return useMutation({
    mutationFn: async (data: AssignPermissionRequest) => {
      const response = await apiClient.post('/permissions/assign', data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'permissions'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'permissions', 'user', variables.adminId] });
    },
  });
};

export const useRevokePermission = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: AssignPermissionRequest) => {
      await apiClient.delete('/permissions/revoke', { data });
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'permissions'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'permissions', 'user', variables.adminId] });
    },
  });
};

export const useAdminUserPermissions = (adminId: string) => {
  return useQuery({
    queryKey: ['admin', 'permissions', 'user', adminId],
    queryFn: async () => {
      const response = await apiClient.get<Permission[]>(`/permissions/admin/${adminId}`);
      return response.data;
    },
    enabled: !!adminId,
  });
};

