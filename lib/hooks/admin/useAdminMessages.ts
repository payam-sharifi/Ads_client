import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';

export interface Message {
  id: string;
  adId: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  sender?: {
    id: string;
    name: string;
    email: string;
  };
  receiver?: {
    id: string;
    name: string;
    email: string;
  };
  ad?: {
    id: string;
    title: string;
  };
}

export interface MessagesResponse {
  data: Message[];
  total: number;
  page: number;
  limit: number;
}

export interface MessageFilters {
  page?: number;
  limit?: number;
  senderName?: string;
  receiverName?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Admin Messages Hooks
 * 
 * Provides React Query hooks for message monitoring:
 * - Fetch all messages (Super Admin)
 * - Fetch admin's messages (Admin)
 * - Search messages by user name or date
 */
export const useAdminMessages = (filters?: MessageFilters, isSuperAdmin: boolean = false) => {
  return useQuery({
    queryKey: ['admin', 'messages', filters, isSuperAdmin],
    queryFn: async () => {
      const endpoint = isSuperAdmin ? '/messages/admin/all' : '/messages/admin/my';
      const response = await apiClient.get<MessagesResponse>(endpoint, { 
        params: {
          ...filters,
          // Transform messageText to content for frontend compatibility
        },
      });
      // Transform messageText to content for frontend compatibility
      const transformed = {
        ...response.data,
        data: response.data.data.map((msg: any) => ({
          ...msg,
          content: msg.messageText || msg.content,
        })),
      };
      return transformed as MessagesResponse;
    },
    enabled: true,
  });
};

export const useUserMessages = (userId: string, filters?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['admin', 'messages', 'user', userId, filters],
    queryFn: async () => {
      const response = await apiClient.get<MessagesResponse>(`/messages/user/${userId}`, { 
        params: filters,
      });
      // Transform messageText to content for frontend compatibility
      const transformed = {
        ...response.data,
        data: response.data.data.map((msg: any) => ({
          ...msg,
          content: msg.messageText || msg.content,
        })),
      };
      return transformed as MessagesResponse;
    },
    enabled: !!userId,
  });
};

/**
 * Get a single message by ID for admin
 * API: GET /api/messages/admin/:id
 */
export const useAdminMessage = (messageId: string) => {
  return useQuery({
    queryKey: ['admin', 'messages', messageId],
    queryFn: async () => {
      const response = await apiClient.get<Message>(`/messages/admin/${messageId}`);
      // Transform messageText to content for frontend compatibility
      const message = response.data as any;
      return {
        ...message,
        content: message.messageText || message.content,
      } as Message;
    },
    enabled: !!messageId,
  });
};

