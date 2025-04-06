import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const DevLogin = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [loginMessage, setLoginMessage] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setLoginMessage('Attempting direct login...');
    
    try {
      // Direct login without health checks
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      console.log('Dev Login: Attempting direct login to:', `${baseUrl}/auth/login`);
      
      const response = await axios.post(`${baseUrl}/auth/login`, credentials, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000 // Longer timeout
      });
      
      console.log('Dev Login: Login response received:', response.status);
      
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      
      setLoginMessage('Login successful! Redirecting...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (err) {
      console.error('Dev Login: Login error details:', err);
      
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
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Developer Login
          </h2>
          <h3 className="mt-2 text-center text-xl text-gray-600">
            Direct login (bypasses health checks)
          </h3>
          <p className="text-center text-red-500 font-semibold">
            For development use only
          </p>
        </div>
        
        {loginMessage && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative">
            {loginMessage}
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            {error}
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={credentials.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={credentials.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Signing in...' : 'Sign in (Direct)'}
            </button>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-600">
              <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                Back to normal login
              </Link>
            </p>
            <p className="mt-2 text-sm text-gray-600">
              <Link to="/troubleshoot" className="font-medium text-blue-600 hover:text-blue-500">
                Troubleshoot connection
              </Link>
            </p>
          </div>
        </form>
        
        <div className="mt-4 text-xs text-gray-500">
          <p>API URL: {import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}</p>
          <p>This login method bypasses the health checks and AuthContext</p>
          <p>After login, you'll be redirected to the dashboard</p>
        </div>
      </div>
    </div>
  );
};

export default DevLogin; 