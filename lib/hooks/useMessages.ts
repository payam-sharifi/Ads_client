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
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/b43a6682-6986-4e79-9b73-4d93dd0f722a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useMessages.ts:66',message:'useMyInbox: received response',data:{count:response.data.length,firstMessage:response.data[0]?{id:response.data[0].id,hasMessageText:'messageText' in response.data[0],hasContent:'content' in response.data[0],messageText:response.data[0].messageText,content:response.data[0].content,allKeys:Object.keys(response.data[0]||{})}:null},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      // Transform messageText to content for frontend compatibility
      const transformed = response.data.map((msg: any) => ({
        ...msg,
        content: msg.messageText || msg.content,
      }));
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/b43a6682-6986-4e79-9b73-4d93dd0f722a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useMessages.ts:72',message:'useMyInbox: after transformation',data:{count:transformed.length,firstMessage:transformed[0]?{id:transformed[0].id,hasContent:'content' in transformed[0],content:transformed[0].content}:null},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      return transformed as Message[];
    },
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
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/b43a6682-6986-4e79-9b73-4d93dd0f722a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useMessages.ts:80',message:'useAdMessages: received response',data:{adId,count:response.data.length,firstMessage:response.data[0]?{id:response.data[0].id,hasMessageText:'messageText' in response.data[0],hasContent:'content' in response.data[0],messageText:response.data[0].messageText,content:response.data[0].content,allKeys:Object.keys(response.data[0]||{})}:null},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      // Transform messageText to content for frontend compatibility
      const transformed = response.data.map((msg: any) => ({
        ...msg,
        content: msg.messageText || msg.content,
      }));
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/b43a6682-6986-4e79-9b73-4d93dd0f722a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useMessages.ts:88',message:'useAdMessages: after transformation',data:{adId,count:transformed.length,firstMessage:transformed[0]?{id:transformed[0].id,hasContent:'content' in transformed[0],content:transformed[0].content}:null},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
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
