import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import { Permission } from './useAdminPermissions';

/**
 * Hook to fetch a specific admin's permissions
 * 
 * Used in the Admins & Permissions page to show which permissions an admin has
 */
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

