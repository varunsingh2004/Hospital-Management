import api from './api';
import axios from 'axios';
import { API_BASE_URL } from './api';

const doctorAPI = {
  registerDoctor: (doctorData) => api.post('/doctors', doctorData),
  getDoctors: () => api.get('/doctors'),
  getDoctorById: (id) => api.get(`/doctors/${id}`),
  updateDoctor: (id, doctorData) => api.put(`/doctors/${id}`, doctorData),
  deleteDoctor: (id) => api.delete(`/doctors/${id}`),
  searchDoctors: (searchParams) => api.get('/doctors/search', { params: searchParams }),
  
  // Direct axios calls for troubleshooting
  testConnection: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/doctors`, {
        timeout: 5000
      });
      return {
        success: true,
        status: response.status,
        message: 'Connection successful',
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        response: error.response?.data
      };
    }
  }
};

export default doctorAPI; 