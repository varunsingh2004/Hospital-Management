import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import appointmentAPI from '../api/appointmentAPI';
import { toast } from 'react-toastify';

const AppointmentDetails = () => {
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

  const handleUpdateStatus = async (newStatus) => {
    try {
      await appointmentAPI.updateAppointment(id, { status: newStatus });
      
      // Update local state
      setAppointment(prev => ({
        ...prev,
        status: newStatus
      }));
      
      toast.success(`Appointment ${newStatus.toLowerCase()} successfully`);
    } catch (error) {
      console.error('Error updating appointment status:', error);
      toast.error('Failed to update appointment status');
    }
  };

  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'No-Show':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

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

  if (!appointment) {
    return (
      <div className="text-center py-16">
        <h3 className="mt-2 text-lg font-medium text-gray-900">Appointment not found</h3>
        <div className="mt-6">
          <button 
            onClick={() => navigate('/appointments')} 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
          >
            Back to Appointments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">Appointment Details</h1>
        <div className="flex space-x-2">
          <Link
            to="/appointments"
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded text-sm"
          >
            Back to List
          </Link>
          {appointment.status === 'Scheduled' && (
            <Link
              to={`/appointments/${id}/edit`}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
            >
              Edit Appointment
            </Link>
          )}
        </div>
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Appointment {appointment.appointmentId}
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              {formatDate(appointment.appointmentDate)}
            </p>
          </div>
          <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full border ${getStatusBadgeClass(appointment.status)}`}>
            {appointment.status}
          </span>
        </div>
        
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Patient</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {appointment.patient.name}
                <span className="text-xs text-gray-500 ml-2">({appointment.patient.patientId})</span>
              </dd>
            </div>
            
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Doctor</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {appointment.doctor.name}
                <span className="text-xs text-gray-500 ml-2">({appointment.doctor.doctorId})</span>
              </dd>
            </div>
            
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Department</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {appointment.department}
              </dd>
            </div>
            
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Date and Time</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {formatDate(appointment.appointmentDate)}
                <div className="mt-1 text-blue-600 font-medium">
                  {appointmentAPI.formatTime(appointment.startTime)} - {appointmentAPI.formatTime(appointment.endTime)}
                </div>
              </dd>
            </div>
            
            {appointment.notes && (
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Notes</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {appointment.notes}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>
      
      {/* Status update buttons */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Update Appointment Status
          </h3>
          <div className="mt-5 flex flex-wrap gap-3">
            {appointment.status !== 'Scheduled' && (
              <button
                onClick={() => handleUpdateStatus('Scheduled')}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Mark as Scheduled
              </button>
            )}
            {appointment.status !== 'Completed' && (
              <button
                onClick={() => handleUpdateStatus('Completed')}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
              >
                Mark as Completed
              </button>
            )}
            {appointment.status !== 'Cancelled' && (
              <button
                onClick={() => handleUpdateStatus('Cancelled')}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                Mark as Cancelled
              </button>
            )}
            {appointment.status !== 'No-Show' && (
              <button
                onClick={() => handleUpdateStatus('No-Show')}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700"
              >
                Mark as No-Show
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetails; 