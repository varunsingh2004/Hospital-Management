import { useState, useEffect } from 'react';
import doctorAPI from '../api/doctorAPI';
import DoctorCard from '../components/doctors/DoctorCard';
import DoctorStatusModal from '../components/doctors/DoctorStatusModal';
import DoctorContactModal from '../components/doctors/DoctorContactModal';
import AddDoctorModal from '../components/doctors/AddDoctorModal';
import { toast } from 'react-toastify';

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterSpecialization, setFilterSpecialization] = useState('');
  
  // Modal states
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [addDoctorModalOpen, setAddDoctorModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  // Departments and specializations for filtering
  const departments = ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Gynecology', 'Dermatology', 'Ophthalmology', 'ENT', 'General Surgery', 'Internal Medicine'];
  const specializations = ['Cardiac Surgery', 'Neurosurgery', 'Spine Surgery', 'Pediatric Cardiology', 'Obstetrics', 'Cosmetic Dermatology', 'Retina Specialist', 'ENT Surgery', 'Laparoscopic Surgery', 'Diabetology'];

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await doctorAPI.getDoctors();
      if (response.data && response.data.length > 0) {
        setDoctors(response.data);
      } else {
        setError('No doctors found. Please contact the administrator.');
      }
    } catch (err) {
      console.error('Error fetching doctors:', err);
      setError('Failed to load doctors. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleUpdateStatus = async (updatedDoctor) => {
    try {
      setLoading(true);
      await doctorAPI.updateDoctor(updatedDoctor._id, { status: updatedDoctor.status });
      
      // Update local state
      setDoctors(doctors.map(doctor => 
        doctor._id === updatedDoctor._id ? { ...doctor, status: updatedDoctor.status } : doctor
      ));
      
      toast.success(`Dr. ${updatedDoctor.firstName} ${updatedDoctor.lastName}'s status updated successfully`);
    } catch (error) {
      console.error('Error updating doctor status:', error);
      toast.error('Failed to update doctor status');
    } finally {
      setLoading(false);
      setStatusModalOpen(false);
    }
  };

  const handleUpdateContact = async (updatedDoctor) => {
    try {
      setLoading(true);
      
      const updateData = {
        email: updatedDoctor.email,
        phoneNumber: updatedDoctor.phoneNumber,
        address: updatedDoctor.address,
        availableDays: updatedDoctor.availableDays,
        availableTimeSlots: updatedDoctor.availableTimeSlots,
        consultationFee: updatedDoctor.consultationFee
      };
      
      await doctorAPI.updateDoctor(updatedDoctor._id, updateData);
      
      // Update local state
      setDoctors(doctors.map(doctor => 
        doctor._id === updatedDoctor._id ? { ...doctor, ...updateData } : doctor
      ));
      
      toast.success(`Dr. ${updatedDoctor.firstName} ${updatedDoctor.lastName}'s information updated successfully`);
    } catch (error) {
      console.error('Error updating doctor information:', error);
      toast.error('Failed to update doctor information');
    } finally {
      setLoading(false);
      setContactModalOpen(false);
    }
  };

  const handleDeleteDoctor = async (doctorId) => {
    try {
      setLoading(true);
      await doctorAPI.deleteDoctor(doctorId);
      
      // Update local state
      setDoctors(doctors.filter(doctor => doctor._id !== doctorId));
      
      toast.success('Doctor deleted successfully');
    } catch (error) {
      console.error('Error deleting doctor:', error);
      toast.error('Failed to delete doctor');
    } finally {
      setLoading(false);
    }
  };

  const openStatusModal = (doctor) => {
    setSelectedDoctor(doctor);
    setStatusModalOpen(true);
  };

  const openContactModal = (doctor) => {
    setSelectedDoctor(doctor);
    setContactModalOpen(true);
  };

  const handleAddDoctor = async (newDoctorData) => {
    try {
      setLoading(true);
      const response = await doctorAPI.registerDoctor(newDoctorData);
      
      // Update local state with the newly created doctor
      setDoctors([...doctors, response.data]);
      
      toast.success(`Dr. ${newDoctorData.firstName} ${newDoctorData.lastName} added successfully`);
    } catch (error) {
      console.error('Error adding doctor:', error);
      toast.error('Failed to add doctor');
    } finally {
      setLoading(false);
      setAddDoctorModalOpen(false);
    }
  };

  const filteredDoctors = doctors.filter(doctor => {
    const fullName = `${doctor.firstName} ${doctor.lastName}`.toLowerCase();
    const searchMatch = searchTerm === '' || 
                       fullName.includes(searchTerm.toLowerCase()) || 
                       doctor.doctorId?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const departmentMatch = filterDepartment === '' || doctor.department === filterDepartment;
    const specializationMatch = filterSpecialization === '' || doctor.specialization === filterSpecialization;
    
    return searchMatch && departmentMatch && specializationMatch;
  });

  if (loading && doctors.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error && doctors.length === 0) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">Our Doctors</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setAddDoctorModalOpen(true)}
            className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded shadow-sm"
          >
            Add Doctor
          </button>
          <button
            onClick={fetchDoctors}
            className="bg-blue-100 hover:bg-blue-200 text-blue-800 text-sm px-3 py-1 rounded border border-blue-300"
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              placeholder="Search by name or ID"
              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          
          {/* Department filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          
          {/* Specialization filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
            <select
              value={filterSpecialization}
              onChange={(e) => setFilterSpecialization(e.target.value)}
              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">All Specializations</option>
              {specializations.map((spec) => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>
        </div>
        
        {filteredDoctors.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No doctors found</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your search criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDoctors.map((doctor) => (
              <DoctorCard 
                key={doctor._id} 
                doctor={doctor} 
                onEditStatus={openStatusModal}
                onEditContact={openContactModal}
                onDelete={handleDeleteDoctor}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Status Modal */}
      <DoctorStatusModal 
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        doctor={selectedDoctor}
        onSave={handleUpdateStatus}
      />
      
      {/* Contact Modal */}
      <DoctorContactModal 
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
        doctor={selectedDoctor}
        onSave={handleUpdateContact}
      />
      
      {/* Add Doctor Modal */}
      <AddDoctorModal
        isOpen={addDoctorModalOpen}
        onClose={() => setAddDoctorModalOpen(false)}
        onSave={handleAddDoctor}
      />
    </div>
  );
};

export default Doctors; 