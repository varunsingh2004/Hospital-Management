import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'react-toastify';
import Spinner from './Spinner';

const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  // Check if the current path is a billing route
  const isBillingRoute = location.pathname.includes('/billing');
  
  if (loading) {
    return <Spinner />;
  }
  
  // For billing routes, we'll warn but still render the route
  // This allows our API interceptors to handle auth errors
  if (!user && isBillingRoute) {
    // Show a warning toast but still render the route
    toast.warning('Authentication required. Some features may be limited.', {
      toastId: 'billing-auth-warning',
      autoClose: 5000
    });
    
    return <Outlet />;
  }
  
  // For non-billing routes, use the standard protection
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute; 