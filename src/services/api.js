import axios from 'axios';
import { store } from '../store';
import { logout_user } from '../store/reducers/authReducer';
import { storage } from '../utils/storage';

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const state = store.getState();
    const token = state.vendor?.token || storage.getToken();
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh token if refresh token exists
        const refreshToken = storage.getRefreshToken();
        if (refreshToken) {
          const response = await axios.post(
            `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/refresh`,
            { refreshToken }
          );
          
          if (response.data.success) {
            const newToken = response.data.token;
            storage.setToken(newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
      }
      
      // If refresh fails, logout user
      store.dispatch(logout_user());
      window.location.href = '/supplier/login';
      return Promise.reject(error);
    }
    
    // Handle other errors
    if (error.response) {
      // Server responded with error status
      const errorMessage = error.response.data?.error || error.response.data?.message || 'An error occurred';
      console.error('API Error:', {
        status: error.response.status,
        message: errorMessage,
        url: error.config.url,
        method: error.config.method,
      });
      
      // Show toast notification for non-401 errors
      if (error.response.status !== 401 && typeof window !== 'undefined') {
        import('sonner').then(({ toast }) => {
          toast.error(errorMessage);
        });
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network Error:', error.request);
      if (typeof window !== 'undefined') {
        import('sonner').then(({ toast }) => {
          toast.error('Network error. Please check your connection.');
        });
      }
    } else {
      // Something else happened
      console.error('Request Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Helper function for file uploads
api.upload = (url, formData, config = {}) => {
  return api.post(url, formData, {
    ...config,
    headers: {
      ...config.headers,
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Helper function for downloading files
api.download = (url, config = {}) => {
  return api.get(url, {
    ...config,
    responseType: 'blob',
  });
};

export { api };
