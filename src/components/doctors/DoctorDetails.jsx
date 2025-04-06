import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import doctorAPI from '../../api/doctorAPI';

const DoctorDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDoctorDetails();
  }, [id]);

  const fetchDoctorDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await doctorAPI.getDoctorById(id);
      setDoctor(response.data);
    } catch (err) {
      console.error('Error fetching doctor details:', err);
      setError('Failed to load doctor details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = () => {
    navigate(`/appointments/schedule/${id}`);
  };

  const formatDateString = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        {error || 'Doctor not found'}
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {/* Header with background and photo */}
      <div className="relative">
        <div className="h-48 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
        <div className="absolute top-32 left-10 transform">
          <img 
            src={doctor.photo || '/images/doctor-placeholder.png'} 
            alt={`Dr. ${doctor.firstName} ${doctor.lastName}`} 
            className="w-32 h-32 rounded-full border-4 border-white object-cover bg-white"
          />
        </div>
      </div>
      
      {/* Main content */}
      <div className="pt-20 px-8 pb-8">
        <div className="flex flex-wrap justify-between items-start mb-8">
          <div>
            <div className="text-xs text-gray-500 mb-1">{doctor.doctorId}</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Dr. {doctor.firstName} {doctor.lastName}</h1>
            <p className="text-gray-600">{doctor.designation} - {doctor.department}</p>
          </div>
          
          <div className="flex space-x-2 mt-4 sm:mt-0">
            <button
              onClick={() => navigate(-1)}
              className="py-2 px-4 border border-gray-300 rounded shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back
            </button>
            <button
              onClick={handleBookAppointment}
              className="py-2 px-4 border border-transparent rounded shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Book Appointment
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left column - Bio and contact */}
          <div className="md:col-span-2">
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Biography</h2>
              <p className="text-gray-700">{doctor.bio || 'No biography available.'}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h2>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="flex-shrink-0 text-gray-500 w-20">Email</span>
                    <span className="text-gray-900">{doctor.email}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 text-gray-500 w-20">Phone</span>
                    <span className="text-gray-900">{doctor.phoneNumber}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 text-gray-500 w-20">Address</span>
                    <span className="text-gray-900">{doctor.address}</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Schedule</h2>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="flex-shrink-0 text-gray-500 w-24">Available Days</span>
                    <span className="text-gray-900">{doctor.availableDays?.join(', ') || 'N/A'}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 text-gray-500 w-24">Hours</span>
                    <span className="text-gray-900">
                      {doctor.availableTimeSlots ? `${doctor.availableTimeSlots.start} to ${doctor.availableTimeSlots.end}` : 'N/A'}
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 text-gray-500 w-24">Fee</span>
                    <span className="text-gray-900">₹{doctor.consultationFee}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Right column - Professional info */}
          <div>
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h2>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="flex-shrink-0 text-gray-500 w-32">Department</span>
                  <span className="text-gray-900">{doctor.department}</span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 text-gray-500 w-32">Specialization</span>
                  <span className="text-gray-900">{doctor.specialization}</span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 text-gray-500 w-32">Qualification</span>
                  <span className="text-gray-900">{doctor.qualification}</span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 text-gray-500 w-32">Experience</span>
                  <span className="text-gray-900">{doctor.experience} years</span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 text-gray-500 w-32">Success Rate</span>
                  <span className="text-gray-900">{doctor.successfulTreatments}+ successful treatments</span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 text-gray-500 w-32">Joined</span>
                  <span className="text-gray-900">{formatDateString(doctor.joiningDate)}</span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 text-gray-500 w-32">Status</span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    doctor.status === 'Active' ? 'bg-green-100 text-green-800' : 
                    doctor.status === 'On Leave' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-red-100 text-red-800'
                  }`}>
                    {doctor.status}
                  </span>
                </li>
              </ul>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Social Profiles</h2>
              {doctor.socialProfiles ? (
                <div className="flex space-x-3">
                  {doctor.socialProfiles.website && (
                    <a href={doctor.socialProfiles.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                      </svg>
                    </a>
                  )}
                  {doctor.socialProfiles.linkedin && (
                    <a href={doctor.socialProfiles.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:text-blue-900">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                      </svg>
                    </a>
                  )}
                  {doctor.socialProfiles.twitter && (
                    <a href={doctor.socialProfiles.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-600">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
                      </svg>
                    </a>
                  )}
                  {doctor.socialProfiles.facebook && (
                    <a href={doctor.socialProfiles.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5 3.66 9.15 8.44 9.9v-7H7.9v-2.9h2.54V9.85c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.45 2.9h-2.33v7a10 10 0 0 0 8.44-9.9c0-5.53-4.5-10.02-10-10.02z" />
                      </svg>
                    </a>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">No social profiles available.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDetails; 