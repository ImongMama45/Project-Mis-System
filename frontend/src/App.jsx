import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import LandingPage from './pages/LandingPage.jsx';
import Register from './components/Register.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import MaintenanceList from './pages/MaintenanceListPage.jsx';
import MaintenanceRequestForm from './pages/MaintenanceRequestForm.jsx';
import MaintenanceCalendar from './components/Calendar.jsx';
import ManagementOverview from './pages/MaintenanceOverviewPage.jsx';
import ComplaintsPage from './pages/ComplaintsPage.jsx';
import BuildingsPage from './pages/BuildingsPage.jsx';
import StaffersPage from './pages/StaffersPage.jsx';
import TrackRequest from './pages/TrackRequestPage.jsx';
import AccountSettingsDashboard from './pages/AccountPage.jsx';
import UserDashboard from './pages/UserDashboardPage.jsx'
import UserAccountSettingsDashboard from './pages/UserAccountPage.jsx'
import UserHome from './pages/UserHome.jsx'
import AnalyticsPage from './pages/AnalyticsPage.jsx';
import NotificationBell from './components/NotifactionBell.jsx';
import NotificationsPage from './pages/NotificationsPage.jsx';
import Logo from './images/Logo.png';
import IntegratedCalendar from './components/IntegratedCalendar.jsx';
import AuthPage from './pages/AuthPage.jsx';

function PrivateRoute({ children, allowedRoles }) {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/auth" />;
  }
  
  if (allowedRoles) {
    const userRole = user?.role?.toLowerCase().trim() || 'user';
    const normalizedAllowedRoles = allowedRoles.map(r => r.toLowerCase().trim());
    
    // Check if user's role matches any allowed role or contains staff
    const hasAccess = normalizedAllowedRoles.some(allowedRole => {
      if (allowedRole.includes('staff') && userRole.includes('staff')) {
        return true;
      }
      return userRole === allowedRole;
    });
    
    if (!hasAccess) {
      console.log('Access denied. User role:', userRole, 'Allowed:', allowedRoles);
      return <Navigate to="/home" />;
    }
  }
  
  return children;
}

function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? children : <Navigate to="/home" />;
}

// Public access - no auth required
function PublicPage({ children }) {
  return children;
}

function Sidebar() {
  const { isAuthenticated, logout, user } = useAuth();
  const location = useLocation();


  const isActive = (path) => location.pathname === path;

  // Role-based navigation configuration
  const getNavigationItems = () => {
    // ✅ FIXED: Handle role as object or string
    const roleObj = user?.role;
    const role = (typeof roleObj === 'object' ? roleObj.name : roleObj || 'user').toLowerCase().trim();
    
    console.log('Current user role:', role); // Debug log
        
    // Admin navigation
    if (role === 'admin' || role === 'administrator') {
      return [
        { path: '/home', label: 'Dashboard' },
        { path: '/management', label: 'Management' },
        { path: '/analytics', label: 'Analytics' },
        { path: '/account', label: 'Account' }
      ];
    }
    
    // Staff navigation (matches: staff, maintenance staff)
    if (role === 'staff' || role === 'maintenance staff' || role.includes('staff')) {
      return [
        { path: '/dashboard', label: 'Assigned Request' },
        { path: '/calendar', label: 'Calendar' },
        { path: "/maintenance/buildings", label: 'Buildings' },
        { path: '/account', label: 'Account' },
      ];
    }
    
    // User navigation (default)
    return [
      { path: '/user-dashboard', label: 'Dashboard' },
      { path: '/public-home', label: 'Home' },
      { path: '/track-requests', label: 'Track Requests' },
      { path: '/submit-request', label: '+ Submit Request' }
    ];
  };

  const navigationItems = getNavigationItems();
  
  // ✅ FIXED: Get display role safely
  const displayRole = user?.role?.name || user?.role || 'Staff';

  return (
    <nav className="fixed left-0 top-0 w-60 h-screen bg-[#0a2540] text-white p-6 flex flex-col justify-between shadow-xl/30">
      {/* Logo */}
      <div>
        <div className="flex flex-col items-center mb-8">
          <div className="w-32 h-32 rounded-full bg-white p-4 mb-4 shadow-lg">
            <img
              className="w-full h-full object-contain"
              src={Logo}
              alt="Maintenance Tracker Logo"
            />
          </div>
          <h3 className="text-lg font-medium">Hi, {user?.username || 'User'}</h3>
          {/* ✅ FIXED: Display role safely */}
          <p className="text-sm text-gray-300 capitalize">{displayRole}</p>
        </div>

        {/* Menu Items with Active Border */}
        <div className="space-y-2">
          {/* Regular navigation items */}
          {navigationItems.map((item) => {
            if (item.path === '/submit-request') return null;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`block px-6 py-3 rounded-xl transition-all text-center font-medium
                  ${isActive(item.path)
                    ? 'bg-transparent border-2 border-orange-500 text-white'
                    : 'border-2 border-transparent hover:bg-white/10 hover:border-orange-300 text-white'
                  }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
        
        <div className="pt-4">
          {navigationItems
            .filter(item => item.path === '/submit-request')
            .map(item => (
              <Link
                key={item.path}
                to={item.path}
                className="block px-6 py-3 rounded-xl transition-all text-center font-medium bg-green-600 text-white hover:bg-green-700 border-2 border-green-700"
              >
                {item.label}
              </Link>
            ))}
        </div>
      </div>
    </nav>
  );
}

function RoleBasedDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  React.useEffect(() => {
    const role = user?.role?.toLowerCase().trim() || 'user';
    
    // Redirect users to their specific dashboard
    if (role === 'user') {
      navigate('/public-home', { replace: true });
    }
    // Admin and staff stay on /home
    else if (role === 'staff') {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);
  
  return <AdminDashboard />;
}

function AppContent() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const hideSidebarRoutes = ['/', '/landing', '/login', '/register'];
  const shouldShowSidebar =
  isAuthenticated && !hideSidebarRoutes.includes(location.pathname);

  return (
    <div className="flex min-h-screen">
      {shouldShowSidebar && <Sidebar />}
      <div className={`flex-1 ${shouldShowSidebar  ? 'ml-60' : 'ml-0'} transition-all`}>
        <Routes>
          {/* Landing Page - Public */}
          <Route
            path="/"
            element={
              <PublicPage>
                <LandingPage />
              </PublicPage>
            }
          />
          
          {/* Auth Routes */}
          <Route
            path="/auth"
            element={
              <PublicRoute>
                <AuthPage />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <Register />
            }
          />
          
          {/* Common Dashboard */}
          <Route
            path="/home"
            element={
              <PrivateRoute>
                <RoleBasedDashboard />
              </PrivateRoute>
            }
          />
          
          {/* Staff Routes - Keep /dashboard for backward compatibility */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute allowedRoles={['staff', 'maintenance staff', 'admin', 'administrator']}>
                <MaintenanceList />
              </PrivateRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <PrivateRoute>
                <NotificationsPage/>
              </PrivateRoute>
            }
          />
          <Route
            path="/user-dashboard"
            element={
              <PrivateRoute allowedRoles={['user']}>
                <UserDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/user-accounts/"
            element={
              <PrivateRoute allowedRoles={['user']}>
                <UserAccountSettingsDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/assigned-requests"
            element={
              <PrivateRoute allowedRoles={['staff', 'maintenance staff', 'admin', 'administrator']}>
                <MaintenanceList />
              </PrivateRoute>
            }
          />
          
          {/* Admin Routes */}
          <Route
            path="/management"
            element={
              <PrivateRoute allowedRoles={['admin', 'administrator']}>
                <ManagementOverview/>
              </PrivateRoute>
            }
          />
        

          <Route
            path="/analytics"
            element={
              <PrivateRoute allowedRoles={['admin', 'administrator']}>
                <AnalyticsPage/>
              </PrivateRoute>
            }
          />
          
          {/* User Routes */}
          <Route
            path="/public-home"
            element={
              <PrivateRoute>
                <UserHome/>
              </PrivateRoute>
            }
          />
          <Route
            path="/track-requests"
            element={
              <PrivateRoute>
                <TrackRequest/>
              </PrivateRoute>
            }
          />
          
          {/* Shared Routes */}
          <Route
            path="/account"
            element={
              <PrivateRoute>
                <AccountSettingsDashboard/>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/calendar"
            element={
              <PrivateRoute>
                <MaintenanceCalendar />
              </PrivateRoute>
            }
          />
          <Route
            path="/maintenance/calendar-admin"
            element={
              <PrivateRoute allowedRoles={['staff', 'maintenance staff', 'admin', 'administrator']}>
                <IntegratedCalendar />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin-dashboard"
            element={
              <PrivateRoute allowedRoles={['staff', 'maintenance staff', 'admin', 'administrator']}>
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/submit-request"
            element={
              <PrivateRoute>
                <MaintenanceRequestForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/maintenance/buildings"
            element={
              <PrivateRoute>
                <BuildingsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/maintenance/staffers"
            element={
              <PrivateRoute>
                <StaffersPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/maintenance/complaints"
            element={
              <PrivateRoute>
                <ComplaintsPage />
              </PrivateRoute>
            }
          />
          
          <Route path="/landing" element={<PublicPage><LandingPage /></PublicPage>} />
            
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;