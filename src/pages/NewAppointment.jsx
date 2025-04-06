import React from 'react';
import AppointmentForm from '../components/appointments/AppointmentForm';

const NewAppointment = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-800">Schedule New Appointment</h1>
      <AppointmentForm />
    </div>
  );
};

export default NewAppointment; 