import axios from 'axios';

// Create base axios instance with proper baseURL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add interceptor to add JWT token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log detailed error information for debugging
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Error response:', {
        data: error.response.data,
        status: error.response.status,
        headers: error.response.headers,
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Error request:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Export API functions
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile'),
};

export const patientAPI = {
  registerPatient: (patientData) => api.post('/patients', patientData),
  getPatients: () => api.get('/patients'),
  getPatientById: (id) => api.get(`/patients/${id}`),
  updatePatient: (id, patientData) => api.put(`/patients/${id}`, patientData),
  deletePatient: (id) => api.delete(`/patients/${id}`),
  searchPatients: (searchParams) => api.get('/patients/search', { params: searchParams }),
};

export const doctorAPI = {
  registerDoctor: (doctorData) => api.post('/doctors', doctorData),
  getDoctors: () => api.get('/doctors'),
  getDoctorById: (id) => api.get(`/doctors/${id}`),
  updateDoctor: (id, doctorData) => api.put(`/doctors/${id}`, doctorData),
  deleteDoctor: (id) => api.delete(`/doctors/${id}`),
  searchDoctors: (searchParams) => api.get('/doctors/search', { params: searchParams }),
};

// A flag to track recent API health check calls
let lastHealthCheckTime = 0;
const HEALTH_CHECK_THROTTLE_MS = 5000; // Only allow one check every 5 seconds

// Add a health check function with debouncing
export const checkApiHealth = async () => {
  // Check if we've called this function recently
  const now = Date.now();
  if (now - lastHealthCheckTime < HEALTH_CHECK_THROTTLE_MS) {
    console.log('Health check throttled, skipping...');
    return { 
      status: 'throttled', 
      message: 'Health check was called too frequently. Skipping this request.'
    };
  }
  
  // Update the last check time
  lastHealthCheckTime = now;
  
  try {
    console.log('Performing API health check...');
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const response = await axios.get(`${baseUrl}/auth/health`, { timeout: 5000 });
    return { status: 'success', data: response.data };
  } catch (error) {
    return { 
      status: 'error', 
      message: error.message,
      details: error.response?.data || 'No response data'
    };
  }
};

export default api; 