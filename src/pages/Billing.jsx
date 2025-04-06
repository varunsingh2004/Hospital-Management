import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import billingAPI from '../api/billingAPI';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { toast } from 'react-toastify';
import { withAuthErrorHandling } from '../utils/authUtils';

// Register Chart.js components
Chart.register(...registerables);

const Billing = () => {
  const navigate = useNavigate();
  const [billings, setBillings] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [patientFilter, setPatientFilter] = useState('');
  const [doctorFilter, setDoctorFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch billing summary
      const summaryResponse = await billingAPI.getBillingSummary()
        .catch(err => {
          if (err.response && err.response.status === 401) {
            toast.error('Authentication error. Please refresh the page and try again.', {
              toastId: 'auth-error-summary'
            });
            return { data: null };
          }
          throw err;
        });
      
      if (summaryResponse.data) {
        setSummary(summaryResponse.data);
      }
      
      // Fetch latest billings
      const billingsResponse = await billingAPI.getBillings()
        .catch(err => {
          if (err.response && err.response.status === 401) {
            toast.error('Authentication error. Please refresh the page and try again.', {
              toastId: 'auth-error-billings'
            });
            return { data: [] };
          }
          throw err;
        });
      
      setBillings(billingsResponse.data || []);
    } catch (err) {
      console.error('Error fetching billing data:', err);
      setError('Failed to load billing data. Please try again later.');
      toast.error('Failed to load billing data');
    } finally {
      setLoading(false);
    }
  };
  
  const handleFilterChange = async () => {
    try {
      setLoading(true);
      
      // Build the filter object
      const filters = {};

      // Handle patient ID or name filtering
      if (patientFilter) {
        // Try to match with either patient ID or patient name
        filters.patientFilter = patientFilter;
      }
      
      // Handle doctor ID or name filtering
      if (doctorFilter) {
        // Try to match with either doctor ID or doctor name
        filters.doctorFilter = doctorFilter;
      }
      
      // Handle payment status filtering
      if (statusFilter) {
        filters.paymentStatus = statusFilter;
      }
      
      console.log('Applying filters:', filters);
      
      const response = await billingAPI.getBillings(filters)
        .catch(err => {
          if (err.response && err.response.status === 401) {
            toast.error('Authentication error. Please refresh the page and try again.', {
              toastId: 'auth-error-filter'
            });
            return { data: [] };
          }
          throw err;
        });
      
      setBillings(response.data || []);
    } catch (err) {
      console.error('Error applying filters:', err);
      toast.error('Failed to apply filters');
    } finally {
      setLoading(false);
    }
  };
  
  const resetFilters = () => {
    setPatientFilter('');
    setDoctorFilter('');
    setStatusFilter('');
    setSearchTerm('');
    fetchData();
  };
  
  const filteredBillings = billings.filter(billing => {
    if (!searchTerm) return true;
    
    const searchValue = searchTerm.toLowerCase();
    return (
      billing.patientName.toLowerCase().includes(searchValue) ||
      billing.billingId?.toLowerCase().includes(searchValue) ||
      billing.doctorName.toLowerCase().includes(searchValue)
    );
  });
  
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Charts configuration
  const paymentStatusChartData = summary ? {
    labels: Object.keys(summary.counts).filter(key => key !== 'total'),
    datasets: [
      {
        label: 'Invoices by Status',
        data: Object.entries(summary.counts)
          .filter(([key]) => key !== 'total')
          .map(([_, value]) => value),
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)', // paid
          'rgba(255, 206, 86, 0.6)', // pending
          'rgba(255, 99, 132, 0.6)', // overdue
          'rgba(201, 203, 207, 0.6)'  // cancelled
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(201, 203, 207, 1)'
        ],
        borderWidth: 1
      }
    ]
  } : null;
  
  const amountByStatusChartData = summary ? {
    labels: Object.keys(summary.amountByStatus),
    datasets: [
      {
        label: 'Amount by Status',
        data: Object.values(summary.amountByStatus),
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)', // paid
          'rgba(255, 206, 86, 0.6)', // pending
          'rgba(255, 99, 132, 0.6)', // overdue
          'rgba(201, 203, 207, 0.6)'  // cancelled
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(201, 203, 207, 1)'
        ],
        borderWidth: 1
      }
    ]
  } : null;
  
  const monthlyRevenueChartData = summary ? {
    labels: summary.monthlyRevenue.map(item => {
      const [year, month] = item.month.split('-');
      return `${new Date(year, month - 1).toLocaleDateString('en-US', { month: 'short' })} ${year}`;
    }),
    datasets: [
      {
        label: 'Monthly Revenue',
        data: summary.monthlyRevenue.map(item => item.amount),
        fill: false,
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        tension: 0.4
      }
    ]
  } : null;
  
  const paymentMethodChartData = summary && summary.paymentMethods ? {
    labels: Object.keys(summary.paymentMethods),
    datasets: [
      {
        label: 'Payment Methods',
        data: Object.values(summary.paymentMethods),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)'
        ],
        borderWidth: 1
      }
    ]
  } : null;
  
  if (loading && !summary) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error && !summary) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        {error}
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">Billing</h1>
        <Link
          to="/billing/new"
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded shadow-sm"
        >
          Create New Invoice
        </Link>
      </div>
      
      {/* Summary Stats */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Total Billed</h3>
            <p className="text-3xl font-bold text-gray-900">{billingAPI.formatCurrency(summary.amounts.total)}</p>
            <p className="text-sm text-gray-500 mt-1">{summary.counts.total} invoices</p>
          </div>
          
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-xl font-semibold text-green-700 mb-2">Total Paid</h3>
            <p className="text-3xl font-bold text-green-600">{billingAPI.formatCurrency(summary.amounts.paid)}</p>
            <p className="text-sm text-gray-500 mt-1">{Math.round((summary.amounts.paid / summary.amounts.total) * 100)}% of total</p>
          </div>
          
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-xl font-semibold text-yellow-700 mb-2">Pending Payment</h3>
            <p className="text-3xl font-bold text-yellow-600">{billingAPI.formatCurrency(summary.amounts.pending)}</p>
            <p className="text-sm text-gray-500 mt-1">{Math.round((summary.amounts.pending / summary.amounts.total) * 100)}% of total</p>
          </div>
          
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-xl font-semibold text-blue-700 mb-2">Status</h3>
            <div className="space-y-2 mt-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Paid:</span>
                <span className="text-sm font-medium">{summary.counts.paid}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Pending:</span>
                <span className="text-sm font-medium">{summary.counts.pending}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Overdue:</span>
                <span className="text-sm font-medium">{summary.counts.overdue || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Cancelled:</span>
                <span className="text-sm font-medium">{summary.counts.cancelled}</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Charts */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-700 mb-4">Monthly Revenue</h3>
            {monthlyRevenueChartData && <Line data={monthlyRevenueChartData} />}
          </div>
          
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-700 mb-4">Invoices by Status</h3>
            {paymentStatusChartData && <Pie data={paymentStatusChartData} />}
          </div>
          
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-700 mb-4">Amount by Status</h3>
            {amountByStatusChartData && <Bar data={amountByStatusChartData} />}
          </div>
          
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-700 mb-4">Payment Methods</h3>
            {paymentMethodChartData && <Pie data={paymentMethodChartData} />}
          </div>
        </div>
      )}
      
      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Patient Search</label>
            <input
              type="text"
              value={patientFilter}
              onChange={(e) => setPatientFilter(e.target.value)}
              placeholder="Search by patient ID or name"
              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Doctor Search</label>
            <input
              type="text"
              value={doctorFilter}
              onChange={(e) => setDoctorFilter(e.target.value)}
              placeholder="Search by doctor ID or name"
              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by patient, doctor, or invoice ID"
              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          
          <div className="flex items-end">
            <div className="flex space-x-2">
              <button
                onClick={handleFilterChange}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
              >
                Apply Filters
              </button>
              <button
                onClick={resetFilters}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded text-sm"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Invoices */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-800">Recent Invoices</h3>
        </div>
        
        {filteredBillings.length === 0 ? (
          <div className="text-center py-16">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No invoices found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {billings.length === 0 
                ? "There are no invoices created yet." 
                : "Try adjusting your filters to see more results."}
            </p>
            <div className="mt-6">
              <Link
                to="/billing/new"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
              >
                Create New Invoice
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doctor
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBillings.slice(0, 10).map((billing) => (
                  <tr key={billing._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {billing.billingId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="font-medium text-gray-900">{billing.patientName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="font-medium text-gray-900">{billing.doctorName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="font-medium text-gray-900">{billingAPI.formatCurrency(billing.totalAmount)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="font-medium">{formatDate(billing.issueDate)}</div>
                      <div className="text-xs">Due: {formatDate(billing.dueDate)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusBadgeClass(billing.paymentStatus)}`}>
                        {billing.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => {
                            withAuthErrorHandling(
                              () => {
                                navigate(`/billing/${billing._id}`);
                                return true;
                              },
                              'Unable to view billing details. Please refresh the page and try again.'
                            );
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </button>
                        <button
                          onClick={() => {
                            withAuthErrorHandling(
                              () => {
                                navigate(`/billing/${billing._id}/edit`);
                                return true;
                              },
                              'Unable to edit billing. Please refresh the page and try again.'
                            );
                          }}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            withAuthErrorHandling(
                              () => {
                                navigate(`/billing/${billing._id}/payment`);
                                return true;
                              },
                              'Unable to access payment page. Please refresh the page and try again.'
                            );
                          }}
                          className="text-green-600 hover:text-green-900"
                        >
                          Payment
                        </button>
                        <button
                          onClick={() => {
                            withAuthErrorHandling(
                              async () => {
                                try {
                                  // Get detailed billing data
                                  const response = await billingAPI.getBillingById(billing._id);
                                  if (!response || !response.data) {
                                    toast.error('Could not retrieve invoice data for printing');
                                    return false;
                                  }
                                  
                                  // Navigate to print view with data
                                  navigate(`/billing/${billing._id}/print`, { 
                                    state: { billingData: response.data } 
                                  });
                                  return true;
                                } catch (err) {
                                  console.error('Error preparing invoice for print:', err);
                                  toast.error('Failed to prepare invoice for printing');
                                  return false;
                                }
                              },
                              'Unable to prepare invoice for printing. Please try again.'
                            );
                          }}
                          className="text-purple-600 hover:text-purple-900"
                        >
                          Print
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredBillings.length > 10 && (
              <div className="px-6 py-4 text-right">
                <Link
                  to="/billing/all"
                  className="text-blue-600 hover:text-blue-900 font-medium"
                >
                  View All Invoices
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Billing; 