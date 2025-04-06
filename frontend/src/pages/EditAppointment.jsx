import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppointmentForm from '../components/appointments/AppointmentForm';
import appointmentAPI from '../api/appointmentAPI';
import { toast } from 'react-toastify';

const EditAppointment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        setLoading(true);
        const response = await appointmentAPI.getAppointmentById(id);
        setAppointment(response.data);
      } catch (err) {
        console.error('Error fetching appointment:', err);
        setError('Failed to load appointment details. Please try again later.');
        toast.error('Could not load appointment details');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        {error}
        <div className="mt-4">
          <button 
            onClick={() => navigate('/appointments')} 
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Back to Appointments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-800">Edit Appointment</h1>
      {appointment && (
        <AppointmentForm 
          appointment={appointment} 
          isEditing={true} 
          onSave={() => {
            toast.success('Appointment updated successfully');
            navigate('/appointments');
          }}
        />
      )}
    </div>
  );
};

export default EditAppointment; 