import React from 'react';
import { useNavigate } from 'react-router-dom';

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(/path-to-your-school-image.jpg)', // Replace with your school image
          filter: 'brightness(0.7)'
        }}
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 to-purple-900/80" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {/* Logo */}
        <div className="mb-8 animate-fade-in">
          <div className="w-40 h-40 rounded-full bg-white p-6 shadow-2xl">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="#3b82f6"/>
              <text x="50" y="35" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">DLL</text>
              <text x="50" y="55" textAnchor="middle" fill="white" fontSize="12">MAINT</text>
              <text x="50" y="70" textAnchor="middle" fill="white" fontSize="12">TRACKER</text>
            </svg>
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
          <button
            onClick={() => navigate('/public-submit')}
            className="px-12 py-4 bg-transparent border-2 border-white text-white rounded-full font-bold text-lg hover:bg-white/10 transform hover:scale-105 transition-all"
          >
            Submit Complaint
          </button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-5xl">
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