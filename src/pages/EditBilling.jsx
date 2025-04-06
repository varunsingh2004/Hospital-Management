import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import billingAPI from '../api/billingAPI';
import { withAuthErrorHandling } from '../utils/authUtils';

const EditBilling = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    patientId: '',
    patientName: '',
    doctorId: '',
    doctorName: '',
    services: [],
    totalAmount: 0,
    issueDate: '',
    dueDate: '',
    paymentStatus: 'pending',
    paymentMethod: '',
    paymentDate: '',
    notes: ''
  });
  
  const [newService, setNewService] = useState({
    name: '',
    price: 0,
    quantity: 1
  });
  
  const [commonServices, setCommonServices] = useState([]);
  
  useEffect(() => {
    fetchBillingData();
    fetchCommonServices();
  }, [id]);
  
  const fetchBillingData = async () => {
    try {
      setLoading(true);
      const response = await billingAPI.getBillingById(id);
      
      // Format dates to be compatible with input fields
      const billingData = response.data;
      const formattedData = {
        ...billingData,
        issueDate: billingData.issueDate ? new Date(billingData.issueDate).toISOString().split('T')[0] : '',
        dueDate: billingData.dueDate ? new Date(billingData.dueDate).toISOString().split('T')[0] : '',
        paymentDate: billingData.paymentDate ? new Date(billingData.paymentDate).toISOString().split('T')[0] : ''
      };
      
      setFormData(formattedData);
    } catch (error) {
      console.error('Error fetching billing details:', error);
      toast.error('Failed to load billing details');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchCommonServices = async () => {
    try {
      const services = billingAPI.getCommonServices();
      setCommonServices(services);
    } catch (error) {
      console.error('Error fetching common services:', error);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };
  
  const handleNewServiceChange = (e) => {
    const { name, value } = e.target;
    setNewService(prev => ({
      ...prev,
      [name]: name === 'quantity' || name === 'price' ? parseFloat(value) || 0 : value
    }));
  };
  
  const handleCommonServiceSelect = (e) => {
    const selectedServiceName = e.target.value;
    if (!selectedServiceName) return;
    
    const selectedService = commonServices.find(service => service.name === selectedServiceName);
    if (selectedService) {
      setNewService({
        name: selectedService.name,
        price: selectedService.amount,
        quantity: 1
      });
    }
  };
  
  const addService = () => {
    if (!newService.name || newService.price <= 0 || newService.quantity <= 0) {
      toast.error('Please enter valid service details');
      return;
    }
    
    const updatedServices = [...formData.services, newService];
    const newTotalAmount = calculateTotal(updatedServices);
    
    setFormData(prev => ({
      ...prev,
      services: updatedServices,
      totalAmount: newTotalAmount
    }));
    
    // Reset new service form
    setNewService({
      name: '',
      price: 0,
      quantity: 1
    });
  };
  
  const removeService = (index) => {
    const updatedServices = formData.services.filter((_, i) => i !== index);
    const newTotalAmount = calculateTotal(updatedServices);
    
    setFormData(prev => ({
      ...prev,
      services: updatedServices,
      totalAmount: newTotalAmount
    }));
  };
  
  const calculateTotal = (services) => {
    return services.reduce(
      (total, service) => total + service.price * service.quantity, 
      0
    );
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.services.length === 0) {
      toast.error('Please add at least one service');
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Prepare data for submission
      const submissionData = { ...formData };
      
      // Format dates for submission
      if (submissionData.issueDate) {
        submissionData.issueDate = new Date(submissionData.issueDate).toISOString();
      }
      
      if (submissionData.dueDate) {
        submissionData.dueDate = new Date(submissionData.dueDate).toISOString();
      }
      
      if (submissionData.paymentDate) {
        submissionData.paymentDate = new Date(submissionData.paymentDate).toISOString();
      } else if (submissionData.paymentStatus === 'paid' && !submissionData.paymentDate) {
        // If status is paid but no payment date is provided, use current date
        submissionData.paymentDate = new Date().toISOString();
      }
      
      await billingAPI.updateBilling(id, submissionData);
      toast.success('Billing record updated successfully');
      navigate(`/billing/${id}`);
    } catch (error) {
      console.error('Error updating billing record:', error);
      toast.error('Failed to update billing record');
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleCancel = () => {
    navigate(`/billing/${id}`);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Edit Invoice #{formData.billingId}</h1>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Patient and Doctor Info */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Patient & Doctor Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Patient Info - Read Only */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name</label>
              <input
                type="text"
                value={formData.patientName}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50 text-gray-700 cursor-not-allowed"
                readOnly
              />
              <input type="hidden" name="patientId" value={formData.patientId} />
            </div>
            
            {/* Doctor Info - Read Only */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Doctor Name</label>
              <input
                type="text"
                value={formData.doctorName}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50 text-gray-700 cursor-not-allowed"
                readOnly
              />
              <input type="hidden" name="doctorId" value={formData.doctorId} />
            </div>
          </div>
        </div>
        
        {/* Billing Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Invoice Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="issueDate" className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
              <input
                type="date"
                id="issueDate"
                name="issueDate"
                value={formData.issueDate}
                onChange={handleChange}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              />
            </div>
            
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              />
            </div>
            
            <div>
              <label htmlFor="paymentStatus" className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
              <select
                id="paymentStatus"
                name="paymentStatus"
                value={formData.paymentStatus}
                onChange={handleChange}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                required
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            {formData.paymentStatus === 'paid' && (
              <>
                <div>
                  <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                  <select
                    id="paymentMethod"
                    name="paymentMethod"
                    value={formData.paymentMethod || ''}
                    onChange={handleChange}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required={formData.paymentStatus === 'paid'}
                  >
                    <option value="">Select a method</option>
                    <option value="cash">Cash</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="debit_card">Debit Card</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="insurance">Insurance</option>
                    <option value="check">Check</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="paymentDate" className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
                  <input
                    type="date"
                    id="paymentDate"
                    name="paymentDate"
                    value={formData.paymentDate || ''}
                    onChange={handleChange}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Services */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Services</h2>
          
          {/* Current Services */}
          {formData.services.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Current Services</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Service Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Unit Price
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {formData.services.map((service, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {service.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                          {service.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                          {billingAPI.formatCurrency(service.price)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                          {billingAPI.formatCurrency(service.price * service.quantity)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            type="button"
                            onClick={() => removeService(index)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50">
                      <td colSpan="3" className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                        Total Amount
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                        {billingAPI.formatCurrency(formData.totalAmount)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
          
          {/* Add New Service */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Add New Service</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Common Services</label>
                <select
                  onChange={handleCommonServiceSelect}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Select a service</option>
                  {commonServices.map((service, index) => (
                    <option key={index} value={service.name}>
                      {service.name} - {billingAPI.formatCurrency(service.amount)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Service Name</label>
                <input
                  type="text"
                  name="name"
                  value={newService.name}
                  onChange={handleNewServiceChange}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter service name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price</label>
                <input
                  type="number"
                  name="price"
                  value={newService.price}
                  onChange={handleNewServiceChange}
                  min="0"
                  step="0.01"
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  value={newService.quantity}
                  onChange={handleNewServiceChange}
                  min="1"
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="1"
                />
              </div>
            </div>
            
            <div className="mt-4">
              <button
                type="button"
                onClick={addService}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
              >
                Add Service
              </button>
            </div>
          </div>
        </div>
        
        {/* Notes */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Additional Notes</h2>
          <div>
            <textarea
              name="notes"
              value={formData.notes || ''}
              onChange={handleChange}
              rows="4"
              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Add any notes or special instructions here..."
            ></textarea>
          </div>
        </div>
        
        {/* Submit Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:bg-blue-300"
          >
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditBilling; 