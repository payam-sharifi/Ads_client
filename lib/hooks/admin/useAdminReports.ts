import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';

export interface Report {
  id: string;
  type: 'ad' | 'message';
  adId?: string;
  messageId?: string;
  reporterId: string;
  reason: string;
  adminNotes?: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  createdAt: string;
  updatedAt: string;
  reporter?: {
    id: string;
    name: string;
    email: string;
  };
  ad?: {
    id: string;
    title: string;
  };
  message?: {
    id: string;
    content: string;
  };
}

export interface ReportsResponse {
  data: Report[];
  total: number;
  page: number;
  limit: number;
}

export interface UpdateReportStatusRequest {
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  adminNotes?: string;
}

/**
 * Admin Reports Hooks
 * 
 * Provides React Query hooks for report management:
 * - Fetch all reports
 * - Update report status
 */
export const useAdminReports = (filters?: {
  type?: 'ad' | 'message';
  status?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['admin', 'reports', filters],
    queryFn: async () => {
      const response = await apiClient.get<any>('/reports', { params: filters });
      // Transform messageText to content for message fields if present
      const transformed = {
        ...response.data,
        data: response.data.data.map((report: any) => {
          if (report.message && report.message.messageText) {
            report.message = {
              ...report.message,
              content: report.message.messageText || report.message.content,
            };
          }
          return report;
        }),
      };
      return transformed as ReportsResponse;
    },
  });
};

export const useUpdateReportStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateReportStatusRequest }) => {
      const response = await apiClient.patch<any>(`/reports/${id}/status`, data);
      // Transform messageText to content for message field if present
      const report = response.data;
      if (report.message && report.message.messageText) {
        report.message = {
          ...report.message,
          content: report.message.messageText || report.message.content,
        };
      }
      return report as Report;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] });
    },
  });
};

export const useUserReports = (userId: string, filters?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['admin', 'reports', 'user', userId, filters],
    queryFn: async () => {
      const response = await apiClient.get<ReportsResponse>(`/reports/user/${userId}`, { 
        params: filters,
      });
      // Transform messageText to content for message fields if present
      const transformed = {
        ...response.data,
        data: response.data.data.map((report: any) => {
          if (report.message && report.message.messageText) {
            report.message = {
              ...report.message,
              content: report.message.messageText || report.message.content,
            };
          }
          return report;
        }),
      };
      return transformed as ReportsResponse;
    },
    enabled: !!userId,
  });
};

