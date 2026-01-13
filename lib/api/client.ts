import axios from 'axios';
import { useAuthStore } from '@/lib/stores/authStore';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// #region agent log
if (typeof window !== 'undefined') {
  fetch('http://127.0.0.1:7246/ingest/fe4c5ec4-2787-4be7-9054-016ec7118181',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'lib/api/client.ts:6',message:'API URL check',data:{API_BASE_URL,env:process.env.NEXT_PUBLIC_API_URL},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'I'})}).catch(()=>{});
}
// #endregion

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

