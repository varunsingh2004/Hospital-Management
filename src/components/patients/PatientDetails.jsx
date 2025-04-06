import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { patientAPI } from '../../api';
import doctorAPI from '../../api/doctorAPI';

const PatientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assignedDoctor, setAssignedDoctor] = useState(null);
  const [activeTab, setActiveTab] = useState('personal');

  useEffect(() => {
    fetchPatient();
  }, [id]);

  const fetchPatient = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await patientAPI.getPatientById(id);
      setPatient(response.data);
      
      // If there's an assigned doctor, fetch additional details
      if (response.data.assignedDoctor) {
        try {
          const doctorResponse = await doctorAPI.getDoctorById(response.data.assignedDoctor);
          setAssignedDoctor(doctorResponse.data);
        } catch (err) {
          console.error('Error fetching doctor details:', err);
        }
      }
    } catch (err) {
      console.error('Error fetching patient details:', err);
      setError('Failed to load patient details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/patients/edit/${id}`);
  };

  const handleBack = () => {
    navigate('/patients');
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
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative">
        Patient not found.
      </div>
    );
  }

  const renderPersonalInfo = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-gray-50 p-4 rounded">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Patient ID</h3>
        <p className="text-gray-700">{patient.patientId || 'N/A'}</p>
      </div>
      
      <div className="bg-gray-50 p-4 rounded">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Name</h3>
        <p className="text-gray-700">
          {patient.salutation} {patient.firstName} {patient.middleName} {patient.lastName}
        </p>
      </div>
      
      <div className="bg-gray-50 p-4 rounded">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Gender</h3>
        <p className="text-gray-700">{patient.gender}</p>
      </div>
      
      <div className="bg-gray-50 p-4 rounded">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Age</h3>
        <p className="text-gray-700">{patient.age} years</p>
      </div>
      
      <div className="bg-gray-50 p-4 rounded">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Date of Birth</h3>
        <p className="text-gray-700">
          {new Date(patient.dateOfBirth).toLocaleDateString()}
        </p>
      </div>
      
      <div className="bg-gray-50 p-4 rounded">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Phone Number</h3>
        <p className="text-gray-700">{patient.phoneNumber}</p>
      </div>
      
      <div className="bg-gray-50 p-4 rounded">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Landline Number</h3>
        <p className="text-gray-700">{patient.landlineNumber || 'N/A'}</p>
      </div>
      
      <div className="bg-gray-50 p-4 rounded">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Email</h3>
        <p className="text-gray-700">{patient.email || 'N/A'}</p>
      </div>
      
      <div className="bg-gray-50 p-4 rounded">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Address</h3>
        <p className="text-gray-700">{patient.address}</p>
      </div>
      
      <div className="bg-gray-50 p-4 rounded">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Country</h3>
        <p className="text-gray-700">{patient.country}</p>
      </div>
      
      <div className="bg-gray-50 p-4 rounded">
        <h3 className="text-lg font-medium text-gray-900 mb-2">State</h3>
        <p className="text-gray-700">{patient.state}</p>
      </div>
      
      <div className="bg-gray-50 p-4 rounded">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Membership Type</h3>
        <p className="text-gray-700">{patient.membershipType}</p>
      </div>
      
      <div className="bg-gray-50 p-4 rounded">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Occupation</h3>
        <p className="text-gray-700">{patient.occupation || 'N/A'}</p>
      </div>
      
      <div className="bg-gray-50 p-4 rounded">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Marital Status</h3>
        <p className="text-gray-700">{patient.maritalStatus || 'N/A'}</p>
      </div>
      
      <div className="bg-gray-50 p-4 rounded">
        <h3 className="text-lg font-medium text-gray-900 mb-2">PAN Number</h3>
        <p className="text-gray-700">{patient.panNumber || 'N/A'}</p>
      </div>
      
      <div className="bg-gray-50 p-4 rounded">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Registered On</h3>
        <p className="text-gray-700">
          {new Date(patient.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );

  const renderMedicalInfo = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {patient.diagnosisDate && (
        <div className="bg-gray-50 p-4 rounded">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Diagnosis Date</h3>
          <p className="text-gray-700">
            {new Date(patient.diagnosisDate).toLocaleDateString()}
          </p>
        </div>
      )}
      
      {/* Show assigned doctor with format: DOC001/Dr. John Smith */}
      {(patient.assignedDoctor || patient.assignedDoctorInfo) && (
        <div className="bg-gray-50 p-4 rounded">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Assigned Doctor</h3>
          <p className="text-gray-700">
            {patient.assignedDoctorInfo ? (
              // Use the stored doctor info if available
              <>
                {patient.assignedDoctorInfo.doctorId && (
                  <span className="font-medium">{patient.assignedDoctorInfo.doctorId}/</span>
                )}
                {patient.assignedDoctorInfo.name}
              </>
            ) : assignedDoctor ? (
              // Use fetched doctor data if available
              <>
                {assignedDoctor.doctorId && (
                  <span className="font-medium">{assignedDoctor.doctorId}/</span>
                )}
                Dr. {assignedDoctor.firstName} {assignedDoctor.lastName}
              </>
            ) : (
              // Fallback to stored ID if nothing else is available
              `Doctor ID: ${patient.assignedDoctor}`
            )}
          </p>
        </div>
      )}
      
      {patient.chiefComplaint && (
        <div className="bg-gray-50 p-4 rounded">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Chief Complaint</h3>
          <p className="text-gray-700">{patient.chiefComplaint}</p>
        </div>
      )}
      
      {patient.diagnosisNotes && (
        <div className="bg-gray-50 p-4 rounded md:col-span-2 lg:col-span-3">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Diagnosis Notes</h3>
          <p className="text-gray-700">{patient.diagnosisNotes}</p>
        </div>
      )}
      
      {patient.treatmentPlan && (
        <div className="bg-gray-50 p-4 rounded md:col-span-2 lg:col-span-3">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Treatment Plan</h3>
          <p className="text-gray-700">{patient.treatmentPlan}</p>
        </div>
      )}
      
      {patient.followUpDate && (
        <div className="bg-gray-50 p-4 rounded">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Follow-Up Date</h3>
          <p className="text-gray-700">
            {new Date(patient.followUpDate).toLocaleDateString()}
          </p>
        </div>
      )}
    </div>
  );

  const renderGuarantorInfo = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {patient.guarantorName && (
        <div className="bg-gray-50 p-4 rounded">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Guarantor Name</h3>
          <p className="text-gray-700">{patient.guarantorName}</p>
        </div>
      )}
      
      {patient.guarantorRelation && (
        <div className="bg-gray-50 p-4 rounded">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Relationship to Patient</h3>
          <p className="text-gray-700">{patient.guarantorRelation}</p>
        </div>
      )}
      
      {patient.guarantorPhone && (
        <div className="bg-gray-50 p-4 rounded">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Guarantor Phone</h3>
          <p className="text-gray-700">{patient.guarantorPhone}</p>
        </div>
      )}
      
      {patient.guarantorAddress && (
        <div className="bg-gray-50 p-4 rounded md:col-span-2">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Guarantor Address</h3>
          <p className="text-gray-700">{patient.guarantorAddress}</p>
        </div>
      )}
      
      {!patient.guarantorName && !patient.guarantorRelation && !patient.guarantorPhone && !patient.guarantorAddress && (
        <div className="bg-yellow-50 p-4 rounded md:col-span-2">
          <p className="text-yellow-700">No guarantor information available for this patient.</p>
        </div>
      )}
    </div>
  );

  const renderInsuranceInfo = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {patient.insuranceProvider && (
        <div className="bg-gray-50 p-4 rounded">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Insurance Provider</h3>
          <p className="text-gray-700">{patient.insuranceProvider}</p>
        </div>
      )}
      
      {patient.policyNumber && (
        <div className="bg-gray-50 p-4 rounded">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Policy Number</h3>
          <p className="text-gray-700">{patient.policyNumber}</p>
        </div>
      )}
      
      {patient.groupNumber && (
        <div className="bg-gray-50 p-4 rounded">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Group Number</h3>
          <p className="text-gray-700">{patient.groupNumber}</p>
        </div>
      )}
      
      {patient.effectiveDate && (
        <div className="bg-gray-50 p-4 rounded">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Effective Date</h3>
          <p className="text-gray-700">{new Date(patient.effectiveDate).toLocaleDateString()}</p>
        </div>
      )}
      
      {patient.expiryDate && (
        <div className="bg-gray-50 p-4 rounded">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Expiry Date</h3>
          <p className="text-gray-700">{new Date(patient.expiryDate).toLocaleDateString()}</p>
        </div>
      )}
      
      {!patient.insuranceProvider && !patient.policyNumber && !patient.groupNumber && (
        <div className="bg-yellow-50 p-4 rounded md:col-span-2">
          <p className="text-yellow-700">No insurance information available for this patient.</p>
        </div>
      )}
    </div>
  );

  const renderEmergencyContactInfo = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {patient.emergencyContactName && (
        <div className="bg-gray-50 p-4 rounded">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Emergency Contact Name</h3>
          <p className="text-gray-700">{patient.emergencyContactName}</p>
        </div>
      )}
      
      {patient.emergencyContactRelation && (
        <div className="bg-gray-50 p-4 rounded">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Relationship to Patient</h3>
          <p className="text-gray-700">{patient.emergencyContactRelation}</p>
        </div>
      )}
      
      {patient.emergencyContactPhone && (
        <div className="bg-gray-50 p-4 rounded">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Emergency Contact Phone</h3>
          <p className="text-gray-700">{patient.emergencyContactPhone}</p>
        </div>
      )}
      
      {patient.emergencyContactAddress && (
        <div className="bg-gray-50 p-4 rounded md:col-span-2">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Emergency Contact Address</h3>
          <p className="text-gray-700">{patient.emergencyContactAddress}</p>
        </div>
      )}
      
      {!patient.emergencyContactName && !patient.emergencyContactRelation && !patient.emergencyContactPhone && (
        <div className="bg-yellow-50 p-4 rounded md:col-span-2">
          <p className="text-yellow-700">No emergency contact information available for this patient.</p>
        </div>
      )}
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'personal':
        return renderPersonalInfo();
      case 'medical':
        return renderMedicalInfo();
      case 'guarantor':
        return renderGuarantorInfo();
      case 'insurance':
        return renderInsuranceInfo();
      case 'emergency':
        return renderEmergencyContactInfo();
      default:
        return renderPersonalInfo();
    }
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Patient Details</h2>
        <div className="flex space-x-2">
          <button
            onClick={handleBack}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Back to Patients
          </button>
          <button
            onClick={handleEdit}
            className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Edit Patient
          </button>
        </div>
      </div>
      
      {/* Information tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-6 px-6">
          <button
            onClick={() => setActiveTab('personal')}
            className={`${
              activeTab === 'personal'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Personal Information
          </button>
          <button
            onClick={() => setActiveTab('medical')}
            className={`${
              activeTab === 'medical'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Medical Information
          </button>
          <button
            onClick={() => setActiveTab('guarantor')}
            className={`${
              activeTab === 'guarantor'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Guarantor
          </button>
          <button
            onClick={() => setActiveTab('insurance')}
            className={`${
              activeTab === 'insurance'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Insurance
          </button>
          <button
            onClick={() => setActiveTab('emergency')}
            className={`${
              activeTab === 'emergency'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Emergency Contact
          </button>
        </nav>
      </div>
      
      <div className="p-4 sm:p-6">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default PatientDetails; 