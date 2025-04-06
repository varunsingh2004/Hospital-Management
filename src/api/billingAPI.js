import api from './api';

const billingAPI = {
  // Create new billing record
  createBilling: (billingData) => api.post('/billing', billingData),
  
  // Get all billing records with optional filtering
  getBillings: (filters = {}) => api.get('/billing', { params: filters }),
  
  // Get a specific billing record by ID
  getBillingById: (id) => api.get(`/billing/${id}`),
  
  // Update a billing record
  updateBilling: (id, billingData) => api.put(`/billing/${id}`, billingData),
  
  // Update payment status of a billing record
  updatePaymentStatus: (id, paymentData) => api.patch(`/billing/${id}/payment`, paymentData),
  
  // Delete a billing record
  deleteBilling: (id) => api.delete(`/billing/${id}`),
  
  // Get billing summary statistics
  getBillingSummary: () => api.get('/billing/summary'),
  
  // Get patient billing history
  getPatientBillingHistory: (patientId) => api.get(`/billing/patient/${patientId}`),
  
  // Helper function to format currency
  formatCurrency: (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  },
  
  // Get a list of common medical services with prices
  getCommonServices: () => {
    return [
      { name: 'General Consultation', amount: 50 },
      { name: 'Specialist Consultation', amount: 100 },
      { name: 'Blood Test', amount: 35 },
      { name: 'X-Ray', amount: 75 },
      { name: 'MRI Scan', amount: 350 },
      { name: 'CT Scan', amount: 250 },
      { name: 'Ultrasound', amount: 120 },
      { name: 'ECG', amount: 60 },
      { name: 'Physical Therapy Session', amount: 85 },
      { name: 'Vaccination', amount: 40 },
      { name: 'Minor Surgery', amount: 300 },
      { name: 'Dental Cleaning', amount: 80 },
      { name: 'Emergency Room Visit', amount: 200 }
    ];
  }
};

export default billingAPI; 