import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';
import { useAuthStore } from '@/lib/stores/authStore';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token?: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role?: {
      id: string;
      name: 'SUPER_ADMIN' | 'ADMIN' | 'USER';
      description?: string;
    };
  };
}

export const useLogin = () => {
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
      return response.data;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.access_token);
      queryClient.invalidateQueries();
    },
  });
};

export const useSignup = () => {
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: async (data: SignupRequest) => {
      const response = await apiClient.post<AuthResponse>('/auth/signup', data);
      return response.data;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.access_token);
      queryClient.invalidateQueries();
    },
  });
};

/**
 * API Hook: POST /api/auth/refresh
 * Refresh access token using refresh token
 */
export const useRefreshToken = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  return useMutation({
    mutationFn: async (refreshToken: string) => {
      const response = await apiClient.post<AuthResponse>('/auth/refresh', { refreshToken });
      return response.data;
    },
    onSuccess: (data) => {
      if (data.user && data.access_token) {
        setAuth(data.user, data.access_token);
      }
    },
  });
};

/**
 * API Hook: POST /api/auth/logout
 * Logout - invalidate refresh token
 */
export const useLogout = () => {
  const queryClient = useQueryClient();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  return useMutation({
    mutationFn: async () => {
      // Try to call logout endpoint, but don't fail if it doesn't work
      // Logout should always clear local state regardless of API response
      await apiClient.post('/auth/logout').catch(() => {
        // Silently ignore logout API errors - we'll still clear local state
      });
    },
    onSuccess: () => {
      // Always clear auth state and queries
      clearAuth();
      queryClient.clear();
    },
    onError: () => {
      // Clear state even if API call fails (404, network error, etc.)
      clearAuth();
      queryClient.clear();
    },
  });
};

