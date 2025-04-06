import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { testApiConnection, getApiDiagnostics } from '../utils/apiCheck';
import { checkApiHealth } from '../api';
import axios from 'axios';
import { API_BASE_URL } from '../api/api';

const ApiTroubleshoot = () => {
  const [testResults, setTestResults] = useState(null);
  const [diagnostics, setDiagnostics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [healthResult, setHealthResult] = useState(null);
  const [directLoginResult, setDirectLoginResult] = useState(null);
  const [loginCredentials, setLoginCredentials] = useState({
    email: '',
    password: ''
  });
  const [healthCheckResult, setHealthCheckResult] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadDiagnostics();
  }, []);

  const loadDiagnostics = () => {
    setDiagnostics(getApiDiagnostics());
  };

  const runApiTest = async () => {
    setLoading(true);
    try {
      const result = await testApiConnection();
      setTestResults(result);
    } catch (error) {
      setTestResults({
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const runHealthCheck = async () => {
    setLoading(true);
    try {
      const health = await checkApiHealth();
      setHealthResult(health);
    } catch (error) {
      setHealthResult({
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDirectLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const testDirectLogin = async () => {
    setLoading(true);
    setDirectLoginResult(null);
    
    try {
      console.log('Attempting direct login to:', `${API_BASE_URL}/auth/login`);
      const response = await axios.post(`${API_BASE_URL}/auth/login`, loginCredentials, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      });
      
      setDirectLoginResult({
        status: 'success',
        statusCode: response.status,
        data: {
          ...response.data,
          token: response.data.token ? 'TOKEN_PRESENT' : 'NO_TOKEN'
        },
        timestamp: new Date().toISOString()
      });
      
      console.log('Direct login successful:', response);
    } catch (error) {
      console.error('Direct login failed:', error);
      
      const result = {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error.message,
      };
      
      if (error.response) {
        result.statusCode = error.response.status;
        result.data = error.response.data;
      }
      
      setDirectLoginResult(result);
    } finally {
      setLoading(false);
    }
  };

  const testDirectHealthCheck = async () => {
    try {
      setHealthCheckResult({ status: 'loading' });
      
      // Add a timestamp to prevent caching
      const timestamp = new Date().getTime();
      
      // Try with fetch API but use the proxy setup
      const response = await fetch(`/api/auth/health?_=${timestamp}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setHealthCheckResult({ 
          status: 'success', 
          statusCode: response.status,
          data: data
        });
      } else {
        setHealthCheckResult({ 
          status: 'error', 
          statusCode: response.status,
          message: `Error: ${response.statusText}`
        });
      }
    } catch (error) {
      console.error('Health check error:', error);
      setHealthCheckResult({ 
        status: 'error', 
        message: error.message || 'Unknown error'
      });
    }
  };

  const renderStatus = (status) => {
    if (status === 'success') {
      return <span className="px-2 py-1 bg-green-100 text-green-800 rounded">Success</span>;
    } else {
      return <span className="px-2 py-1 bg-red-100 text-red-800 rounded">Failed</span>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">API Troubleshooting</h1>
        <button
          onClick={() => navigate('/login')}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to Login
        </button>
      </div>
      
      <div className="grid gap-6 mb-8">
        {/* API Diagnostics */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">API Configuration</h2>
          {diagnostics ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">API URL</p>
                <p className="mt-1">{diagnostics.apiUrl}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Environment</p>
                <p className="mt-1">{diagnostics.environment}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm font-medium text-gray-500">Browser</p>
                <p className="mt-1 text-sm">{diagnostics.browserId}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Time</p>
                <p className="mt-1">{diagnostics.timestamp}</p>
              </div>
            </div>
          ) : (
            <p>Loading diagnostics...</p>
          )}
        </div>
        
        {/* Test Buttons */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Connection Tests</h2>
          <div className="flex flex-wrap gap-4 mb-6">
            <button
              onClick={runApiTest}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Test API Connection'}
            </button>
            <button
              onClick={runHealthCheck}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Run API Health Check'}
            </button>
          </div>
          
          {/* API Test Results */}
          {testResults && (
            <div className="mt-4">
              <h3 className="text-md font-semibold text-gray-800 mb-2">
                API Test Results {renderStatus(testResults.status)}
              </h3>
              <pre className="bg-gray-50 p-4 rounded text-sm overflow-auto max-h-96">
                {JSON.stringify(testResults, null, 2)}
              </pre>
            </div>
          )}
          
          {/* Health Check Results */}
          {healthResult && (
            <div className="mt-4">
              <h3 className="text-md font-semibold text-gray-800 mb-2">
                Health Check Results {renderStatus(healthResult.status)}
              </h3>
              <pre className="bg-gray-50 p-4 rounded text-sm overflow-auto max-h-96">
                {JSON.stringify(healthResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
        
        {/* Troubleshooting Steps */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Troubleshooting Steps</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>Ensure the backend server is running at {diagnostics?.apiUrl}</li>
            <li>Check that the port (usually 5000) is not blocked by a firewall</li>
            <li>Verify that the API URL in your .env file is correct</li>
            <li>Ensure your backend allows CORS for your frontend domain</li>
            <li>Check the browser console for network errors</li>
            <li>Try clearing your browser cache and cookies</li>
            <li>Restart both the frontend and backend servers</li>
          </ol>
        </div>
        
        {/* Direct Login Test */}
        <div className="bg-white shadow rounded-lg p-6 mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Direct Login Test</h2>
          <p className="mb-4 text-sm text-gray-700">
            This will attempt to login directly using axios without going through the Auth context.
            Use this to test if the login API itself is working.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={loginCredentials.email}
                onChange={handleDirectLoginChange}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={loginCredentials.password}
                onChange={handleDirectLoginChange}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>
          
          <button
            onClick={testDirectLogin}
            disabled={loading || !loginCredentials.email || !loginCredentials.password}
            className="w-full md:w-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Direct Login'}
          </button>
          
          {directLoginResult && (
            <div className="mt-4">
              <h3 className="text-md font-semibold text-gray-800 mb-2">
                Direct Login Test Results {renderStatus(directLoginResult.status)}
              </h3>
              <pre className="bg-gray-50 p-4 rounded text-sm overflow-auto max-h-96">
                {JSON.stringify(directLoginResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
        
        {/* Direct API Health Check */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Test Direct API Health Check</h3>
          <p className="text-sm text-gray-600 mb-4">
            This tests a direct fetch to the API health endpoint to diagnose CORS issues.
          </p>
          
          <button
            onClick={testDirectHealthCheck}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mb-4"
          >
            Test API Health
          </button>
          
          {healthCheckResult && (
            <div className={`mt-4 p-4 rounded ${
              healthCheckResult.status === 'loading' ? 'bg-gray-100' :
              healthCheckResult.status === 'success' ? 'bg-green-100' : 'bg-red-100'
            }`}>
              <div className="font-semibold mb-2">
                {healthCheckResult.status === 'loading' ? 'Testing...' :
                 healthCheckResult.status === 'success' ? 'Success!' : 'Error!'}
              </div>
              
              {healthCheckResult.status === 'success' ? (
                <pre className="text-xs overflow-x-auto">
                  {JSON.stringify(healthCheckResult.data, null, 2)}
                </pre>
              ) : healthCheckResult.status === 'error' ? (
                <div className="text-red-700">
                  {healthCheckResult.message}
                  {healthCheckResult.statusCode && ` (Status: ${healthCheckResult.statusCode})`}
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApiTroubleshoot; 