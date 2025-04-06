import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';

const DoctorStatusModal = ({ isOpen, onClose, doctor, onSave }) => {
  const [status, setStatus] = useState('');
  
  useEffect(() => {
    if (doctor) {
      setStatus(doctor.status || 'Active');
    }
  }, [doctor]);
  
  const handleSave = () => {
    onSave({ ...doctor, status });
    onClose();
  };
  
  if (!doctor) return null;
  
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`Update Status: Dr. ${doctor.firstName} ${doctor.lastName}`}
      size="sm"
    >
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        >
          <option value="Active">Active</option>
          <option value="On Leave">On Leave</option>
          <option value="Terminated">Terminated</option>
        </select>
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

export default DoctorStatusModal; 