import axios from 'axios';
import { useAuthStore } from '@/lib/stores/authStore';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    // For FormData (multipart/form-data), don't set Content-Type header
    // Let axios/browser set it automatically with the correct boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear auth state
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        
        // Don't redirect for public routes (ad detail pages, home, category pages, etc.)
        const isPublicRoute = currentPath.startsWith('/ad/') || 
                             currentPath === '/' || 
                             currentPath.startsWith('/category/') || 
                             currentPath.startsWith('/city/') ||
                             currentPath === '/login' ||
                             currentPath === '/signup';
        
        if (!isPublicRoute) {
          // Clear auth state from Zustand store
          const { clearAuth } = useAuthStore.getState();
          clearAuth();
          
          // Only redirect if not already on login page to prevent infinite redirect loop
          if (currentPath !== '/login') {
            window.location.href = '/login';
          }
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;

