import axios from 'axios';

/**
 * Performs a health check on the API server
 * @returns {Promise<Object>} Health check result
 */
export const testApiConnection = async () => {
  try {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    console.log('Testing API connection to:', baseUrl);
    
    const response = await axios.get(`${baseUrl}/auth/health`, {
      timeout: 5000,
    });
    
    return {
      status: 'success',
      statusCode: response.status,
      data: response.data,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('API connection test failed:', error);
    
    const result = {
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message,
    };
    
    if (error.response) {
      // Server responded with error
      result.statusCode = error.response.status;
      result.data = error.response.data;
    } else if (error.request) {
      // No response received
      result.type = 'no-response';
    } else {
      // Request setup error
      result.type = 'request-error';
    }
    
    return result;
  }
};

/**
 * Provides diagnostic information about the API configuration
 * @returns {Object} Diagnostic information
 */
export const getApiDiagnostics = () => {
  return {
    apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    environment: import.meta.env.MODE,
    browserId: navigator.userAgent,
    timestamp: new Date().toISOString()
  };
}; 