import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import doctorAPI from '../../api/doctorAPI';

const AddDoctorModal = ({ isOpen, onClose, onSave }) => {
  const [nextDoctorNumber, setNextDoctorNumber] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    doctorId: `DOC${nextDoctorNumber.toString().padStart(3, '0')}`,
    gender: 'Male',
    dateOfBirth: '',
    email: '',
    phoneNumber: '',
    designation: 'Consultant',
    department: 'Cardiology',
    specialization: 'Cardiac Surgery',
    qualification: '',
    experience: 0,
    successfulTreatments: 0,
    availableDays: ['Monday', 'Wednesday', 'Friday'],
    availableTimeSlots: {
      start: '09:00',
      end: '17:00'
    },
    consultationFee: 1000,
    bio: '',
    address: '',
    status: 'Active',
    photo: 'https://randomuser.me/api/portraits/men/41.jpg',
    rating: 4.5,
    reviewCount: 0,
    socialProfiles: {
      website: '',
      linkedin: '',
      twitter: ''
    }
  });
  const [activeTab, setActiveTab] = useState('basic');
  
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const departments = ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Gynecology', 'Dermatology', 'Ophthalmology', 'ENT', 'General Surgery', 'Internal Medicine'];
  const specializations = {
    'Cardiology': ['Cardiac Surgery', 'Interventional Cardiology', 'Electrophysiology'],
    'Neurology': ['Neurosurgery', 'Neuroimaging', 'Neurocritical Care'],
    'Orthopedics': ['Spine Surgery', 'Joint Replacement', 'Sports Medicine'],
    'Pediatrics': ['Pediatric Cardiology', 'Neonatology', 'Pediatric Neurology'],
    'Gynecology': ['Obstetrics', 'Reproductive Endocrinology', 'Gynecologic Oncology'],
    'Dermatology': ['Cosmetic Dermatology', 'Pediatric Dermatology', 'Dermatopathology'],
    'Ophthalmology': ['Retina Specialist', 'Cornea Specialist', 'Glaucoma Specialist'],
    'ENT': ['ENT Surgery', 'Head and Neck Surgery', 'Otology'],
    'General Surgery': ['Laparoscopic Surgery', 'Bariatric Surgery', 'Colorectal Surgery'],
    'Internal Medicine': ['Diabetology', 'Gastroenterology', 'Pulmonology']
  };
  const designations = ['Consultant', 'Senior Consultant', 'HOD', 'Specialist', 'Junior Consultant'];
  
  useEffect(() => {
    // Fetch existing doctors to determine the next available number
    const fetchDoctors = async () => {
      try {
        const response = await doctorAPI.getDoctors();
        if (response.data && response.data.length > 0) {
          // Find doctor IDs that follow the pattern DOC001, DOC002, etc.
          const docIds = response.data
            .map(doc => doc.doctorId)
            .filter(id => id && id.startsWith('DOC'))
            .map(id => {
              const numPart = id.substring(3);
              return parseInt(numPart, 10);
            })
            .filter(num => !isNaN(num));
          
          // Get the highest number and add 1
          if (docIds.length > 0) {
            const maxId = Math.max(...docIds);
            setNextDoctorNumber(maxId + 1);
          }
        }
      } catch (error) {
        console.error('Error fetching doctors for ID generation:', error);
      }
    };
    
    if (isOpen) {
      fetchDoctors();
    }
  }, [isOpen]);

  // Update the doctorId whenever nextDoctorNumber changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      doctorId: `DOC${nextDoctorNumber.toString().padStart(3, '0')}`
    }));
  }, [nextDoctorNumber]);

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      doctorId: `DOC${nextDoctorNumber.toString().padStart(3, '0')}`,
      gender: 'Male',
      dateOfBirth: '',
      email: '',
      phoneNumber: '',
      designation: 'Consultant',
      department: 'Cardiology',
      specialization: 'Cardiac Surgery',
      qualification: '',
      experience: 0,
      successfulTreatments: 0,
      availableDays: ['Monday', 'Wednesday', 'Friday'],
      availableTimeSlots: {
        start: '09:00',
        end: '17:00'
      },
      consultationFee: 1000,
      bio: '',
      address: '',
      status: 'Active',
      photo: 'https://randomuser.me/api/portraits/men/41.jpg',
      rating: 4.5,
      reviewCount: 0,
      socialProfiles: {
        website: '',
        linkedin: '',
        twitter: ''
      }
    });
    setActiveTab('basic');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Update specialization when department changes
    if (name === 'department') {
      setFormData(prev => ({
        ...prev,
        specialization: specializations[value][0] || ''
      }));
    }
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
  
  const handleSocialProfileChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      socialProfiles: {
        ...prev.socialProfiles,
        [name]: value
      }
    }));
  };
  
  const handleSubmit = () => {
    // Convert string date to Date object
    const processedData = {
      ...formData,
      dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : null,
      experience: Number(formData.experience),
      successfulTreatments: Number(formData.successfulTreatments),
      consultationFee: Number(formData.consultationFee)
    };
    
    onSave(processedData);
    resetForm();
  };
  
  const validateForm = () => {
    // Basic validation - require first name, last name, email, and department
    return formData.firstName && formData.lastName && formData.email && formData.department;
  };
  
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Add New Doctor"
      size="xl"
    >
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-4">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('basic')}
            className={`py-4 px-1 border-b-2 text-sm font-medium ${
              activeTab === 'basic'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Basic Information
          </button>
          <button
            onClick={() => setActiveTab('professional')}
            className={`py-4 px-1 border-b-2 text-sm font-medium ${
              activeTab === 'professional'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Professional Details
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`py-4 px-1 border-b-2 text-sm font-medium ${
              activeTab === 'schedule'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Schedule & Fees
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            className={`py-4 px-1 border-b-2 text-sm font-medium ${
              activeTab === 'contact'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Contact & Social
          </button>
        </nav>
      </div>
      
      {/* Basic Information Tab */}
      {activeTab === 'basic' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Doctor ID
                <span className="ml-1 text-xs text-blue-600">(Format: DOC001, DOC002, etc.)</span>
              </label>
              <input
                type="text"
                name="doctorId"
                value={formData.doctorId}
                onChange={handleChange}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="E.g., DOC001"
              />
              <p className="mt-1 text-xs text-gray-500">The ID you enter here will be used for this doctor throughout the system.</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name*</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="First Name"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name*</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Last Name"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Terminated">Terminated</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Photo URL</label>
            <input
              type="text"
              name="photo"
              value={formData.photo}
              onChange={handleChange}
              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="https://example.com/photo.jpg"
            />
          </div>
        </div>
      )}
      
      {/* Professional Details Tab */}
      {activeTab === 'professional' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department*</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
              <select
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                {formData.department && specializations[formData.department]?.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
              <select
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                {designations.map(desig => (
                  <option key={desig} value={desig}>{desig}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
              <input
                type="text"
                name="qualification"
                value={formData.qualification}
                onChange={handleChange}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="MD, MBBS, etc."
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Experience (years)</label>
              <input
                type="number"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                min="0"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Successful Treatments</label>
              <input
                type="number"
                name="successfulTreatments"
                value={formData.successfulTreatments}
                onChange={handleChange}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                min="0"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows="3"
              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Doctor's biography and professional description"
            ></textarea>
          </div>
        </div>
      )}
      
      {/* Schedule & Fees Tab */}
      {activeTab === 'schedule' && (
        <div className="space-y-4">
          <div>
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Consultation Fee (₹)</label>
            <input
              type="number"
              name="consultationFee"
              value={formData.consultationFee}
              onChange={handleChange}
              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              min="0"
              step="100"
            />
          </div>
        </div>
      )}
      
      {/* Contact & Social Tab */}
      {activeTab === 'contact' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email*</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="doctor@example.com"
                required
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
                placeholder="+91 98765 43210"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="2"
              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Complete office address"
            ></textarea>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
              <input
                type="text"
                name="website"
                value={formData.socialProfiles.website}
                onChange={handleSocialProfileChange}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="https://example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
              <input
                type="text"
                name="linkedin"
                value={formData.socialProfiles.linkedin}
                onChange={handleSocialProfileChange}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="https://linkedin.com/in/username"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Twitter</label>
              <input
                type="text"
                name="twitter"
                value={formData.socialProfiles.twitter}
                onChange={handleSocialProfileChange}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="https://twitter.com/username"
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Footer with Navigation and Submit */}
      <div className="flex justify-between space-x-2 mt-6 pt-4 border-t">
        <div>
          {activeTab !== 'basic' && (
            <button
              onClick={() => {
                const tabs = ['basic', 'professional', 'schedule', 'contact'];
                const currentIndex = tabs.indexOf(activeTab);
                setActiveTab(tabs[currentIndex - 1]);
              }}
              className="py-2 px-4 border border-gray-300 rounded shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
            >
              Previous
            </button>
          )}
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={onClose}
            className="py-2 px-4 border border-gray-300 rounded shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
          >
            Cancel
          </button>
          
          {activeTab !== 'contact' ? (
            <button
              onClick={() => {
                const tabs = ['basic', 'professional', 'schedule', 'contact'];
                const currentIndex = tabs.indexOf(activeTab);
                setActiveTab(tabs[currentIndex + 1]);
              }}
              className="py-2 px-4 border border-transparent rounded shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!validateForm()}
              className={`py-2 px-4 border border-transparent rounded shadow-sm text-sm font-medium text-white ${
                validateForm() 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'bg-gray-400 cursor-not-allowed'
              } focus:outline-none`}
            >
              Save Doctor
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default AddDoctorModal; 