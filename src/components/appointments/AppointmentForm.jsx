import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import appointmentAPI from '../../api/appointmentAPI';
import doctorAPI from '../../api/doctorAPI';
import { patientAPI } from '../../api';
import { toast } from 'react-toastify';

const AppointmentForm = ({ appointment = null, onSave = null, isEditing = false }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    patient: appointment?.patient || { patientId: '', name: '' },
    doctor: appointment?.doctor || { doctorId: '', name: '' },
    department: appointment?.department || '',
    appointmentDate: appointment?.appointmentDate ? new Date(appointment.appointmentDate).toISOString().split('T')[0] : '',
    startTime: appointment?.startTime || '',
    endTime: appointment?.endTime || '',
    notes: appointment?.notes || '',
    status: appointment?.status || 'Scheduled'
  });

  const [patients, setPatients] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [patientSearchTerm, setPatientSearchTerm] = useState('');

  // Load patients, departments, and doctors on component mount
  useEffect(() => {
    fetchPatients();
    fetchDepartments();
  }, []);

  // When department changes, fetch doctors for that department
  useEffect(() => {
    if (formData.department) {
      fetchDoctorsByDepartment(formData.department);
    } else {
      setDoctors([]);
      setFormData(prev => ({
        ...prev,
        doctor: { doctorId: '', name: '' }
      }));
    }
  }, [formData.department]);

  // When doctor and date change, fetch available time slots
  useEffect(() => {
    if (formData.doctor.doctorId && formData.appointmentDate) {
      fetchAvailableTimeSlots(formData.doctor.doctorId, formData.appointmentDate);
    } else {
      setAvailableTimeSlots([]);
      setFormData(prev => ({
        ...prev,
        startTime: '',
        endTime: ''
      }));
    }
  }, [formData.doctor.doctorId, formData.appointmentDate]);

  // Update endTime when startTime changes
  useEffect(() => {
    if (formData.startTime) {
      const endTime = appointmentAPI.calculateEndTime(formData.startTime);
      setFormData(prev => ({
        ...prev,
        endTime
      }));
    }
  }, [formData.startTime]);

  // Filter patients based on search term
  useEffect(() => {
    if (patientSearchTerm.trim() === '') {
      setFilteredPatients([]);
      return;
    }
    
    const filtered = patients.filter(patient => {
      const searchPattern = patientSearchTerm.toLowerCase();
      const patientName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
      const patientId = patient.patientId.toLowerCase();
      
      return patientName.includes(searchPattern) || patientId.includes(searchPattern);
    });
    
    setFilteredPatients(filtered);
  }, [patientSearchTerm, patients]);

  const fetchPatients = async () => {
    try {
      setLoadingPatients(true);
      const response = await patientAPI.getPatients();
      setPatients(response.data);
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast.error('Failed to load patients');
    } finally {
      setLoadingPatients(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      // Extract unique departments from doctors
      const response = await doctorAPI.getDoctors();
      const allDoctors = response.data;
      const uniqueDepartments = [...new Set(allDoctors.map(doctor => doctor.department))];
      setDepartments(uniqueDepartments);
    } catch (error) {
      console.error('Error fetching departments:', error);
      toast.error('Failed to load departments');
    }
  };

  const fetchDoctorsByDepartment = async (department) => {
    try {
      setLoadingDoctors(true);
      const response = await doctorAPI.getDoctors();
      const filteredDoctors = response.data.filter(doctor => 
        doctor.department === department && doctor.status === 'Active'
      );
      setDoctors(filteredDoctors);
    } catch (error) {
      console.error('Error fetching doctors by department:', error);
      toast.error('Failed to load doctors');
    } finally {
      setLoadingDoctors(false);
    }
  };

  const fetchAvailableTimeSlots = async (doctorId, date) => {
    try {
      setLoadingTimeSlots(true);
      const response = await appointmentAPI.getAvailableTimeSlots(doctorId, date);
      setAvailableTimeSlots(response.data.availableSlots || []);
      
      if (response.data.availableSlots?.length === 0) {
        toast.info(`Dr. ${formData.doctor.name.split('Dr. ')[1] || formData.doctor.name} has no available time slots on this date.`);
      }
    } catch (error) {
      console.error('Error fetching available time slots:', error);
      toast.error('Failed to load available time slots');
    } finally {
      setLoadingTimeSlots(false);
    }
  };

  const handlePatientSearchChange = (e) => {
    setPatientSearchTerm(e.target.value);
  };

  const handlePatientSelect = (patient) => {
    setFormData(prev => ({
      ...prev,
      patient: {
        patientId: patient.patientId,
        name: `${patient.firstName} ${patient.lastName}`,
        phoneNumber: patient.phoneNumber,
        email: patient.email
      }
    }));
    setPatientSearchTerm('');
    setFilteredPatients([]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      if (name.includes('.')) {
        const [parent, child] = name.split('.');
        return {
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value
          }
        };
      }
      return {
        ...prev,
        [name]: value
      };
    });
  };

  const handleDoctorSelect = (e) => {
    const { value } = e.target;
    const selectedDoctor = doctors.find(doctor => doctor._id === value);
    
    if (selectedDoctor) {
      setFormData(prev => ({
        ...prev,
        doctor: {
          doctorId: selectedDoctor.doctorId,
          name: `Dr. ${selectedDoctor.firstName} ${selectedDoctor.lastName}`
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        doctor: { doctorId: '', name: '' }
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      
      // Prepare the formatted appointment data
      const appointmentData = {
        ...formData,
        appointmentDate: new Date(formData.appointmentDate).toISOString()
      };
      
      let response;
      if (isEditing && appointment?._id) {
        // Update existing appointment
        response = await appointmentAPI.updateAppointment(appointment._id, appointmentData);
        toast.success('Appointment updated successfully');
      } else {
        // Create new appointment
        response = await appointmentAPI.createAppointment(appointmentData);
        toast.success('Appointment scheduled successfully');
      }
      
      // Call the onSave callback if provided
      if (onSave) {
        onSave(response.data);
      } else {
        // Navigate to the appointment details or list page
        navigate('/appointments');
      }
    } catch (error) {
      console.error('Error saving appointment:', error);
      toast.error(error.response?.data?.message || 'Failed to save appointment');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    return (
      formData.patient.patientId && 
      formData.patient.name && 
      formData.doctor.doctorId && 
      formData.doctor.name && 
      formData.department && 
      formData.appointmentDate && 
      formData.startTime && 
      formData.endTime
    );
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        {isEditing ? 'Edit Appointment' : 'Schedule New Appointment'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Patient Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Patient <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search patients by ID or name (e.g., PAT001/John Doe)"
              value={patientSearchTerm}
              onChange={handlePatientSearchChange}
              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            
            {/* Show selected patient */}
            {formData.patient.patientId && (
              <div className="mt-2 p-2 bg-blue-50 border border-blue-100 rounded-md">
                <p className="text-sm font-medium text-blue-700">
                  {formData.patient.patientId}/{formData.patient.name}
                </p>
              </div>
            )}
            
            {/* Dropdown for patient search results */}
            {filteredPatients.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm">
                {filteredPatients.map(patient => (
                  <div
                    key={patient._id}
                    onClick={() => handlePatientSelect(patient)}
                    className="cursor-pointer hover:bg-gray-100 py-2 px-3"
                  >
                    <div className="flex justify-between">
                      <span className="font-medium">{patient.patientId}/{patient.firstName} {patient.lastName}</span>
                      <span className="text-gray-500 text-sm">{patient.phoneNumber}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {loadingPatients && (
              <div className="mt-2 text-sm text-gray-500">Loading patients...</div>
            )}
          </div>
        </div>
        
        {/* Department Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Department <span className="text-red-500">*</span>
          </label>
          <select
            name="department"
            value={formData.department}
            onChange={handleChange}
            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">Select Department</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
        
        {/* Doctor Selection (filtered by department) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Doctor <span className="text-red-500">*</span>
          </label>
          <select
            onChange={handleDoctorSelect}
            value={doctors.find(d => d.doctorId === formData.doctor.doctorId)?._id || ''}
            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            disabled={!formData.department || loadingDoctors}
          >
            <option value="">Select Doctor</option>
            {loadingDoctors ? (
              <option value="" disabled>Loading doctors...</option>
            ) : doctors.length === 0 ? (
              <option value="" disabled>No doctors available in this department</option>
            ) : (
              doctors.map(doctor => (
                <option key={doctor._id} value={doctor._id}>
                  {doctor.doctorId}/Dr. {doctor.firstName} {doctor.lastName}
                </option>
              ))
            )}
          </select>
          
          {formData.doctor.doctorId && (
            <div className="mt-2 p-2 bg-blue-50 border border-blue-100 rounded-md">
              <p className="text-sm font-medium text-blue-700">
                {formData.doctor.name}
              </p>
            </div>
          )}
        </div>
        
        {/* Appointment Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Appointment Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="appointmentDate"
            value={formData.appointmentDate}
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]} // Can't select past dates
            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        
        {/* Time Slot Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Time Slot <span className="text-red-500">*</span>
          </label>
          <select
            name="startTime"
            value={formData.startTime}
            onChange={handleChange}
            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            disabled={!formData.doctor.doctorId || !formData.appointmentDate || loadingTimeSlots}
          >
            <option value="">Select Time</option>
            {loadingTimeSlots ? (
              <option value="" disabled>Loading available times...</option>
            ) : availableTimeSlots.length === 0 ? (
              <option value="" disabled>No available time slots</option>
            ) : (
              availableTimeSlots.map(time => (
                <option key={time} value={time}>
                  {appointmentAPI.formatTime(time)}
                </option>
              ))
            )}
          </select>
          
          {formData.startTime && formData.endTime && (
            <div className="mt-2 p-2 bg-green-50 border border-green-100 rounded-md">
              <p className="text-sm font-medium text-green-700">
                Appointment time: {appointmentAPI.formatTime(formData.startTime)} - {appointmentAPI.formatTime(formData.endTime)}
              </p>
            </div>
          )}
        </div>
        
        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="3"
            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Add any additional information about the appointment"
          ></textarea>
        </div>
        
        {/* Status (only for editing) */}
        {isEditing && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
              <option value="No-Show">No-Show</option>
            </select>
            
            {formData.status && (
              <div className={`mt-2 p-2 rounded-md ${
                formData.status === 'Scheduled' ? 'bg-blue-50 border border-blue-100' :
                formData.status === 'Completed' ? 'bg-green-50 border border-green-100' :
                formData.status === 'Cancelled' ? 'bg-red-50 border border-red-100' :
                formData.status === 'No-Show' ? 'bg-yellow-50 border border-yellow-100' :
                'bg-gray-50 border border-gray-100'
              }`}>
                <p className={`text-sm font-medium ${
                  formData.status === 'Scheduled' ? 'text-blue-700' :
                  formData.status === 'Completed' ? 'text-green-700' :
                  formData.status === 'Cancelled' ? 'text-red-700' :
                  formData.status === 'No-Show' ? 'text-yellow-700' :
                  'text-gray-700'
                }`}>
                  {formData.status === 'Scheduled' && 'This appointment is scheduled and waiting to be completed.'}
                  {formData.status === 'Completed' && 'This appointment has been marked as completed.'}
                  {formData.status === 'Cancelled' && 'This appointment has been cancelled.'}
                  {formData.status === 'No-Show' && 'The patient did not show up for this appointment.'}
                </p>
              </div>
            )}
          </div>
        )}
        
        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <button
            type="button"
            onClick={() => navigate('/appointments')}
            className="mr-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !validateForm()}
            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              loading || !validateForm() 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            } focus:outline-none`}
          >
            {loading ? 'Saving...' : isEditing ? 'Update Appointment' : 'Schedule Appointment'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AppointmentForm; 