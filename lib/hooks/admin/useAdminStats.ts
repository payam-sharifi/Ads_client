import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';

export interface AdminStats {
  pendingAds: number;
  approvedAds: number;
  rejectedAds: number;
  totalUsers: number;
  totalAds: number;
  blockedUsers: number;
  suspendedUsers: number;
  pendingReports: number;
  totalMessages: number;
  totalCategories: number;
  totalCities: number;
  totalAdmins?: number;
}

/**
 * Admin Stats Hook
 * 
 * Fetches dashboard statistics for admin overview
 */
export const useAdminStats = () => {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      // Fetch stats by querying different endpoints
      let adsRes, usersRes, reportsRes;
      try {
        [adsRes, usersRes, reportsRes] = await Promise.all([
          apiClient.get('/ads', { params: { limit: 1 } }),
          apiClient.get('/users', { params: { limit: 1 } }),
          apiClient.get('/reports', { params: { status: 'pending', limit: 1 } }),
        ]);
      } catch (error: any) {
        throw error;
      }

      // Get pending ads count
      let pendingAdsRes;
      try {
        pendingAdsRes = await apiClient.get('/ads', {
          params: { status: 'PENDING_APPROVAL', limit: 1 },
        });
      } catch (error: any) {
        throw error;
      }

      // Get approved ads count
      let approvedAdsRes;
      try {
        approvedAdsRes = await apiClient.get('/ads', {
          params: { status: 'APPROVED', limit: 1 },
        });
      } catch (error: any) {
        throw error;
      }

      // Get rejected ads count
      let rejectedAdsRes;
      try {
        rejectedAdsRes = await apiClient.get('/ads', {
          params: { status: 'REJECTED', limit: 1 },
        });
      } catch (error: any) {
        throw error;
      }

      // Get blocked users count
      let blockedUsersRes;
      try {
        blockedUsersRes = await apiClient.get('/users', {
          params: { isBlocked: true, limit: 1 },
        });
      } catch (error: any) {
        throw error;
      }

      // Get suspended users count
      let suspendedUsersRes;
      try {
        suspendedUsersRes = await apiClient.get('/users', {
          params: { isSuspended: true, limit: 1 },
        });
      } catch (error: any) {
        throw error;
      }

      // Get total messages count (try admin/all first, fallback to admin/my)
      let totalMessages = 0;
      try {
        const messagesRes = await apiClient.get('/messages/admin/all', {
          params: { limit: 1 },
        });
        totalMessages = messagesRes.data?.pagination?.total || messagesRes.data?.total || 0;
      } catch (error) {
        // If super admin endpoint fails, try admin/my
        try {
          const messagesRes = await apiClient.get('/messages/admin/my', {
            params: { limit: 1 },
          });
          totalMessages = messagesRes.data?.pagination?.total || messagesRes.data?.total || 0;
        } catch (err) {
          totalMessages = 0;
        }
      }

      // Get total categories count
      let totalCategories = 0;
      try {
        const categoriesRes = await apiClient.get('/categories');
        totalCategories = Array.isArray(categoriesRes.data) ? categoriesRes.data.length : 0;
      } catch (error) {
        totalCategories = 0;
      }

      // Get total cities count
      let totalCities = 0;
      try {
        const citiesRes = await apiClient.get('/cities');
        totalCities = Array.isArray(citiesRes.data) ? citiesRes.data.length : 0;
      } catch (error) {
        totalCities = 0;
      }

      // Get total admins count (only for Super Admin)
      let totalAdmins = 0;
      try {
        // Get all users to count admins
        const allUsersRes = await apiClient.get('/users', {
          params: { limit: 1000 },
        });
        if (allUsersRes.data?.data) {
          totalAdmins = allUsersRes.data.data.filter(
            (u: any) => u.role?.name === 'ADMIN' || u.role?.name === 'SUPER_ADMIN'
          ).length;
        }
      } catch (error) {
        // If user doesn't have permission, set to 0
        totalAdmins = 0;
      }

      const result = {
        pendingAds: pendingAdsRes?.data?.pagination?.total || pendingAdsRes?.data?.total || 0,
        approvedAds: approvedAdsRes?.data?.pagination?.total || approvedAdsRes?.data?.total || 0,
        rejectedAds: rejectedAdsRes?.data?.pagination?.total || rejectedAdsRes?.data?.total || 0,
        totalUsers: usersRes?.data?.total || usersRes?.data?.pagination?.total || 0,
        totalAds: adsRes?.data?.pagination?.total || adsRes?.data?.total || 0,
        blockedUsers: blockedUsersRes?.data?.total || blockedUsersRes?.data?.pagination?.total || 0,
        suspendedUsers: suspendedUsersRes?.data?.total || suspendedUsersRes?.data?.pagination?.total || 0,
        pendingReports: reportsRes?.data?.total || reportsRes?.data?.pagination?.total || 0,
        totalMessages,
        totalCategories,
        totalCities,
        totalAdmins,
      } as AdminStats;
      return result;
    },
  });
};

