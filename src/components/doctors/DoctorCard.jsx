import React from 'react';
import { useNavigate } from 'react-router-dom';

const DoctorCard = ({ doctor, onDelete, onEditStatus, onEditContact }) => {
  const navigate = useNavigate();
  
  const {
    _id,
    doctorId,
    firstName,
    lastName,
    photo,
    designation,
    department,
    specialization,
    qualification,
    experience,
    successfulTreatments,
    consultationFee,
    rating,
    reviewCount,
    status
  } = doctor;

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'On Leave':
        return 'bg-yellow-100 text-yellow-800';
      case 'Terminated':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewDetails = () => {
    navigate(`/doctors/view/${_id}`);
  };

  const handleBookAppointment = () => {
    navigate(`/appointments/schedule/${_id}`);
  };

  const handleEditStatus = () => {
    onEditStatus(doctor);
  };

  const handleEditContact = () => {
    onEditContact(doctor);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete Dr. ${firstName} ${lastName}?`)) {
      onDelete(_id);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <svg key={`full-${i}`} className="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 24 24">
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      );
    }
    
    // Add half star if needed
    if (hasHalfStar) {
      stars.push(
        <svg key="half" className="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 24 24">
          <defs>
            <linearGradient id="halfGrad">
              <stop offset="50%" stopColor="#EAB308" />
              <stop offset="50%" stopColor="#D1D5DB" />
            </linearGradient>
          </defs>
          <path fill="url(#halfGrad)" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      );
    }
    
    // Add empty stars
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <svg key={`empty-${i}`} className="w-4 h-4 text-gray-300 fill-current" viewBox="0 0 24 24">
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      );
    }
    
    return stars;
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
      {/* Card Header - Photo and Status */}
      <div className="relative">
        <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
        <div className="absolute bottom-0 left-0 w-full transform translate-y-1/2 flex justify-center">
          <img 
            src={photo || '/images/doctor-placeholder.png'} 
            alt={`Dr. ${firstName} ${lastName}`} 
            className="w-24 h-24 rounded-full border-4 border-white object-cover"
          />
        </div>
        <div className="absolute top-4 right-4 flex space-x-1">
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(status)}`}>
            {status}
          </span>
          <button 
            onClick={handleEditStatus}
            className="p-1 bg-white rounded-full shadow hover:bg-gray-100" 
            title="Edit Status"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Card Body */}
      <div className="pt-16 pb-4 px-6">
        {/* Doctor ID */}
        <div className="text-xs text-gray-500 text-center mb-1">{doctorId}</div>
        
        {/* Name and Title */}
        <h3 className="text-lg font-bold text-center text-gray-900">Dr. {firstName} {lastName}</h3>
        <p className="text-sm text-center text-gray-600 mb-4">{designation}</p>
        
        {/* Rating */}
        <div className="flex justify-center items-center mb-4">
          <div className="flex">
            {renderStars(rating)}
          </div>
          <span className="text-sm text-gray-600 ml-1">({reviewCount})</span>
        </div>
        
        {/* Divider */}
        <hr className="my-3" />
        
        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 text-sm mb-4">
          <div>
            <p className="text-gray-500">Department</p>
            <p className="font-medium text-gray-800">{department}</p>
          </div>
          <div>
            <p className="text-gray-500">Specialization</p>
            <p className="font-medium text-gray-800">{specialization}</p>
          </div>
          <div>
            <p className="text-gray-500">Experience</p>
            <p className="font-medium text-gray-800">{experience} years</p>
          </div>
          <div>
            <p className="text-gray-500">Treatments</p>
            <p className="font-medium text-gray-800">{successfulTreatments}+</p>
          </div>
          <div>
            <p className="text-gray-500">Qualification</p>
            <p className="font-medium text-gray-800">{qualification}</p>
          </div>
          <div>
            <p className="text-gray-500">Fee</p>
            <p className="font-medium text-gray-800">₹{consultationFee}</p>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex flex-wrap gap-2 mt-6">
          <button
            onClick={handleViewDetails}
            className="flex-1 py-2 px-3 border border-transparent rounded shadow-sm text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none"
          >
            View Profile
          </button>
          <button
            onClick={handleBookAppointment}
            className="flex-1 py-2 px-3 border border-transparent rounded shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
          >
            Book
          </button>
        </div>

        {/* Admin Actions */}
        <div className="flex gap-2 mt-2">
          <button
            onClick={handleEditContact}
            className="flex-1 py-2 px-3 border border-gray-300 rounded shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
          >
            Edit Info
          </button>
          <button
            onClick={handleDelete}
            className="flex-1 py-2 px-3 border border-transparent rounded shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorCard; 