import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { patientAPI } from '../../api';

const PatientsList = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [expandedView, setExpandedView] = useState(false);
  
  const patientsPerPage = 10;

  useEffect(() => {
    fetchPatients();
  }, [currentPage, sortField, sortDirection]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // In a real app, you would pass pagination and sorting to the API
      const response = await patientAPI.getPatients();
      
      // Simulate pagination and sorting on the client side
      let filteredData = [...response.data];
      
      // Sort data
      filteredData.sort((a, b) => {
        if (a[sortField] < b[sortField]) return sortDirection === 'asc' ? -1 : 1;
        if (a[sortField] > b[sortField]) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
      
      // Calculate pagination
      const totalItems = filteredData.length;
      setTotalPages(Math.ceil(totalItems / patientsPerPage));
      
      // Get current page data
      const start = (currentPage - 1) * patientsPerPage;
      const paginatedData = filteredData.slice(start, start + patientsPerPage);
      
      setPatients(paginatedData);
    } catch (err) {
      console.error('Error fetching patients:', err);
      setError('Failed to load patients. Please try again.');
      
      // For demo purposes, load dummy data if API fails
      loadDummyData();
    } finally {
      setLoading(false);
    }
  };

  const loadDummyData = () => {
    // Generate dummy data for demonstration
    const dummyPatients = Array.from({ length: 50 }, (_, index) => ({
      _id: `p${index + 1}`,
      patientId: `P${String(new Date().getFullYear()).slice(-2)}${1000 + index}`,
      firstName: ['Amit', 'Priya', 'Rahul', 'Sunita', 'Vikram', 'Neha', 'Raj', 'Meera', 'Suresh', 'Anita'][index % 10],
      lastName: ['Sharma', 'Patel', 'Singh', 'Gupta', 'Verma', 'Kumar', 'Joshi', 'Rao', 'Malhotra', 'Tiwari'][index % 10],
      gender: index % 3 === 0 ? 'Female' : 'Male',
      age: 20 + (index % 60),
      phoneNumber: `98765${43210 + index}`,
      membershipType: ['General (0%)', 'Gold (10%)', 'Platinum (15%)', 'Diamond (20%)'][index % 4],
      createdAt: new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString(),
      // Additional dummy data for medical, guarantor, insurance, and emergency
      diagnosisDate: index % 3 === 0 ? new Date(Date.now() - index * 2 * 24 * 60 * 60 * 1000).toISOString() : null,
      chiefComplaint: index % 3 === 0 ? ['Fever', 'Cough', 'Headache', 'Back pain', 'Joint pain'][index % 5] : null,
      guarantorName: index % 4 === 0 ? ['Jane Smith', 'Robert Johnson', 'Emily Davis', 'Michael Brown'][index % 4] : null,
      insuranceProvider: index % 5 === 0 ? ['Blue Cross', 'Aetna', 'UnitedHealth', 'Cigna', 'Humana'][index % 5] : null,
      emergencyContactName: index % 3 === 0 ? ['Maria Garcia', 'David Wilson', 'Sarah Lee', 'James Taylor'][index % 4] : null,
    }));
    
    // Sort data
    dummyPatients.sort((a, b) => {
      if (a[sortField] < b[sortField]) return sortDirection === 'asc' ? -1 : 1;
      if (a[sortField] > b[sortField]) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    
    // Calculate pagination
    const totalItems = dummyPatients.length;
    setTotalPages(Math.ceil(totalItems / patientsPerPage));
    
    // Get current page data
    const start = (currentPage - 1) * patientsPerPage;
    const paginatedData = dummyPatients.slice(start, start + patientsPerPage);
    
    setPatients(paginatedData);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return null;
    
    return sortDirection === 'asc' ? (
      <svg className="w-4 h-4 ml-1 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 ml-1 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  const handleViewDetails = (patientId) => {
    navigate(`/patients/view/${patientId}`);
  };

  const handleEditPatient = (patientId) => {
    navigate(`/patients/edit/${patientId}`);
  };

  const toggleExpandedView = () => {
    setExpandedView(!expandedView);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error && patients.length === 0) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-4 sm:p-6 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">All Patients</h2>
        <div className="flex space-x-2">
          <button
            onClick={toggleExpandedView}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {expandedView ? 'Compact View' : 'Expanded View'}
          </button>
          <button
            onClick={() => fetchPatients()}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('patientId')}
              >
                ID {getSortIcon('patientId')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('firstName')}
              >
                Name {getSortIcon('firstName')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('gender')}
              >
                Gender {getSortIcon('gender')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('age')}
              >
                Age {getSortIcon('age')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('phoneNumber')}
              >
                Phone {getSortIcon('phoneNumber')}
              </th>
              
              {expandedView && (
                <>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Medical
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Guarantor
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Insurance
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Emergency
                  </th>
                </>
              )}
              
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('membershipType')}
              >
                Membership {getSortIcon('membershipType')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('createdAt')}
              >
                Registered On {getSortIcon('createdAt')}
              </th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {patients.map((patient) => (
              <tr key={patient._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                  {patient.patientId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {patient.firstName} {patient.lastName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {patient.gender}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {patient.age}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {patient.phoneNumber}
                </td>
                
                {expandedView && (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {patient.chiefComplaint ? (
                        <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">
                          {patient.chiefComplaint}
                        </span>
                      ) : (
                        <span className="text-gray-400">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {patient.guarantorName ? (
                        <span>{patient.guarantorName}</span>
                      ) : (
                        <span className="text-gray-400">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {patient.insuranceProvider ? (
                        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">
                          {patient.insuranceProvider}
                        </span>
                      ) : (
                        <span className="text-gray-400">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {patient.emergencyContactName ? (
                        <span>{patient.emergencyContactName}</span>
                      ) : (
                        <span className="text-gray-400">None</span>
                      )}
                    </td>
                  </>
                )}
                
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${patient.membershipType.includes('Gold') ? 'bg-yellow-100 text-yellow-800' : 
                      patient.membershipType.includes('Platinum') ? 'bg-purple-100 text-purple-800' : 
                      patient.membershipType.includes('Diamond') ? 'bg-blue-100 text-blue-800' : 
                      'bg-gray-100 text-gray-800'}`}
                  >
                    {patient.membershipType}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(patient.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  <button
                    onClick={() => handleViewDetails(patient._id)}
                    className="text-blue-600 hover:text-blue-900 mx-1"
                  >
                    View
                  </button>
                  <button
                    onClick={() => handleEditPatient(patient._id)}
                    className="text-green-600 hover:text-green-900 mx-1"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
              currentPage === 1 ? 'text-gray-400 bg-gray-100' : 'text-gray-700 bg-white hover:bg-gray-50'
            }`}
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
              currentPage === totalPages ? 'text-gray-400 bg-gray-100' : 'text-gray-700 bg-white hover:bg-gray-50'
            }`}
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{Math.min(1 + (currentPage - 1) * patientsPerPage, patients.length)}</span> to{' '}
              <span className="font-medium">{Math.min(currentPage * patientsPerPage, patients.length)}</span> of{' '}
              <span className="font-medium">{patients.length}</span> patients
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                  currentPage === 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <span className="sr-only">Previous</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              
              {/* Page numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`relative inline-flex items-center px-4 py-2 border ${
                    currentPage === page
                      ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                      : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                  } text-sm font-medium`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                  currentPage === totalPages ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                }`}
              >
                <span className="sr-only">Next</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientsList; 