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
    queryKey: ['admin', 'user-permissions', adminId],
    queryFn: async () => {
      // Note: This endpoint needs to be created in the backend
      // GET /users/:id/permissions or similar
      try {
        const response = await apiClient.get<Permission[]>(`/users/${adminId}/permissions`);
        return response.data;
      } catch {
        // If endpoint doesn't exist yet, return empty array
        return [] as Permission[];
      }
    },
    enabled: !!adminId,
  });
};

