import axios from 'axios';
import { toast } from 'react-toastify';

// Define the base URL for the API
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create base axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 second timeout
});

// Add interceptor to add JWT token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Variable to prevent multiple token refresh attempts in parallel
let isRefreshing = false;
// Store pending requests that should be retried after token refresh
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.method.toUpperCase()} ${response.config.url}`);
    return response;
  },
  async (error) => {
    // Get the original request
    const originalRequest = error.config;
    
    // Log detailed error information for debugging
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Error Response:', {
        status: error.response.status,
        url: error.config?.url,
        method: error.config?.method,
        data: error.response.data,
      });
      
      // Handle 401 Unauthorized errors (token expired or invalid)
      if (error.response.status === 401 && !originalRequest._retry) {
        // Check if we're on a billing-related page or making a billing-related request
        const isBillingPage = window.location.pathname.includes('/billing');
        const isBillingRequest = originalRequest.url.includes('/billing');
        
        // Prevent automatic redirect to login for billing paths
        if (isBillingPage || isBillingRequest) {
          // If we're already trying to refresh the token, queue this request
          if (isRefreshing) {
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            })
              .then(token => {
                originalRequest.headers['Authorization'] = `Bearer ${token}`;
                return axios(originalRequest);
              })
              .catch(err => {
                // If token refresh ultimately fails, show a notification instead of redirecting
                toast.error('Your session has expired. Please refresh the page and try again.');
                return Promise.reject(err);
              });
          }
          
          originalRequest._retry = true;
          isRefreshing = true;
          
          // Try to refresh the token or handle gracefully
          try {
            // You can implement token refresh here if you have a refresh token mechanism
            // For now, we'll just show a toast notification
            toast.warning('Your session may have expired. Please try again.', {
              toastId: 'session-expired',
              autoClose: 5000
            });
            
            isRefreshing = false;
            processQueue(error);
            
            // Return the original error instead of redirecting
            return Promise.reject(error);
          } catch (refreshError) {
            isRefreshing = false;
            processQueue(refreshError);
            
            // Show notification instead of redirect
            toast.error('Authentication error. Please refresh the page and try again.');
            return Promise.reject(refreshError);
          }
        }
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('API Error (No Response):', {
        url: error.config?.url,
        method: error.config?.method,
      });
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('API Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api; 