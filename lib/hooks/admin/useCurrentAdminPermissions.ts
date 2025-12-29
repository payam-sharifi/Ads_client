import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import { useAuthStore } from '@/lib/stores/authStore';
import { Permission } from './useAdminPermissions';

/**
 * Hook to fetch current admin's permissions
 * 
 * This would call an endpoint like GET /users/me/permissions
 * For now, we'll use the permissions list and check which ones the admin has
 */
export const useCurrentAdminPermissions = () => {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['admin', 'my-permissions', user?.id],
    queryFn: async () => {
      // Note: This endpoint needs to be created in the backend
      // GET /users/me/permissions or similar
      // For now, return empty array - will be populated when endpoint exists
      try {
        const response = await apiClient.get<Permission[]>('/users/me/permissions');
        return response.data;
      } catch {
        // If endpoint doesn't exist yet, return empty array
        return [] as Permission[];
      }
    },
    enabled: !!user && (user.role?.name === 'ADMIN' || user.role?.name === 'SUPER_ADMIN'),
  });
};

