import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';

/**
 * Report Types and Interfaces
 * 
 * Matches backend Report entity structure
 */
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
  updatedAt?: string;
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

export interface CreateReportDto {
  type: 'ad' | 'message';
  entityId: string; // adId or messageId
  reason: string;
}

export interface UpdateReportStatusDto {
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  adminNotes?: string;
}

export interface ReportsResponse {
  data: Report[];
  total: number;
  page: number;
  limit: number;
}

/**
 * API Hook: POST /api/reports
 * Create a new report (requires auth)
 */
export const useCreateReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateReportDto) => {
      const response = await apiClient.post<Report>('/reports', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
};

/**
 * API Hook: GET /api/reports
 * Get all reports (Admin/Super Admin only - requires messages.view permission)
 */
export const useReports = (filters?: { type?: 'ad' | 'message'; status?: string; page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['reports', filters],
    queryFn: async () => {
      const response = await apiClient.get<ReportsResponse>('/reports', { params: filters });
      return response.data;
    },
  });
};

/**
 * API Hook: GET /api/reports/:id
 * Get report by ID (Admin/Super Admin only - requires messages.view permission)
 */
export const useReport = (id: string) => {
  return useQuery({
    queryKey: ['report', id],
    queryFn: async () => {
      const response = await apiClient.get<any>(`/reports/${id}`);
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
    enabled: !!id,
  });
};

/**
 * API Hook: PATCH /api/reports/:id/status
 * Update report status (Admin/Super Admin only - requires messages.view permission)
 */
export const useUpdateReportStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateReportStatusDto }) => {
      const response = await apiClient.patch<Report>(`/reports/${id}/status`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['report', variables.id] });
    },
  });
};

