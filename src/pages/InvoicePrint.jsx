import React, { useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import billingAPI from '../api/billingAPI';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const InvoicePrint = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const invoiceRef = useRef();
  const [invoice, setInvoice] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Check if data was passed through navigation state
        if (location.state && location.state.billingData) {
          setInvoice(location.state.billingData);
          setLoading(false);
          return;
        }
        
        // If not, fetch it from the API
        const response = await billingAPI.getBillingById(id);
        setInvoice(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching invoice:", error);
        toast.error("Failed to load invoice data");
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, location.state]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const generatePDF = async () => {
    if (!invoiceRef.current) return;
    
    try {
      toast.info("Preparing PDF...");
      
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        logging: false,
        useCORS: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      // Download the PDF
      pdf.save(`Invoice-${invoice.billingId}.pdf`);
      toast.success("PDF generated successfully");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => {
    navigate('/billing');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Invoice not found. Please check the URL and try again.</p>
          <button 
            onClick={handleBack}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Billing
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="print:hidden mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Invoice #{invoice.billingId}</h1>
        <div className="space-x-4">
          <button 
            onClick={handleBack}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Back
          </button>
          <button 
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Print
          </button>
          <button 
            onClick={generatePDF}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Download PDF
          </button>
        </div>
      </div>
      
      <div 
        ref={invoiceRef} 
        className="bg-white shadow-lg p-8 max-w-4xl mx-auto print:shadow-none"
      >
        {/* Hospital Info Header */}
        <div className="flex justify-between items-center border-b pb-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Hospital Dashboard</h2>
            <p className="text-gray-600">123 Medical Center Drive</p>
            <p className="text-gray-600">Healthcare City, HC 12345</p>
            <p className="text-gray-600">Phone: (123) 456-7890</p>
          </div>
          <div className="text-right">
            <h3 className="text-xl font-bold text-gray-800">Invoice</h3>
            <p className="text-gray-600">#{invoice.billingId}</p>
            <p className="text-gray-600">Issue Date: {formatDate(invoice.issueDate)}</p>
            <p className="text-gray-600">Due Date: {formatDate(invoice.dueDate)}</p>
          </div>
        </div>
        
        {/* Patient & Doctor Info */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-gray-700 mb-2">Patient Information</h3>
            <p className="text-gray-800 font-semibold">{invoice.patientName}</p>
            <p className="text-gray-600">Patient ID: {invoice.patientId}</p>
          </div>
          <div>
            <h3 className="font-bold text-gray-700 mb-2">Doctor Information</h3>
            <p className="text-gray-800 font-semibold">{invoice.doctorName}</p>
            <p className="text-gray-600">Doctor ID: {invoice.doctorId}</p>
          </div>
        </div>
        
        {/* Services */}
        <div className="mb-8">
          <h3 className="font-bold text-gray-700 mb-4">Services</h3>
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoice.services.map((service, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{service.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-right">{service.quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-right">{billingAPI.formatCurrency(service.price)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 text-right">
                    {billingAPI.formatCurrency(service.price * service.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50">
                <td colSpan="3" className="px-6 py-4 text-sm font-medium text-gray-900 text-right">Total</td>
                <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">{billingAPI.formatCurrency(invoice.totalAmount)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        {/* Payment Info */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-gray-700 mb-2">Payment Information</h3>
            <p className="text-gray-600">Status: <span className={`font-semibold ${
              invoice.paymentStatus === 'paid' ? 'text-green-600' : 
              invoice.paymentStatus === 'pending' ? 'text-yellow-600' : 
              invoice.paymentStatus === 'overdue' ? 'text-red-600' : 'text-gray-600'
            }`}>{invoice.paymentStatus}</span></p>
            {invoice.paymentDate && (
              <p className="text-gray-600">Payment Date: {formatDate(invoice.paymentDate)}</p>
            )}
            {invoice.paymentMethod && (
              <p className="text-gray-600">Payment Method: {invoice.paymentMethod}</p>
            )}
          </div>
          <div>
            <h3 className="font-bold text-gray-700 mb-2">Additional Information</h3>
            <p className="text-gray-600">{invoice.notes || 'No additional notes'}</p>
          </div>
        </div>
        
        {/* Footer */}
        <div className="border-t pt-4 text-center text-gray-500 text-sm">
          <p>Thank you for choosing Hospital Dashboard for your healthcare needs.</p>
          <p>For billing inquiries, please contact our billing department at billing@hospitaldashboard.com</p>
        </div>
      </div>
    </div>
  );
};

export default InvoicePrint; 