import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  Building2, 
  BarChart3, 
  Calendar, 
  FileText, 
  Users, 
  Mail, 
  Phone, 
  MapPin, 
  Github, 
  Twitter, 
  Linkedin,
  ExternalLink,
  Shield,
  Clock,
  CheckCircle
} from 'lucide-react';

function Footer() {
  const { isAuthenticated, user } = useAuth();
  const currentYear = new Date().getFullYear();

  // Determine user role
  const role = user?.role?.toLowerCase().trim() || 'user';
  const isAdmin = role === 'admin' || role === 'administrator';
  const isStaff = role === 'staff' || role === 'maintenance staff';
  const isUser = role === 'user';

  // Role-based quick links
  const getQuickLinks = () => {
    if (!isAuthenticated) {
      return [
        { name: 'Login', path: '/auth', icon: Shield },
        { name: 'About', path: '#about', icon: FileText },
        { name: 'Features', path: '#features', icon: CheckCircle },
        { name: 'Contact', path: '#contact', icon: Mail },
      ];
    }

    if (isAdmin) {
      return [
        { name: 'Admin Dashboard', path: '/admin-dashboard', icon: BarChart3 },
        { name: 'Management', path: '/management', icon: Users },
        { name: 'Analytics', path: '/analytics', icon: BarChart3 },
        { name: 'Calendar', path: '/maintenance/calendar-admin', icon: Calendar },
        { name: 'All Requests', path: '/maintenance/complaints', icon: FileText },
      ];
    }

    if (isStaff) {
      return [
        { name: 'My Tasks', path: '/dashboard', icon: CheckCircle },
        { name: 'Calendar', path: '/calendar', icon: Calendar },
        { name: 'Account', path: '/account', icon: Users },
        { name: 'Notifications', path: '/notifications', icon: Clock },
      ];
    }

    // Regular user
    return [
      { name: 'Home', path: '', icon: Building2 },
      { name: 'Submit Request', path: '', icon: FileText },
      { name: 'Track Requests', path: '', icon: Clock },
      { name: 'Buildings', path: '', icon: Building2 },
    ];
  };

  const quickLinks = getQuickLinks();

  // Resources links
  const resourceLinks = [
    { name: 'Buildings', path: '', icon: Building2, requireAuth: false },
    { name: 'Staff Portal', path: '', icon: Users, requireAuth: true },
    { name: 'Calendar', path: isStaff || isAdmin ? '' : '/calendar', icon: Calendar, requireAuth: true },
    { name: 'Analytics', path: '', icon: BarChart3, requireAuth: true, adminOnly: true },
  ];

  const filteredResources = resourceLinks.filter(link => {
    if (!isAuthenticated && link.requireAuth) return false;
    if (link.adminOnly && !isAdmin) return false;
    return true;
  });

  return (
    <footer className="relative z-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-300">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">
                Maintenance<br />Tracker
              </h2>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              A streamlined platform designed to simplify request submissions, 
              monitor maintenance tasks, and ensure faster response times.
            </p>
            
            {/* Social Links */}
            <div className="flex gap-3 pt-2">
              <a 
                href="#" 
                className="w-9 h-9 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-all transform hover:scale-110"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a 
                href="#" 
                className="w-9 h-9 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-all transform hover:scale-110"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a 
                href="#" 
                className="w-9 h-9 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-all transform hover:scale-110"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              Quick Links
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => {
                const Icon = link.icon;
                return (
                  <li key={index}>
                    {link.path.startsWith('#') ? (
                      <a
                        href={link.path}
                        className="flex items-center gap-2 text-sm text-gray-400 hover:text-blue-400 transition-colors group"
                      >
                        <Icon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        {link.name}
                      </a>
                    ) : (
                      <Link
                        to={link.path}
                        className="flex items-center gap-2 text-sm text-gray-400 hover:text-blue-400 transition-colors group"
                      >
                        <Icon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        {link.name}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Resources
            </h3>
            <ul className="space-y-3">
              {filteredResources.map((link, index) => {
                const Icon = link.icon;
                return (
                  <li key={index}>
                    <Link
                      to={link.path}
                      className="flex items-center gap-2 text-sm text-gray-400 hover:text-blue-400 transition-colors group"
                    >
                      <Icon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      {link.name}
                    </Link>
                  </li>
                );
              })}
              {!isAuthenticated && (
                <>
                  <li className="flex items-center gap-2 text-sm text-gray-600 cursor-not-allowed">
                    <Users className="w-4 h-4" />
                    <span>Staff Portal</span>
                    <span className="text-xs bg-gray-800 px-2 py-0.5 rounded">Login Required</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600 cursor-not-allowed">
                    <BarChart3 className="w-4 h-4" />
                    <span>Analytics</span>
                    <span className="text-xs bg-gray-800 px-2 py-0.5 rounded">Login Required</span>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Contact Us
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3 text-gray-400 hover:text-blue-400 transition-colors group">
                <Mail className="w-4 h-4 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <a href="mailto:support@maintenancetracker.com" className="hover:underline">
                  support@maintenancetracker.com
                </a>
              </li>
              <li className="flex items-start gap-3 text-gray-400 hover:text-blue-400 transition-colors group">
                <Phone className="w-4 h-4 mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                <a href="tel:+639123456789" className="hover:underline">
                  +63 912 345 6789
                </a>
              </li>
              <li className="flex items-start gap-3 text-gray-400">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>
                  Dalubhasaan ng Lungsod ng Lucena<br />
                  Quezon Province, Philippines
                </span>
              </li>
            </ul>

            {/* Status Badge */}
            <div className="mt-4 inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-400 font-medium">System Operational</span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 my-8"></div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-500 text-center md:text-left">
            © {currentYear} Maintenance Tracker. All rights reserved.
            {isAuthenticated && user && (
              <span className="ml-2 text-gray-600">
                | Logged in as <span className="text-blue-400 font-medium">{user.username}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-6 text-xs text-gray-500">
            <a href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</a>
            <span className="text-gray-700">•</span>
            <a href="#" className="hover:text-blue-400 transition-colors">Terms of Service</a>
            <span className="text-gray-700">•</span>
            <a href="#" className="hover:text-blue-400 transition-colors">Help Center</a>
          </div>
        </div>

        {/* User Role Badge (if authenticated) */}
        {isAuthenticated && user && (
          <div className="mt-6 flex justify-center">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium ${
              isAdmin 
                ? 'bg-purple-500/10 border border-purple-500/20 text-purple-400' 
                : isStaff
                ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400'
                : 'bg-gray-500/10 border border-gray-500/20 text-gray-400'
            }`}>
              <Shield className="w-3 h-3" />
              <span>
                {isAdmin ? 'Administrator Access' : isStaff ? 'Maintenance Staff' : 'User Account'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Decorative Bottom Border */}
      <div className="h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>
    </footer>
  );
}

export default Footer