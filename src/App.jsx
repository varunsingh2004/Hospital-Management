import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import PatientRegistration from './pages/PatientRegistration';
import PatientDetails from './components/patients/PatientDetails';
import PatientEdit from './components/patients/PatientEdit';
import Doctors from './pages/Doctors';
import DoctorDetails from './components/doctors/DoctorDetails';
import Appointments from './pages/Appointments';
import NewAppointment from './pages/NewAppointment';
import EditAppointment from './pages/EditAppointment';
import AppointmentDetails from './pages/AppointmentDetails';
import MintExample from './components/MintExample';
import ProtectedRoute from './components/ProtectedRoute';
import ApiTroubleshoot from './pages/ApiTroubleshoot';
import DevLogin from './pages/DevLogin';
import Billing from './pages/Billing';
import NewBilling from './pages/NewBilling';
import BillingDetails from './pages/BillingDetails';
import EditBilling from './pages/EditBilling';
import BillingPayment from './pages/BillingPayment';
import InvoicePrint from './pages/InvoicePrint';
import Reports from './pages/Reports';
import ReportDetails from './pages/ReportDetails';
import CreateReport from './pages/CreateReport';
import EditReport from './pages/EditReport';
import PrintReport from './pages/PrintReport';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dev-login" element={<DevLogin />} />
          <Route path="/register" element={<Register />} />
          <Route path="/troubleshoot" element={<ApiTroubleshoot />} />
          
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/patients" element={<Patients />} />
              <Route path="/patients/register" element={<PatientRegistration />} />
              <Route path="/patients/view/:id" element={<PatientDetails />} />
              <Route path="/patients/edit/:id" element={<PatientEdit />} />
              <Route path="/theme-example" element={<MintExample />} />
              <Route path="/appointments" element={<Appointments />} />
              <Route path="/appointments/new" element={<NewAppointment />} />
              <Route path="/appointments/:id" element={<AppointmentDetails />} />
              <Route path="/appointments/:id/edit" element={<EditAppointment />} />
              <Route path="/doctors" element={<Doctors />} />
              <Route path="/doctors/view/:id" element={<DoctorDetails />} />
              <Route path="/billing" element={<Billing />} />
              <Route path="/billing/new" element={<NewBilling />} />
              <Route path="/billing/:id" element={<BillingDetails />} />
              <Route path="/billing/:id/edit" element={<EditBilling />} />
              <Route path="/billing/:id/payment" element={<BillingPayment />} />
              <Route path="/billing/:id/print" element={<InvoicePrint />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/reports/new" element={<CreateReport />} />
              <Route path="/reports/:id" element={<ReportDetails />} />
              <Route path="/reports/edit/:id" element={<EditReport />} />
              <Route path="/reports/print/:id" element={<PrintReport />} />
            </Route>
          </Route>
          
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      </Router>
    </AuthProvider>
  );
}

export default App;
