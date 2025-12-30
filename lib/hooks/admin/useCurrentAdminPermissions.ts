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
    queryKey: ['admin', 'permissions', 'user', user?.id],
    queryFn: async () => {
      if (!user?.id) return [] as Permission[];
      
      try {
        // Use the same endpoint as useAdminUserPermissions but for current user
        const response = await apiClient.get<Permission[]>(`/permissions/admin/${user.id}`);
        return response.data;
      } catch {
        // If endpoint doesn't exist or user doesn't have access, return empty array
        return [] as Permission[];
      }
    },
    enabled: !!user && (user.role?.name === 'ADMIN' || user.role?.name === 'SUPER_ADMIN'),
  });
};

