import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Login = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, error, apiStatus, checkApiConnection } = useAuth();
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
    
    try {
      const success = await login(credentials);
      if (success) {
        navigate('/dashboard');
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
            Hospital Management System
          </h2>
          <h3 className="mt-2 text-center text-xl text-gray-600">
            Sign in to your account
          </h3>
        </div>
        
        {apiStatus.checked && !apiStatus.healthy && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative">
            <strong>Server connection issue:</strong> Unable to connect to the backend server. 
            <div className="mt-2">
              <span className="block">Possible solutions:</span>
              <ul className="list-disc pl-5 mt-1 text-sm">
                <li>Make sure the backend server is running</li>
                <li>Check for any network issues</li>
                <li>Try the developer login option below</li>
              </ul>
            </div>
            <button 
              onClick={checkApiConnection}
              className="mt-2 underline text-blue-600 hover:text-blue-800"
            >
              Retry connection
            </button>
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
              disabled={isSubmitting || (apiStatus.checked && !apiStatus.healthy)}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
                Sign up
              </Link>
            </p>
            {(error || (apiStatus.checked && !apiStatus.healthy)) && (
              <p className="mt-2 text-sm text-gray-600">
                Having trouble logging in?{' '}
                <Link to="/troubleshoot" className="font-medium text-blue-600 hover:text-blue-500">
                  Troubleshoot connection
                </Link>
              </p>
            )}
          </div>
        </form>
        
        {/* Development helper */}
        {import.meta.env.MODE === 'development' && (
          <div className="mt-4 text-xs text-gray-500">
            <p>API URL: {import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}</p>
            <p>API Status: {apiStatus.checked ? (apiStatus.healthy ? 'Connected' : 'Not Connected') : 'Checking...'}</p>
            <p className="mt-1">
              <Link to="/troubleshoot" className="text-blue-600 hover:text-blue-800">
                Open Troubleshooting Tools
              </Link>
            </p>
            <p className="mt-1">
              <Link to="/dev-login" className="text-green-600 hover:text-green-800 font-bold">
                Use Developer Login (Bypasses Health Checks)
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login; 