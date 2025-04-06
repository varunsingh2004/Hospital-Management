import api from './api';
import axios from 'axios';
import { API_BASE_URL } from './api';

const patientAPI = {
  // Standard API calls
  registerPatient: (patientData) => api.post('/patients', patientData),
  getPatients: () => api.get('/patients'),
  getPatientById: (id) => api.get(`/patients/${id}`),
  updatePatient: (id, patientData) => api.put(`/patients/${id}`, patientData),
  deletePatient: (id) => api.delete(`/patients/${id}`),
  searchPatients: (searchParams) => api.get('/patients/search', { params: searchParams }),
  
  // Format date helper function
  formatDate: (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  },
  
  // Helper function to get patient's full name
  getFullName: (patient) => {
    if (!patient) return '';
    return `${patient.firstName || ''} ${patient.lastName || ''}`.trim();
  },
  
  // Direct axios calls for troubleshooting
  testConnection: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/patients`, {
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

export default patientAPI; 