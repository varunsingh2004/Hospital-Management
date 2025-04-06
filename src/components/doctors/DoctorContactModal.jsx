import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';

const DoctorContactModal = ({ isOpen, onClose, doctor, onSave }) => {
  const [formData, setFormData] = useState({
    email: '',
    phoneNumber: '',
    address: '',
    availableDays: [],
    availableTimeSlots: {
      start: '',
      end: ''
    },
    consultationFee: 0
  });
  
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  useEffect(() => {
    if (doctor) {
      setFormData({
        email: doctor.email || '',
        phoneNumber: doctor.phoneNumber || '',
        address: doctor.address || '',
        availableDays: doctor.availableDays || [],
        availableTimeSlots: {
          start: doctor.availableTimeSlots?.start || '09:00',
          end: doctor.availableTimeSlots?.end || '17:00'
        },
        consultationFee: doctor.consultationFee || 0
      });
    }
  }, [doctor]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleTimeChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      availableTimeSlots: {
        ...prev.availableTimeSlots,
        [name]: value
      }
    }));
  };
  
  const handleDayToggle = (day) => {
    setFormData(prev => {
      const availableDays = [...prev.availableDays];
      
      if (availableDays.includes(day)) {
        return {
          ...prev,
          availableDays: availableDays.filter(d => d !== day)
        };
      } else {
        return {
          ...prev,
          availableDays: [...availableDays, day]
        };
      }
    });
  };
  
  const handleSave = () => {
    onSave({
      ...doctor,
      ...formData
    });
    onClose();
  };
  
  if (!doctor) return null;
  
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`Edit Contact Info: Dr. ${doctor.firstName} ${doctor.lastName}`}
      size="md"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <input
            type="text"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
        <textarea
          name="address"
          value={formData.address}
          onChange={handleChange}
          rows="2"
          className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        ></textarea>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Available Days</label>
        <div className="flex flex-wrap gap-2">
          {daysOfWeek.map(day => (
            <button
              key={day}
              type="button"
              onClick={() => handleDayToggle(day)}
              className={`px-3 py-1 text-sm font-medium rounded-full ${
                formData.availableDays.includes(day)
                  ? 'bg-blue-100 text-blue-800 border border-blue-300'
                  : 'bg-gray-100 text-gray-800 border border-gray-300'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
          <input
            type="time"
            name="start"
            value={formData.availableTimeSlots.start}
            onChange={handleTimeChange}
            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
          <input
            type="time"
            name="end"
            value={formData.availableTimeSlots.end}
            onChange={handleTimeChange}
            className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Consultation Fee (₹)</label>
        <input
          type="number"
          name="consultationFee"
          value={formData.consultationFee}
          onChange={handleChange}
          className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>
      
      <div className="flex justify-end space-x-2 mt-6">
        <button
          onClick={onClose}
          className="py-2 px-4 border border-gray-300 rounded shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="py-2 px-4 border border-transparent rounded shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
        >
          Save Changes
        </button>
      </div>
    </Modal>
  );
};

export default DoctorContactModal; 