import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';

/**
 * Permission Types and Interfaces
 * 
 * Matches backend Permission entity structure
 */
export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description?: string;
  createdAt?: string;
}

/**
 * API Hook: GET /api/permissions
 * Get all permissions (Admin/Super Admin only)
 */
export const usePermissions = () => {
  return useQuery({
    queryKey: ['permissions'],
    queryFn: async () => {
      const response = await apiClient.get<Permission[]>('/permissions');
      return response.data;
    },
  });
};

/**
 * API Hook: POST /api/permissions/assign
 * Assign permission to admin (Super Admin only - requires admins.manage permission)
 */
export const useAssignPermission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ adminId, permissionId }: { adminId: string; permissionId: string }) => {
      const response = await apiClient.post('/permissions/assign', { adminId, permissionId });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
};

/**
 * API Hook: DELETE /api/permissions/revoke
 * Revoke permission from admin (Super Admin only - requires admins.manage permission)
 */
export const useRevokePermission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ adminId, permissionId }: { adminId: string; permissionId: string }) => {
      await apiClient.delete('/permissions/revoke', { data: { adminId, permissionId } });
      return { adminId, permissionId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
};

