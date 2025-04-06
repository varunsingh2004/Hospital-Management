import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { checkApiHealth } from '../api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiStatus, setApiStatus] = useState({ checked: false, healthy: false });

  useEffect(() => {
    // Removed automatic API health check
    const token = localStorage.getItem('token');
    if (token) {
      checkTokenValidity(token);
    } else {
      setLoading(false);
    }
  }, []);

  const checkApiConnection = async () => {
    try {
      const health = await checkApiHealth();
      setApiStatus({ checked: true, healthy: health.status === 'success' });
      if (health.status !== 'success') {
        console.warn('API health check failed:', health);
      }
    } catch (error) {
      console.error('API health check error:', error);
      setApiStatus({ checked: true, healthy: false });
    }
  };

  const checkTokenValidity = async (token) => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await axios.get(`${baseUrl}/auth/verify`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Token validation error:', error);
      
      // Check if we're on a billing page - if so, don't automatically remove token
      const isBillingPage = window.location.pathname.includes('/billing');
      if (!isBillingPage) {
        // Only clear token when not on billing pages
        localStorage.removeItem('token');
      } else {
        console.log('On billing page, allowing API interceptors to handle auth errors');
      }
      
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setError(null);
      
      // Try to check API health, but continue login attempt regardless
      if (!apiStatus.healthy) {
        try {
          await checkApiConnection();
          // If health check fails, we still continue but with a warning
          if (!apiStatus.healthy) {
            console.warn('API health check failed, but attempting login anyway');
          }
        } catch (healthError) {
          console.warn('API health check failed, but attempting login anyway:', healthError);
        }
      }

      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      console.log('Attempting login to:', `${baseUrl}/auth/login`);
      
      const response = await axios.post(`${baseUrl}/auth/login`, credentials, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      });
      
      console.log('Login response received:', response.status);
      
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setUser(user);
      return true;
    } catch (err) {
      console.error('Login error details:', err);
      
      // Handle different types of errors
      if (err.response) {
        // The request was made and the server responded with a non-2xx status code
        if (err.response.status === 401) {
          setError('Invalid email or password. Please try again.');
        } else if (err.response.data && err.response.data.message) {
          setError(err.response.data.message);
        } else {
          setError(`Server error (${err.response.status}). Please try again later.`);
        }
      } else if (err.request) {
        // The request was made but no response was received
        setError('No response from server. Please check your network connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        setError(err.message || 'Login failed. Please try again.');
      }
      
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const register = async (userData) => {
    try {
      setError(null);
      console.log('Sending registration data:', userData);
      
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await axios.post(`${baseUrl}/auth/register`, userData);
      
      console.log('Registration response:', response.data);
      const { token } = response.data;
      localStorage.setItem('token', token);
      return response.data;
    } catch (err) {
      console.error('Registration error:', err);
      
      // More detailed error handling
      if (err.response && err.response.data) {
        if (err.response.data.errors && Array.isArray(err.response.data.errors)) {
          // Handle validation errors from express-validator
          const errorMessages = err.response.data.errors.map(e => e.msg).join(', ');
          setError(errorMessages);
        } else if (err.response.data.message) {
          // Handle specific error message from backend
          setError(err.response.data.message);
        } else {
          // Handle unexpected error format
          setError('Registration failed. Please try again.');
        }
      } else {
        // Handle network or other errors
        setError('Registration failed. Please check your connection and try again.');
      }
      
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      error, 
      apiStatus,
      login, 
      logout, 
      register,
      checkApiConnection 
    }}>
      {children}
    </AuthContext.Provider>
  );
}; 