import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import { useAuthStore } from '@/lib/stores/authStore';

/**
 * Message Types and Interfaces
 * 
 * Matches backend Message entity structure
 */
export interface Message {
  id: string;
  adId: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  updatedAt?: string;
  ad?: {
    id: string;
    title: string;
  };
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
}

export interface CreateMessageDto {
  adId: string;
  messageText: string;
}

/**
 * API Hook: POST /api/messages
 * Send a message about an ad (requires auth)
 */
export const useSendMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateMessageDto) => {
      const response = await apiClient.post<any>('/messages', data);
      // Transform messageText to content for frontend compatibility
      return {
        ...response.data,
        content: response.data.messageText || response.data.content,
      } as Message;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['messages', 'ad', variables.adId] });
      queryClient.invalidateQueries({ queryKey: ['messages', 'inbox'] });
      queryClient.invalidateQueries({ queryKey: ['messages', 'unread-count'] });
    },
  });
};

/**
 * API Hook: GET /api/messages/inbox/my
 * Get current user's inbox (requires auth)
 */
export const useMyInbox = () => {
  return useQuery({
    queryKey: ['messages', 'inbox'],
    queryFn: async () => {
      const response = await apiClient.get<any[]>('/messages/inbox/my');
      // Transform messageText to content for frontend compatibility
      const transformed = response.data.map((msg: any) => ({
        ...msg,
        content: msg.messageText || msg.content,
      }));
      return transformed as Message[];
    },
  });
};

/**
 * Conversation interface
 */
export interface Conversation {
  adId: string;
  ad: {
    id: string;
    title: string;
    images?: Array<{ url: string }>;
  };
  otherUser: {
    id: string;
    name: string;
    email: string;
  };
  lastMessage: {
    id: string;
    content: string;
    createdAt: string;
    isRead: boolean;
    senderId: string;
  };
  unreadCount: number;
}

/**
 * API Hook: GET /api/messages/conversations
 * Get conversations grouped by ad and user (requires auth)
 */
export const useConversations = () => {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ['messages', 'conversations'],
    queryFn: async () => {
      const response = await apiClient.get<Conversation[]>('/messages/conversations');
      return response.data;
    },
    enabled: isAuthenticated,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

/**
 * API Hook: GET /api/messages/ad/:adId
 * Get all messages for an ad (requires auth)
 */
export const useAdMessages = (adId: string) => {
  return useQuery({
    queryKey: ['messages', 'ad', adId],
    queryFn: async () => {
      const response = await apiClient.get<any[]>(`/messages/ad/${adId}`);
      // Transform messageText to content for frontend compatibility
      const transformed = response.data.map((msg: any) => ({
        ...msg,
        content: msg.messageText || msg.content,
      }));
      return transformed as Message[];
    },
    enabled: !!adId,
  });
};

/**
 * API Hook: GET /api/messages/:id
 * Get message by ID (requires auth)
 */
export const useMessage = (id: string) => {
  return useQuery({
    queryKey: ['message', id],
    queryFn: async () => {
      const response = await apiClient.get<any>(`/messages/${id}`);
      // Transform messageText to content for frontend compatibility
      return {
        ...response.data,
        content: response.data.messageText || response.data.content,
      } as Message;
    },
    enabled: !!id,
  });
};

/**
 * API Hook: PATCH /api/messages/:id/read
 * Mark message as read (requires auth)
 */
export const useMarkMessageAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.patch<any>(`/messages/${id}/read`);
      // Transform messageText to content for frontend compatibility
      return {
        ...response.data,
        content: response.data.messageText || response.data.content,
      } as Message;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['message', id] });
      queryClient.invalidateQueries({ queryKey: ['messages', 'inbox'] });
      queryClient.invalidateQueries({ queryKey: ['messages', 'unread-count'] });
    },
  });
};

/**
 * API Hook: DELETE /api/messages/:id
 * Delete a message (requires auth)
 */
export const useDeleteMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/messages/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['messages', 'inbox'] });
      queryClient.invalidateQueries({ queryKey: ['messages', 'unread-count'] });
    },
  });
};

/**
 * API Hook: PATCH /api/messages/ad/:adId/read-all
 * Mark all messages as read for an ad (requires auth)
 */
export const useMarkAllAsReadForAd = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (adId: string) => {
      const response = await apiClient.patch<{ count: number }>(`/messages/ad/${adId}/read-all`);
      return response.data;
    },
    onSuccess: (_, adId) => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['messages', 'ad', adId] });
      queryClient.invalidateQueries({ queryKey: ['messages', 'inbox'] });
      queryClient.invalidateQueries({ queryKey: ['messages', 'unread-count'] });
      queryClient.invalidateQueries({ queryKey: ['messages', 'unread-count', 'ad', adId] });
    },
  });
};

/**
 * API Hook: GET /api/messages/unread/count
 * Get unread messages count (requires auth)
 */
export const useUnreadMessagesCount = () => {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ['messages', 'unread-count'],
    queryFn: async () => {
      const response = await apiClient.get<{ count: number }>('/messages/unread-count');
      return response.data.count;
    },
    enabled: isAuthenticated, // Only fetch when authenticated
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

/**
 * API Hook: GET /api/messages/unread-count/ad/:adId
 * Get unread messages count for a specific ad (requires auth)
 */
export const useUnreadMessagesCountForAd = (adId: string) => {
  const { isAuthenticated } = useAuthStore();
  return useQuery({
    queryKey: ['messages', 'unread-count', 'ad', adId],
    queryFn: async () => {
      const response = await apiClient.get<{ count: number }>(`/messages/unread-count/ad/${adId}`);
      return response.data.count;
    },
    enabled: isAuthenticated && !!adId, // Only fetch when authenticated and adId is provided
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};
