import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import billingAPI from '../api/billingAPI';

const BillingPayment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [billing, setBilling] = useState(null);
  
  const [paymentData, setPaymentData] = useState({
    paymentMethod: '',
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    paymentDate: new Date().toISOString().split('T')[0],
    amount: 0,
    notes: '',
  });
  
  useEffect(() => {
    fetchBillingDetails();
  }, [id]);
  
  const fetchBillingDetails = async () => {
    try {
      setLoading(true);
      const response = await billingAPI.getBillingById(id);
      setBilling(response.data);
      
      // Initialize payment amount with total amount from billing
      setPaymentData(prev => ({
        ...prev,
        amount: response.data.totalAmount
      }));
    } catch (error) {
      console.error('Error fetching billing details:', error);
      toast.error('Failed to load billing details');
    } finally {
      setLoading(false);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPaymentData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (billing.paymentStatus === 'paid') {
      toast.warning('This invoice has already been paid');
      return;
    }
    
    try {
      setProcessing(true);
      
      // Validate form data
      if (paymentData.paymentMethod === 'credit_card' || paymentData.paymentMethod === 'debit_card') {
        if (!paymentData.cardNumber || !paymentData.cardName || !paymentData.expiryDate || !paymentData.cvv) {
          toast.error('Please fill in all card details');
          setProcessing(false);
          return;
        }
      }
      
      // Process the payment
      const paymentInfo = {
        paymentStatus: 'paid',
        paymentMethod: paymentData.paymentMethod,
        paymentDate: new Date(paymentData.paymentDate).toISOString(),
        notes: paymentData.notes
      };
      
      // Call API to update payment status
      await billingAPI.updatePaymentStatus(id, paymentInfo);
      
      toast.success('Payment processed successfully');
      
      // Show completion message then redirect
      setTimeout(() => {
        navigate(`/billing/${id}`);
      }, 2000);
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Failed to process payment');
    } finally {
      setProcessing(false);
    }
  };
  
  // Formatted date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
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
  
  if (billing.paymentStatus === 'paid') {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-2">Invoice Already Paid</h2>
          <p>This invoice has already been marked as paid on {formatDate(billing.paymentDate)}.</p>
          <div className="mt-4">
            <Link to={`/billing/${id}`} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none">
              View Invoice Details
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  if (billing.paymentStatus === 'cancelled') {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-100 border border-gray-400 text-gray-700 px-6 py-4 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-2">Invoice Cancelled</h2>
          <p>This invoice has been cancelled and is no longer available for payment.</p>
          <div className="mt-4">
            <Link to={`/billing/${id}`} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none">
              View Invoice Details
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Process Payment</h1>
        <Link to={`/billing/${id}`} className="text-blue-600 hover:text-blue-800">
          Back to Invoice
        </Link>
      </div>
      
      {/* Invoice Summary */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Invoice Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-500">Invoice Number</p>
            <p className="text-lg font-medium">{billing.billingId}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Patient</p>
            <p className="text-lg font-medium">{billing.patientName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Due Date</p>
            <p className="text-lg font-medium">{formatDate(billing.dueDate)}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-gray-500">Services</p>
            <p className="text-base">
              {billing.services.map(s => s.name).join(', ')}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Amount</p>
            <p className="text-xl font-bold text-green-600">{billingAPI.formatCurrency(billing.totalAmount)}</p>
          </div>
        </div>
      </div>
      
      {/* Payment Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Payment Method</h2>
          
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Payment Method</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <label className={`
                  flex items-center p-3 border rounded-lg cursor-pointer
                  ${paymentData.paymentMethod === 'credit_card' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
                `}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="credit_card"
                    checked={paymentData.paymentMethod === 'credit_card'}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Credit Card</span>
                </label>
                
                <label className={`
                  flex items-center p-3 border rounded-lg cursor-pointer
                  ${paymentData.paymentMethod === 'debit_card' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
                `}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="debit_card"
                    checked={paymentData.paymentMethod === 'debit_card'}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Debit Card</span>
                </label>
                
                <label className={`
                  flex items-center p-3 border rounded-lg cursor-pointer
                  ${paymentData.paymentMethod === 'bank_transfer' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
                `}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="bank_transfer"
                    checked={paymentData.paymentMethod === 'bank_transfer'}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Bank Transfer</span>
                </label>
                
                <label className={`
                  flex items-center p-3 border rounded-lg cursor-pointer
                  ${paymentData.paymentMethod === 'cash' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
                `}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash"
                    checked={paymentData.paymentMethod === 'cash'}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Cash</span>
                </label>
                
                <label className={`
                  flex items-center p-3 border rounded-lg cursor-pointer
                  ${paymentData.paymentMethod === 'insurance' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
                `}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="insurance"
                    checked={paymentData.paymentMethod === 'insurance'}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Insurance</span>
                </label>
                
                <label className={`
                  flex items-center p-3 border rounded-lg cursor-pointer
                  ${paymentData.paymentMethod === 'check' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
                `}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="check"
                    checked={paymentData.paymentMethod === 'check'}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Check</span>
                </label>
              </div>
            </div>
          </div>
          
          {/* Credit Card or Debit Card Details */}
          {(paymentData.paymentMethod === 'credit_card' || paymentData.paymentMethod === 'debit_card') && (
            <div className="mt-6 border-t border-gray-200 pt-6">
              <h3 className="text-base font-medium text-gray-800 mb-4">Card Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                  <input
                    type="text"
                    id="cardNumber"
                    name="cardNumber"
                    value={paymentData.cardNumber}
                    onChange={handleChange}
                    placeholder="**** **** **** ****"
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    maxLength="19"
                  />
                </div>
                
                <div>
                  <label htmlFor="cardName" className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
                  <input
                    type="text"
                    id="cardName"
                    name="cardName"
                    value={paymentData.cardName}
                    onChange={handleChange}
                    placeholder="Name on card"
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                  <input
                    type="text"
                    id="expiryDate"
                    name="expiryDate"
                    value={paymentData.expiryDate}
                    onChange={handleChange}
                    placeholder="MM/YY"
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    maxLength="5"
                  />
                </div>
                
                <div>
                  <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                  <input
                    type="text"
                    id="cvv"
                    name="cvv"
                    value={paymentData.cvv}
                    onChange={handleChange}
                    placeholder="***"
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    maxLength="4"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Bank Transfer Details */}
          {paymentData.paymentMethod === 'bank_transfer' && (
            <div className="mt-6 border-t border-gray-200 pt-6">
              <h3 className="text-base font-medium text-gray-800 mb-4">Bank Transfer Details</h3>
              <div className="bg-blue-50 p-4 rounded-md">
                <p className="text-sm text-gray-800 mb-2">Please transfer the exact amount to the following account:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500">Bank Name</p>
                    <p className="text-sm font-medium">Hospital Trust Bank</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Account Name</p>
                    <p className="text-sm font-medium">Hospital Dashboard Inc.</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Account Number</p>
                    <p className="text-sm font-medium">1234567890</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Routing Number</p>
                    <p className="text-sm font-medium">987654321</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-xs text-gray-500">Reference</p>
                    <p className="text-sm font-medium">Invoice #{billing.billingId}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Insurance Details */}
          {paymentData.paymentMethod === 'insurance' && (
            <div className="mt-6 border-t border-gray-200 pt-6">
              <h3 className="text-base font-medium text-gray-800 mb-4">Insurance Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="insuranceProvider" className="block text-sm font-medium text-gray-700 mb-1">Insurance Provider</label>
                  <select
                    id="insuranceProvider"
                    name="insuranceProvider"
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">Select provider</option>
                    <option value="aetna">Aetna</option>
                    <option value="bluecross">BlueCross BlueShield</option>
                    <option value="cigna">Cigna</option>
                    <option value="humana">Humana</option>
                    <option value="kaiser">Kaiser Permanente</option>
                    <option value="medicare">Medicare</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="policyNumber" className="block text-sm font-medium text-gray-700 mb-1">Policy Number</label>
                  <input
                    type="text"
                    id="policyNumber"
                    name="policyNumber"
                    placeholder="Enter policy number"
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* Payment Details */}
          <div className="mt-6 border-t border-gray-200 pt-6">
            <h3 className="text-base font-medium text-gray-800 mb-4">Payment Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="paymentDate" className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
                <input
                  type="date"
                  id="paymentDate"
                  name="paymentDate"
                  value={paymentData.paymentDate}
                  onChange={handleChange}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">Amount to Pay</label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={paymentData.amount}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Payment Notes (Optional)</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={paymentData.notes}
                  onChange={handleChange}
                  rows="3"
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Add any notes about this payment"
                ></textarea>
              </div>
            </div>
          </div>
        </div>
        
        {/* Submit Button */}
        <div className="flex justify-end space-x-3">
          <Link
            to={`/billing/${id}`}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={processing || !paymentData.paymentMethod}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none disabled:bg-green-300"
          >
            {processing ? 'Processing...' : 'Process Payment'}
          </button>
        </div>
      </form>
      
      {/* Payment Security Notice */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p className="flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          Secure Payment Processing
        </p>
        <p className="mt-1">
          All payment information is encrypted and processed securely.
        </p>
      </div>
    </div>
  );
};

export default BillingPayment; 