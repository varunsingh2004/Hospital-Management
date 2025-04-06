import api from './api';

const dashboardAPI = {
  // Get dashboard stats (counts and summary data)
  getDashboardStats: () => api.get('/dashboard/stats'),
  
  // Get appointment data by department
  getAppointmentsByDepartment: () => api.get('/dashboard/appointments-by-department'),
  
  // Get revenue data for the chart
  getRevenueData: () => api.get('/dashboard/revenue'),
  
  // Get patient age distribution data
  getPatientAgeDistribution: () => api.get('/dashboard/patient-age-distribution'),
  
  // Get recent patients
  getRecentPatients: () => api.get('/dashboard/recent-patients'),
  
  // For convenience, fetch all dashboard data in one call
  getAllDashboardData: () => api.get('/dashboard/all')
};

export default dashboardAPI; 