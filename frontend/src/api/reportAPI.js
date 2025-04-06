import api from './api';

const reportAPI = {
  // Create new medical report
  createReport: (reportData) => api.post('/reports', reportData),
  
  // Get all medical reports with optional filtering
  getReports: (filters = {}) => api.get('/reports', { params: filters }),
  
  // Get a specific medical report by ID
  getReportById: (id) => api.get(`/reports/${id}`),
  
  // Update a medical report
  updateReport: (id, reportData) => api.put(`/reports/${id}`, reportData),
  
  // Delete a medical report
  deleteReport: (id) => api.delete(`/reports/${id}`),
  
  // Get all reports for a specific patient
  getPatientReports: (patientId) => api.get(`/reports/patient/${patientId}`),
  
  // Get all reports by a specific doctor
  getDoctorReports: (doctorId) => api.get(`/reports/doctor/${doctorId}`),
  
  // Update report status
  updateReportStatus: (id, status) => api.patch(`/reports/${id}/status`, { status }),
  
  // Helper function to format date
  formatDate: (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  },
  
  // Get common test types for convenience
  getCommonTestTypes: () => {
    return [
      { name: 'Complete Blood Count (CBC)' },
      { name: 'Basic Metabolic Panel (BMP)' },
      { name: 'Comprehensive Metabolic Panel (CMP)' },
      { name: 'Lipid Panel' },
      { name: 'Liver Function Tests' },
      { name: 'Thyroid Function Tests' },
      { name: 'Hemoglobin A1C' },
      { name: 'Urinalysis' },
      { name: 'Electrocardiogram (ECG/EKG)' },
      { name: 'Chest X-ray' },
      { name: 'MRI' },
      { name: 'CT Scan' },
      { name: 'Ultrasound' }
    ];
  },
  
  // Get common medication routes for convenience
  getCommonMedications: () => {
    return [
      { name: 'Acetaminophen (Tylenol)' },
      { name: 'Ibuprofen (Advil, Motrin)' },
      { name: 'Amoxicillin' },
      { name: 'Azithromycin' },
      { name: 'Lisinopril' },
      { name: 'Atorvastatin (Lipitor)' },
      { name: 'Metformin' },
      { name: 'Levothyroxine (Synthroid)' },
      { name: 'Albuterol' },
      { name: 'Omeprazole (Prilosec)' }
    ];
  },
  
  // Get common frequency options for medications
  getCommonFrequencies: () => {
    return [
      'Once daily',
      'Twice daily',
      'Three times daily',
      'Four times daily',
      'Every 4 hours',
      'Every 6 hours',
      'Every 8 hours',
      'Every 12 hours',
      'As needed',
      'Weekly',
      'Monthly'
    ];
  }
};

export default reportAPI; 