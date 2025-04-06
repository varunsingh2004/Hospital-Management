import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import billingAPI from '../api/billingAPI';
import { patientAPI } from '../api';
import doctorAPI from '../api/doctorAPI';
import { toast } from 'react-toastify';

const NewBilling = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    patientId: '',
    patientName: '',
    doctorId: '',
    doctorName: '',
    services: [],
    totalAmount: 0,
    paymentMethod: 'cash',
    paymentStatus: 'pending',
    notes: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [patientSearchTerm, setPatientSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  
  const [doctors, setDoctors] = useState([]);
  const [patientDoctors, setPatientDoctors] = useState([]);
  
  const [newService, setNewService] = useState({ name: '', price: '', quantity: 1 });
  const [commonServices, setCommonServices] = useState([]);
  
  // Load patients and common services on component mount
  useEffect(() => {
    fetchPatients();
    
    // Convert common services from billingAPI to match our schema
    const services = billingAPI.getCommonServices().map(service => ({
      name: service.name,
      price: service.amount,
      quantity: 1
    }));
    setCommonServices(services);
  }, []);
  
  // Fetch patient's doctors when a patient is selected
  useEffect(() => {
    if (selectedPatient) {
      fetchPatientDoctors(selectedPatient._id);
    }
  }, [selectedPatient]);
  
  // Calculate total amount when services change
  useEffect(() => {
    if (formData.services.length > 0) {
      const total = formData.services.reduce((sum, service) => sum + (service.price * (service.quantity || 1)), 0);
      setFormData(prev => ({ ...prev, totalAmount: total }));
    } else {
      setFormData(prev => ({ ...prev, totalAmount: 0 }));
    }
  }, [formData.services]);
  
  // Filter patients based on search term
  useEffect(() => {
    if (patientSearchTerm.trim() === '') {
      setFilteredPatients([]);
      return;
    }
    
    const filtered = patients.filter(patient => {
      const searchPattern = patientSearchTerm.toLowerCase();
      const patientName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
      const patientId = patient._id.toLowerCase();
      
      return patientName.includes(searchPattern) || patientId.includes(searchPattern);
    });
    
    setFilteredPatients(filtered.slice(0, 5)); // Limit to 5 results for performance
  }, [patientSearchTerm, patients]);
  
  const fetchPatients = async () => {
    try {
      const response = await patientAPI.getPatients();
      setPatients(response.data);
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast.error('Failed to load patients');
    }
  };
  
  const fetchPatientDoctors = async (patientId) => {
    try {
      // First, fetch all doctors
      const allDoctorsResponse = await doctorAPI.getDoctors();
      setDoctors(allDoctorsResponse.data);
      
      // Then, find appointments for this patient to get their doctors
      // This is a simplified approach - in a real app, you might have a dedicated API endpoint
      // const appointmentsResponse = await appointmentAPI.getAppointments({ patientId });
      // const patientDoctorIds = [...new Set(appointmentsResponse.data.map(app => app.doctor.doctorId))];
      
      // For now, we'll just use all active doctors
      const activeDoctors = allDoctorsResponse.data.filter(doc => doc.status === 'Active');
      setPatientDoctors(activeDoctors);
    } catch (error) {
      console.error('Error fetching patient doctors:', error);
      toast.error('Failed to load doctors');
    }
  };
  
  const handlePatientSearchChange = (e) => {
    setPatientSearchTerm(e.target.value);
  };
  
  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    setFormData(prev => ({
      ...prev,
      patientId: patient._id,
      patientName: `${patient.firstName} ${patient.lastName}`
    }));
    setPatientSearchTerm('');
    setFilteredPatients([]);
  };
  
  const handleDoctorSelect = (e) => {
    const selectedDoctorId = e.target.value;
    const doctor = doctors.find(doc => doc._id === selectedDoctorId);
    
    if (doctor) {
      setFormData(prev => ({
        ...prev,
        doctorId: doctor._id,
        doctorName: `Dr. ${doctor.firstName} ${doctor.lastName}`
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        doctorId: '',
        doctorName: ''
      }));
    }
  };
  
  const handleServiceChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'price') {
      setNewService(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0
      }));
    } else if (name === 'quantity') {
      setNewService(prev => ({
        ...prev,
        [name]: Math.max(1, parseInt(value) || 1)
      }));
    } else {
      setNewService(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handleAddService = () => {
    if (!newService.name || !newService.price) {
      toast.error('Service name and price are required');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      services: [...prev.services, { ...newService }]
    }));
    
    setNewService({ name: '', price: '', quantity: 1 });
  };
  
  const handleCommonServiceSelect = (service) => {
    setFormData(prev => ({
      ...prev,
      services: [...prev.services, { ...service }]
    }));
  };
  
  const handleRemoveService = (index) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }));
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      setLoading(true);
      
      // Create issue date and due date
      const issueDate = new Date();
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30); // 30 days due date
      
      const billingData = {
        ...formData,
        issueDate,
        dueDate,
        paidDate: formData.paymentStatus === 'paid' ? new Date() : null
      };
      
      const response = await billingAPI.createBilling(billingData);
      toast.success('Invoice created successfully');
      navigate(`/billing/${response.data._id}`);
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast.error(error.response?.data?.message || 'Failed to create invoice');
    } finally {
      setLoading(false);
    }
  };
  
  const validateForm = () => {
    return (
      formData.patientId && 
      formData.patientName && 
      formData.doctorId && 
      formData.doctorName && 
      formData.services.length > 0
    );
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-800">Create New Invoice</h1>
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Patient <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search patients by ID or name"
                value={patientSearchTerm}
                onChange={handlePatientSearchChange}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              
              {/* Show selected patient */}
              {formData.patientId && (
                <div className="mt-2 p-2 bg-blue-50 border border-blue-100 rounded-md">
                  <p className="text-sm font-medium text-blue-700">
                    {formData.patientName}
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
                        <span className="font-medium">{patient.firstName} {patient.lastName}</span>
                        <span className="text-gray-500 text-sm">{patient.contactNumber}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Doctor Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Doctor <span className="text-red-500">*</span>
            </label>
            <select
              onChange={handleDoctorSelect}
              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              disabled={!formData.patientId}
            >
              <option value="">Select Doctor</option>
              {patientDoctors.length === 0 ? (
                <option value="" disabled>No doctors available</option>
              ) : (
                patientDoctors.map(doctor => (
                  <option key={doctor._id} value={doctor._id}>
                    Dr. {doctor.firstName} {doctor.lastName} ({doctor.specialization})
                  </option>
                ))
              )}
            </select>
            
            {formData.doctorId && (
              <div className="mt-2 p-2 bg-blue-50 border border-blue-100 rounded-md">
                <p className="text-sm font-medium text-blue-700">
                  {formData.doctorName}
                </p>
              </div>
            )}
          </div>
          
          {/* Services */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Services <span className="text-red-500">*</span>
            </label>
            
            {/* Current Services */}
            {formData.services.length > 0 && (
              <div className="mb-4">
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Added Services</h4>
                  <ul className="divide-y divide-gray-200">
                    {formData.services.map((service, index) => (
                      <li key={index} className="py-2 flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{service.name}</p>
                          <p className="text-xs text-gray-500">Qty: {service.quantity || 1} x {billingAPI.formatCurrency(service.price)}</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="text-sm text-gray-600">{billingAPI.formatCurrency(service.price * (service.quantity || 1))}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveService(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 flex justify-between border-t border-gray-200 pt-3">
                    <span className="text-sm font-medium text-gray-700">Total:</span>
                    <span className="text-sm font-bold text-gray-900">{billingAPI.formatCurrency(formData.totalAmount)}</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Add New Service */}
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                name="name"
                value={newService.name}
                onChange={handleServiceChange}
                placeholder="Service name"
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <input
                type="number"
                name="price"
                value={newService.price}
                onChange={handleServiceChange}
                placeholder="Price"
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <input
                type="number"
                name="quantity"
                value={newService.quantity}
                onChange={handleServiceChange}
                placeholder="Qty"
                min="1"
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <button
              type="button"
              onClick={handleAddService}
              className="mt-2 bg-blue-100 hover:bg-blue-200 text-blue-800 px-4 py-2 rounded text-sm"
            >
              Add Service
            </button>
            
            {/* Common Services */}
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Common Services</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {commonServices.map((service, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleCommonServiceSelect(service)}
                    className="text-left p-2 border border-gray-200 rounded-md hover:bg-gray-50"
                  >
                    <p className="text-sm font-medium text-gray-900">{service.name}</p>
                    <p className="text-xs text-gray-500">{billingAPI.formatCurrency(service.price)}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Payment Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Status
              </label>
              <select
                name="paymentStatus"
                value={formData.paymentStatus}
                onChange={handleChange}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method
              </label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="cash">Cash</option>
                <option value="credit card">Credit Card</option>
                <option value="debit card">Debit Card</option>
                <option value="insurance">Insurance</option>
                <option value="bank transfer">Bank Transfer</option>
                <option value="check">Check</option>
                <option value="other">Other</option>
              </select>
            </div>
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
              placeholder="Add any additional notes about this invoice"
            ></textarea>
          </div>
          
          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={() => navigate('/billing')}
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
              {loading ? 'Creating...' : 'Create Invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewBilling; 