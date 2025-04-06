import axios from 'axios';
import { toast } from 'react-toastify';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Check if the token is valid without triggering a page redirect
 * @returns {Promise<boolean>} True if token is valid, false otherwise
 */
export const checkTokenValidity = async () => {
  const token = localStorage.getItem('token');
  if (!token) return false;
  
  try {
    const response = await axios.get(`${API_BASE_URL}/auth/verify`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return true;
  } catch (error) {
    console.error('Silent token check failed:', error);
    return false;
  }
};

/**
 * Attempt to refresh the authentication token
 * @returns {Promise<boolean>} True if token was successfully refreshed
 */
export const refreshToken = async () => {
  try {
    // Check if your backend supports token refresh
    // If it does, implement the refresh logic here
    
    // For now, we'll just return false to indicate refresh is not supported
    console.log('Token refresh attempted but not implemented');
    return false;
    
    // Example implementation if your backend supports token refresh:
    /*
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return false;
    
    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
    const { token } = response.data;
    localStorage.setItem('token', token);
    return true;
    */
  } catch (error) {
    console.error('Token refresh failed:', error);
    return false;
  }
};

/**
 * Handles authentication errors gracefully in components,
 * especially useful for actions in billing pages
 * @param {Function} actionFn The function to execute that may encounter auth errors
 * @param {string} errorMessage The error message to display if action fails
 * @returns {Promise<any>} The result of the action function
 */
export const withAuthErrorHandling = async (actionFn, errorMessage = 'Authentication error. Please try again.') => {
  try {
    // Get the token directly - no async validation to avoid race conditions
    const token = localStorage.getItem('token');
    
    if (!token) {
      // No token available, show error message
      toast.error(errorMessage, { toastId: 'auth-error-no-token' });
      return null;
    }
    
    // Execute the action directly without pre-validating the token
    // This lets the API interceptor handle any auth issues
    return await actionFn();
  } catch (error) {
    console.error('Action execution error:', error);
    
    // Handle auth errors specially
    if (error.response && error.response.status === 401) {
      toast.error(errorMessage, { toastId: 'auth-error-action' });
      return null;
    }
    
    // For other errors, show generic message
    toast.error(error.message || 'An error occurred. Please try again.', { 
      toastId: 'action-general-error' 
    });
    
    return null;
  }
}; 