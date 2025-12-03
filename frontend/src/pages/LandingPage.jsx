import React from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../images/Logo.png';

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <div className="flex-grow relative overflow-hidden">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(/src/images/bg.png)', 
            backgroundPosition: 'center',
            filter: 'brightness(0.2)'
          }}
        />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-full px-4 py-16">
          {/* Logo */}
          <div className="mb-8 animate-fade-in">
            <div className="w-40 h-40 rounded-full bg-white p-2 shadow-2xl">
              <img className="w-full h-full object-contain scale-100" src={Logo} alt="Maintenance Tracker Logo" />
            </div>
          </div>

          {/* Title and Quote */}
          <div className="text-center mb-12 max-w-3xl animate-slide-up">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-lg">
              Dalubhasaan ng Lungsod ng Lucena
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 italic mb-4">
              "Excellence in Education, Service to the Community"
            </p>
            <p className="text-lg text-white/90">
              Streamline maintenance requests and keep our campus in top condition
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-delay">
            <button
              onClick={() => navigate('/login')}
              className="px-12 py-4 bg-white text-blue-600 rounded-full font-bold text-lg hover:bg-blue-50 transform hover:scale-105 transition-all shadow-2xl"
            >
              Start Now →
            </button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-5xl w-full px-4">
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl text-center">
              <div className="text-4xl mb-3">🔧</div>
              <h3 className="text-white font-bold text-lg mb-2">Quick Reporting</h3>
              <p className="text-blue-100 text-sm">Submit maintenance requests in seconds</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl text-center">
              <div className="text-4xl mb-3">📊</div>
              <h3 className="text-white font-bold text-lg mb-2">Track Progress</h3>
              <p className="text-blue-100 text-sm">Monitor your requests in real-time</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl text-center">
              <div className="text-4xl mb-3">✅</div>
              <h3 className="text-white font-bold text-lg mb-2">Fast Resolution</h3>
              <p className="text-blue-100 text-sm">Efficient maintenance management</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer - Now outside relative positioning */}
      <footer className="relative z-20 bg-gray-900 text-gray-300 py-10 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Brand Info */}
          <div>
            <h2 className="text-xl font-semibold text-white">Maintenance Tracker</h2>
            <p className="mt-3 text-sm leading-6">
              A streamlined platform designed to simplify request submissions, 
              monitor maintenance tasks, and ensure faster response times.
            </p>
          </div>

          {/* Quick Links (non-clickable until login) */}
          <div>
            <h3 className="text-lg font-medium text-white mb-3">Explore</h3>
            <ul className="space-y-2 text-sm">
              <li className="opacity-50 cursor-not-allowed">Dashboard</li>
              <li className="opacity-50 cursor-not-allowed">Maintenance Requests</li>
              <li className="opacity-50 cursor-not-allowed">Staff Portal</li>
              <li className="opacity-50 cursor-not-allowed">Reports</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-medium text-white mb-3">Contact Us</h3>
            <ul className="space-y-2 text-sm">
              <li>Email: support@maintenancetracker.com</li>
              <li>Phone: +63 912 345 6789</li>
              <li>Location: Quezon Province, Philippines</li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-700 mt-8 pt-4 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} Maintenance Tracker. All rights reserved.
        </div>
      </footer>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(30px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 1s ease-out;
        }
        .animate-slide-up {
          animation: slideUp 1s ease-out 0.3s both;
        }
        .animate-fade-in-delay {
          animation: fadeIn 1s ease-out 0.6s both;
        }
      `}</style>
    </div>
  );
}

export default LandingPage;