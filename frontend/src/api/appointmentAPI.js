import api from './api';

const appointmentAPI = {
  // Create new appointment
  createAppointment: (appointmentData) => api.post('/appointments', appointmentData),
  
  // Get all appointments with optional filtering
  getAppointments: (filters = {}) => api.get('/appointments', { params: filters }),
  
  // Get appointment by ID
  getAppointmentById: (id) => api.get(`/appointments/${id}`),
  
  // Update appointment
  updateAppointment: (id, appointmentData) => api.put(`/appointments/${id}`, appointmentData),
  
  // Delete appointment
  deleteAppointment: (id) => api.delete(`/appointments/${id}`),
  
  // Get available time slots for a doctor on a specific date
  getAvailableTimeSlots: (doctorId, date) => 
    api.get('/appointments/available-slots', { 
      params: { doctorId, date } 
    }),
    
  // Helper function to format time in 12-hour format with AM/PM
  formatTime: (time24h) => {
    const [hours, minutes] = time24h.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12; // Convert 0 to 12 for 12 AM
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
  },
  
  // Calculate end time (30 minutes from start time)
  calculateEndTime: (startTime) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    
    let newMinutes = minutes + 30;
    let newHours = hours;
    
    if (newMinutes >= 60) {
      newMinutes -= 60;
      newHours += 1;
    }
    
    if (newHours >= 24) {
      newHours -= 24;
    }
    
    return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
  }
};

export default appointmentAPI; 