import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { patientAPI } from '../../api';

const PatientSearch = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState({
    searchType: 'patientId',
    patientId: '',
    name: '',
    phoneNumber: '',
    dateRange: 'all',
    startDate: '',
    endDate: '',
  });
  
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchParams({
      ...searchParams,
      [name]: value,
    });
  };

  const handleSearchTypeChange = (e) => {
    setSearchParams({
      ...searchParams,
      searchType: e.target.value,
      patientId: '',
      name: '',
      phoneNumber: '',
    });
  };

  const handleDateRangeChange = (e) => {
    const value = e.target.value;
    
    // Reset date fields when changing range type
    setSearchParams({
      ...searchParams,
      dateRange: value,
      startDate: '',
      endDate: '',
    });
  };

  const prepareSearchQueryParams = () => {
    // Prepare query parameters based on search type and date range
    const params = {};
    
    // Add search criteria based on search type
    if (searchParams.searchType === 'patientId' && searchParams.patientId) {
      params.patientId = searchParams.patientId;
    } else if (searchParams.searchType === 'name' && searchParams.name) {
      params.name = searchParams.name;
    } else if (searchParams.searchType === 'phoneNumber' && searchParams.phoneNumber) {
      params.phoneNumber = searchParams.phoneNumber;
    }
    
    // Add date range filters
    if (searchParams.dateRange === 'custom') {
      if (searchParams.startDate) params.startDate = searchParams.startDate;
      if (searchParams.endDate) params.endDate = searchParams.endDate;
    } else if (searchParams.dateRange !== 'all') {
      params.dateRange = searchParams.dateRange;
    }
    
    return params;
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSearched(true);
    
    try {
      const queryParams = prepareSearchQueryParams();
      
      // Check if we have any search criteria
      if (Object.keys(queryParams).length === 0) {
        // If no search criteria, fetch all patients
        const response = await patientAPI.getPatients();
        setSearchResults(response.data);
      } else {
        // Otherwise, use the search endpoint with the correct parameters
        const response = await patientAPI.searchPatients(queryParams);
        setSearchResults(response.data);
      }
    } catch (err) {
      console.error('Error searching patients:', err);
      setError('Failed to search patients. Please try again.');
      
      // Fallback to generating dummy results for development/demo purposes
      const dummyResults = generateDummyResults();
      setSearchResults(dummyResults);
    } finally {
      setLoading(false);
    }
  };

  const generateDummyResults = () => {
    // Generate 0-5 random results based on search criteria
    const count = Math.floor(Math.random() * 6);
    if (count === 0) return [];
    
    return Array.from({ length: count }, (_, index) => {
      const firstName = ['Amit', 'Priya', 'Rahul', 'Sunita', 'Vikram', 'Neha', 'Raj', 'Meera', 'Suresh', 'Anita'][Math.floor(Math.random() * 10)];
      const lastName = ['Sharma', 'Patel', 'Singh', 'Gupta', 'Verma', 'Kumar', 'Joshi', 'Rao', 'Malhotra', 'Tiwari'][Math.floor(Math.random() * 10)];
      
      // Match based on search criteria if provided
      let matchesSearch = true;
      
      if (searchParams.searchType === 'patientId' && searchParams.patientId) {
        const patientId = `P${String(new Date().getFullYear()).slice(-2)}${1000 + index}`;
        matchesSearch = patientId.includes(searchParams.patientId);
      } else if (searchParams.searchType === 'name' && searchParams.name) {
        matchesSearch = `${firstName} ${lastName}`.toLowerCase().includes(searchParams.name.toLowerCase());
      } else if (searchParams.searchType === 'phoneNumber' && searchParams.phoneNumber) {
        const phone = `98765${43210 + index * 11}`;
        matchesSearch = phone.includes(searchParams.phoneNumber);
      }
      
      if (!matchesSearch) return null;
      
      return {
        _id: `p${index + 1}`,
        patientId: `P${String(new Date().getFullYear()).slice(-2)}${1000 + index}`,
        firstName,
        lastName,
        gender: index % 3 === 0 ? 'Female' : 'Male',
        age: 20 + (index % 60),
        phoneNumber: `98765${43210 + index * 11}`,
        membershipType: ['General (0%)', 'Gold (10%)', 'Platinum (15%)', 'Diamond (20%)'][index % 4],
        createdAt: new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString(),
      };
    }).filter(Boolean); // Remove any null entries
  };

  const handleClear = () => {
    setSearchParams({
      searchType: 'patientId',
      patientId: '',
      name: '',
      phoneNumber: '',
      dateRange: 'all',
      startDate: '',
      endDate: '',
    });
    setSearchResults([]);
    setSearched(false);
    setError(null);
  };

  const handleViewDetails = (patientId) => {
    navigate(`/patients/view/${patientId}`);
  };

  const handleEdit = (patientId) => {
    navigate(`/patients/edit/${patientId}`);
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-4 sm:p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Search Patients</h2>
        
        <form onSubmit={handleSearch} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Search Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search By</label>
              <select
                name="searchType"
                value={searchParams.searchType}
                onChange={handleSearchTypeChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="patientId">Patient ID</option>
                <option value="name">Name</option>
                <option value="phoneNumber">Phone Number</option>
              </select>
            </div>
            
            {/* Search Value */}
            <div>
              {searchParams.searchType === 'patientId' && (
                <>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Patient ID</label>
                  <input
                    type="text"
                    name="patientId"
                    value={searchParams.patientId}
                    onChange={handleChange}
                    placeholder="Enter patient ID"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </>
              )}
              
              {searchParams.searchType === 'name' && (
                <>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name</label>
                  <input
                    type="text"
                    name="name"
                    value={searchParams.name}
                    onChange={handleChange}
                    placeholder="Enter patient name"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </>
              )}
              
              {searchParams.searchType === 'phoneNumber' && (
                <>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    name="phoneNumber"
                    value={searchParams.phoneNumber}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </>
              )}
            </div>
          </div>
          
          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Registration Date</label>
              <select
                name="dateRange"
                value={searchParams.dateRange}
                onChange={handleDateRangeChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="lastWeek">Last 7 Days</option>
                <option value="lastMonth">Last 30 Days</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
            
            {searchParams.dateRange === 'custom' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={searchParams.startDate}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={searchParams.endDate}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </>
            )}
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Clear
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Searching...
                </>
              ) : 'Search'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Search Results */}
      {searched && (
        <div className="border-t border-gray-200">
          <div className="p-4 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Search Results</h3>
            
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                {error}
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">No patients found</h3>
                <p className="mt-1 text-sm text-gray-500">Try adjusting your search criteria.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Gender
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Age
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phone
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Registration Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {searchResults.map((patient) => (
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(patient.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                          <button
                            onClick={() => handleViewDetails(patient._id)}
                            className="text-blue-600 hover:text-blue-900 focus:outline-none"
                          >
                            View
                          </button>
                          <span className="px-2">|</span>
                          <button
                            onClick={() => handleEdit(patient._id)}
                            className="text-green-600 hover:text-green-900 focus:outline-none"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientSearch; 