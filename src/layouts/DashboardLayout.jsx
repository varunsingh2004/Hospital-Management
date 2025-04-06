import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Auto-collapse sidebar on smaller screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      } else {
        setSidebarCollapsed(false);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Overlay for mobile view */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div 
        className={`fixed md:relative z-30 h-full transition-all duration-300 ease-in-out
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} 
                    ${sidebarCollapsed && !sidebarHovered ? 'w-20' : 'w-64'} 
                    bg-gradient-to-b from-indigo-800 to-indigo-900 text-white shadow-xl`}
        onMouseEnter={() => setSidebarHovered(true)}
        onMouseLeave={() => setSidebarHovered(false)}
      >
        <div className={`flex items-center ${sidebarCollapsed && !sidebarHovered ? 'justify-center' : 'justify-between'} p-4 border-b border-indigo-700`}>
          {(!sidebarCollapsed || sidebarHovered) && (
            <h1 className="text-xl font-bold text-white">DANPHEH</h1>
          )}
          {sidebarCollapsed && !sidebarHovered && (
            <h1 className="text-xl font-bold text-white">D</h1>
          )}
          
          <div className="flex items-center">
            {(!sidebarCollapsed || sidebarHovered) && (
              <button 
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)} 
                className="text-indigo-200 hover:text-white transition-colors duration-200 hidden md:block mr-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  {sidebarCollapsed ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                  )}
                </svg>
              </button>
            )}

            <button 
              onClick={() => setSidebarOpen(false)} 
              className="text-indigo-200 hover:text-white transition-colors duration-200 md:hidden"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <nav className="p-4">
          <ul className="space-y-3">
            <li>
              <Link 
                to="/dashboard" 
                className={`flex items-center ${sidebarCollapsed && !sidebarHovered ? 'justify-center' : ''} 
                           p-2 rounded-lg transition-all duration-200 group
                           ${isActive('/dashboard') 
                             ? 'bg-indigo-700 text-white shadow-md' 
                             : 'text-indigo-100 hover:bg-indigo-700 hover:text-white'}`}
              >
                <svg className={`w-6 h-6 ${sidebarCollapsed && !sidebarHovered ? '' : 'mr-3'} transition-colors duration-200`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                {(!sidebarCollapsed || sidebarHovered) && (
                  <span className="transition-opacity duration-200">Dashboard</span>
                )}
                {sidebarCollapsed && !sidebarHovered && (
                  <span className="absolute left-full ml-6 px-2 py-1 rounded-md bg-indigo-800 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none">
                    Dashboard
                  </span>
                )}
              </Link>
            </li>
            <li>
              <Link 
                to="/patients" 
                className={`flex items-center ${sidebarCollapsed && !sidebarHovered ? 'justify-center' : ''} 
                           p-2 rounded-lg transition-all duration-200 group
                           ${isActive('/patients') 
                             ? 'bg-indigo-700 text-white shadow-md' 
                             : 'text-indigo-100 hover:bg-indigo-700 hover:text-white'}`}
              >
                <svg className={`w-6 h-6 ${sidebarCollapsed && !sidebarHovered ? '' : 'mr-3'} transition-colors duration-200`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {(!sidebarCollapsed || sidebarHovered) && (
                  <span className="transition-opacity duration-200">Patients</span>
                )}
                {sidebarCollapsed && !sidebarHovered && (
                  <span className="absolute left-full ml-6 px-2 py-1 rounded-md bg-indigo-800 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none">
                    Patients
                  </span>
                )}
              </Link>
            </li>
            <li>
              <Link 
                to="/appointments" 
                className={`flex items-center ${sidebarCollapsed && !sidebarHovered ? 'justify-center' : ''} 
                           p-2 rounded-lg transition-all duration-200 group
                           ${isActive('/appointments') 
                             ? 'bg-indigo-700 text-white shadow-md' 
                             : 'text-indigo-100 hover:bg-indigo-700 hover:text-white'}`}
              >
                <svg className={`w-6 h-6 ${sidebarCollapsed && !sidebarHovered ? '' : 'mr-3'} transition-colors duration-200`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {(!sidebarCollapsed || sidebarHovered) && (
                  <span className="transition-opacity duration-200">Appointments</span>
                )}
                {sidebarCollapsed && !sidebarHovered && (
                  <span className="absolute left-full ml-6 px-2 py-1 rounded-md bg-indigo-800 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none">
                    Appointments
                  </span>
                )}
              </Link>
            </li>
            <li>
              <Link 
                to="/doctors" 
                className={`flex items-center ${sidebarCollapsed && !sidebarHovered ? 'justify-center' : ''} 
                           p-2 rounded-lg transition-all duration-200 group
                           ${isActive('/doctors') 
                             ? 'bg-indigo-700 text-white shadow-md' 
                             : 'text-indigo-100 hover:bg-indigo-700 hover:text-white'}`}
              >
                <svg className={`w-6 h-6 ${sidebarCollapsed && !sidebarHovered ? '' : 'mr-3'} transition-colors duration-200`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {(!sidebarCollapsed || sidebarHovered) && (
                  <span className="transition-opacity duration-200">Doctors</span>
                )}
                {sidebarCollapsed && !sidebarHovered && (
                  <span className="absolute left-full ml-6 px-2 py-1 rounded-md bg-indigo-800 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none">
                    Doctors
                  </span>
                )}
              </Link>
            </li>
            <li>
              <Link 
                to="/billing" 
                className={`flex items-center ${sidebarCollapsed && !sidebarHovered ? 'justify-center' : ''} 
                           p-2 rounded-lg transition-all duration-200 group
                           ${isActive('/billing') 
                             ? 'bg-indigo-700 text-white shadow-md' 
                             : 'text-indigo-100 hover:bg-indigo-700 hover:text-white'}`}
              >
                <svg className={`w-6 h-6 ${sidebarCollapsed && !sidebarHovered ? '' : 'mr-3'} transition-colors duration-200`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {(!sidebarCollapsed || sidebarHovered) && (
                  <span className="transition-opacity duration-200">Billing</span>
                )}
                {sidebarCollapsed && !sidebarHovered && (
                  <span className="absolute left-full ml-6 px-2 py-1 rounded-md bg-indigo-800 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none">
                    Billing
                  </span>
                )}
              </Link>
            </li>
            <li>
              <Link 
                to="/reports" 
                className={`flex items-center ${sidebarCollapsed && !sidebarHovered ? 'justify-center' : ''} 
                           p-2 rounded-lg transition-all duration-200 group
                           ${isActive('/reports') 
                             ? 'bg-indigo-700 text-white shadow-md' 
                             : 'text-indigo-100 hover:bg-indigo-700 hover:text-white'}`}
              >
                <svg className={`w-6 h-6 ${sidebarCollapsed && !sidebarHovered ? '' : 'mr-3'} transition-colors duration-200`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {(!sidebarCollapsed || sidebarHovered) && (
                  <span className="transition-opacity duration-200">Reports</span>
                )}
                {sidebarCollapsed && !sidebarHovered && (
                  <span className="absolute left-full ml-6 px-2 py-1 rounded-md bg-indigo-800 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none">
                    Reports
                  </span>
                )}
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Header */}
        <header className="bg-white shadow-sm z-10">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)} 
                className="md:hidden text-gray-700 hover:text-indigo-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h2 className="text-xl font-semibold text-indigo-900">Hospital Dashboard</h2>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <span className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-800 font-semibold mr-2">
                    {user?.name ? user.name[0] : 'A'}
                  </div>
                  <span className="text-gray-700 hidden sm:inline-block">{user?.name || 'Admin'}</span>
                </span>
              </div>
              <button 
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout; 