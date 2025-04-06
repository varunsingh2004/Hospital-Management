import { useState } from 'react';
import PatientsList from '../components/patients/PatientsList';
import PatientSearch from '../components/patients/PatientSearch';
import PatientRegistration from './PatientRegistration';

const Patients = () => {
  const [activeTab, setActiveTab] = useState('all');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'all':
        return <PatientsList />;
      case 'search':
        return <PatientSearch />;
      case 'register':
        return <PatientRegistration />;
      default:
        return <PatientsList />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">Patients Management</h1>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('all')}
            className={`${
              activeTab === 'all'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            All Patients
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`${
              activeTab === 'search'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Search Patients
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`${
              activeTab === 'register'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Register Patient
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default Patients; 