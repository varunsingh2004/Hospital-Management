import { useState, useEffect } from 'react';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import dashboardAPI from '../api/dashboardAPI';
import { Table, Spin, Alert } from 'antd';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    revenueToday: 0
  });
  
  const [departmentData, setDepartmentData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Appointments',
        data: [],
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  });
  
  const [revenueData, setRevenueData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Revenue (₹)',
        data: [],
        fill: false,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        tension: 0.4,
      },
    ],
  });
  
  const [ageDistributionData, setAgeDistributionData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Patients by Age',
        data: [],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  });
  
  const [recentPatients, setRecentPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Get all dashboard data in one request
        const response = await dashboardAPI.getAllDashboardData();
        console.log('Dashboard API Response:', response);
        
        // Check if response data is valid
        if (!response || !response.data) {
          console.error('Invalid API response, using fallback data');
          useFallbackData();
          setLoading(false);
          return;
        }
        
        const { data } = response;
        
        // Make sure we have the stats property
        if (!data.stats) {
          console.error('API response missing stats property:', data);
          useFallbackData();
          setLoading(false);
          return;
        }
        
        // Update state with received data
        setStats(data.stats || {});
        setDepartmentData(data.appointmentsByDepartment || defaultDepartmentData);
        setRevenueData(data.revenueData || defaultRevenueData);
        setAgeDistributionData(data.ageDistribution || defaultAgeData);
        setRecentPatients(data.recentPatients || []);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data. Please try again later.');
        // Use fallback data if API fails
        useFallbackData();
        setLoading(false);
      }
    };
    
    // Default chart data
    const defaultDepartmentData = {
      labels: ['General Medicine', 'Cardiology', 'Orthopedics', 'Pediatrics', 'Neurology', 'Dermatology'],
      datasets: [
        {
          label: 'Appointments',
          data: [12, 8, 6, 5, 3, 2],
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
      ],
    };
    
    const defaultRevenueData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Revenue (₹)',
          data: [85000, 92000, 85000, 92000, 100000, 110000],
          fill: false,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          tension: 0.4,
        },
      ],
    };
    
    const defaultAgeData = {
      labels: ['0-18', '19-35', '36-50', '51-65', '65+'],
      datasets: [
        {
          label: 'Patients by Age',
          data: [8, 12, 15, 5, 2],
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
    
    fetchDashboardData();
  }, []);
  
  // Use fallback data if API is not available
  const useFallbackData = () => {
    setStats({
      totalPatients: 42,
      totalDoctors: 5,
      totalAppointments: 8,
      revenueToday: 9500
    });
    
    setDepartmentData({
      labels: ['General Medicine', 'Cardiology', 'Orthopedics', 'Pediatrics', 'Neurology', 'Dermatology'],
      datasets: [
        {
          label: 'Appointments',
          data: [12, 8, 6, 5, 3, 2],
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
      ],
    });
    
    setRevenueData({
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Revenue (₹)',
          data: [85000, 92000, 85000, 92000, 100000, 110000],
          fill: false,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          tension: 0.4,
        },
      ],
    });
    
    setAgeDistributionData({
      labels: ['0-18', '19-35', '36-50', '51-65', '65+'],
      datasets: [
        {
          label: 'Patients by Age',
          data: [8, 12, 15, 5, 2],
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
          ],
          borderWidth: 1,
        },
      ],
    });
  };
  
  const patientColumns = [
    {
      title: 'Name',
      key: 'name',
      render: (_, record) => `${record.firstName} ${record.lastName}`,
    },
    {
      title: 'Phone',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
    },
    {
      title: 'Age',
      dataIndex: 'age',
      key: 'age',
      render: (age, record) => age || calculateAge(record.dateOfBirth),
    },
    {
      title: 'Membership',
      dataIndex: 'membershipType',
      key: 'membershipType',
    },
  ];
  
  // Helper function to calculate age
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';
    const dob = new Date(dateOfBirth);
    const diff = Date.now() - dob.getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spin size="large" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-6">
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-800">Dashboard Overview</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-500">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-500">Total Patients</h2>
              <p className="text-2xl font-semibold text-gray-800">{stats?.totalPatients?.toLocaleString() || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-500">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-500">Total Doctors</h2>
              <p className="text-2xl font-semibold text-gray-800">{stats?.totalDoctors || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-500">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-500">Today's Appointments</h2>
              <p className="text-2xl font-semibold text-gray-800">{stats?.totalAppointments || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-500">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-gray-500">Today's Revenue</h2>
              <p className="text-2xl font-semibold text-gray-800">₹{stats?.revenueToday?.toLocaleString() || 0}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Appointments by Department</h2>
          <div className="h-80">
            {departmentData?.datasets?.length > 0 ? (
              <Bar data={departmentData} options={{ maintainAspectRatio: false }} />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                No appointment data available
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Monthly Revenue</h2>
          <div className="h-80">
            {revenueData?.datasets?.length > 0 ? (
              <Line data={revenueData} options={{ maintainAspectRatio: false }} />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                No revenue data available
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Patient Age Distribution</h2>
          <div className="h-80 flex justify-center">
            <div className="w-3/4">
              {ageDistributionData?.datasets?.length > 0 ? (
                <Doughnut data={ageDistributionData} options={{ maintainAspectRatio: false }} />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  No patient age data available
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Recent Patients</h2>
          <Table 
            dataSource={recentPatients || []} 
            columns={patientColumns}
            rowKey="_id"
            pagination={false}
            locale={{ emptyText: 'No recent patients' }}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 