import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import billingAPI from '../api/billingAPI';
import { withAuthErrorHandling } from '../utils/authUtils';

const BillingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [billing, setBilling] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBillingDetails();
  }, [id]);

  const fetchBillingDetails = async () => {
    try {
      setLoading(true);
      const response = await billingAPI.getBillingById(id);
      setBilling(response.data);
    } catch (error) {
      console.error('Error fetching billing details:', error);
      toast.error('Failed to load billing details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
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

  const handleEditClick = () => {
    withAuthErrorHandling(
      () => {
        navigate(`/billing/${id}/edit`);
        return true;
      },
      'Unable to access edit page. Please refresh and try again.'
    );
  };

  const handlePaymentClick = () => {
    withAuthErrorHandling(
      () => {
        navigate(`/billing/${id}/payment`);
        return true;
      },
      'Unable to access payment page. Please refresh and try again.'
    );
  };

  const handlePrintClick = () => {
    withAuthErrorHandling(
      () => {
        navigate(`/billing/${id}/print`);
        return true;
      },
      'Unable to access print page. Please refresh and try again.'
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!billing) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        <p>Billing record not found. It may have been deleted or moved.</p>
        <Link to="/billing" className="text-blue-600 hover:text-blue-800 font-medium">
          Return to Billing Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Invoice {billing.billingId}</h1>
          <p className="text-sm text-gray-500">Created on {formatDate(billing.issueDate)}</p>
        </div>
        <div className="flex space-x-2">
          <Link to="/billing" className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
            Back
          </Link>
          <button 
            onClick={handleEditClick}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Edit
          </button>
          <button 
            onClick={handlePaymentClick}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            disabled={billing.paymentStatus === 'paid'}
          >
            {billing.paymentStatus === 'paid' ? 'Paid' : 'Make Payment'}
          </button>
          <button 
            onClick={handlePrintClick}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Print
          </button>
        </div>
      </div>

      {/* Billing Status Card */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-800">Invoice Details</h2>
          <span className={`px-3 py-1 inline-flex text-sm font-medium rounded-full border ${getStatusBadgeClass(billing.paymentStatus)}`}>
            {billing.paymentStatus}
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">Invoice Information</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Invoice ID:</span>
                <span className="text-sm font-medium">{billing.billingId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Issue Date:</span>
                <span className="text-sm font-medium">{formatDate(billing.issueDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Due Date:</span>
                <span className="text-sm font-medium">{formatDate(billing.dueDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Amount:</span>
                <span className="text-sm font-bold">{billingAPI.formatCurrency(billing.totalAmount)}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">Payment Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Payment Status:</span>
                <span className={`text-sm font-medium ${
                  billing.paymentStatus === 'paid' ? 'text-green-600' : 
                  billing.paymentStatus === 'pending' ? 'text-yellow-600' : 
                  billing.paymentStatus === 'overdue' ? 'text-red-600' : 'text-gray-600'
                }`}>{billing.paymentStatus}</span>
              </div>
              {billing.paymentMethod && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Payment Method:</span>
                  <span className="text-sm font-medium">{billing.paymentMethod}</span>
                </div>
              )}
              {billing.paymentDate && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Payment Date:</span>
                  <span className="text-sm font-medium">{formatDate(billing.paymentDate)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Patient and Doctor Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Patient Information</h2>
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-500">Name</span>
              <p className="text-lg font-medium text-gray-900">{billing.patientName}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Patient ID</span>
              <p className="text-md text-gray-900">{billing.patientId}</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Doctor Information</h2>
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-gray-500">Name</span>
              <p className="text-lg font-medium text-gray-900">{billing.doctorName}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Doctor ID</span>
              <p className="text-md text-gray-900">{billing.doctorId}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Services */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-800">Services</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service Name
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit Price
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {billing.services.map((service, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {service.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                    {service.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                    {billingAPI.formatCurrency(service.price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                    {billingAPI.formatCurrency(service.price * service.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50">
                <td colSpan={3} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                  Total
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                  {billingAPI.formatCurrency(billing.totalAmount)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Notes */}
      {billing.notes && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Notes</h2>
          <p className="text-gray-600 whitespace-pre-line">{billing.notes}</p>
        </div>
      )}
    </div>
  );
};

export default BillingDetails; 