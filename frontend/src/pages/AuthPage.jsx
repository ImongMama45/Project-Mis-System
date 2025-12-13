import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Logo from '../images/Logo.png';

function AuthPage() {
  const navigate = useNavigate();
  const { login, register, user } = useAuth();

  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
    first_name: '',
    last_name: '',
    role: 'user',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(formData.username, formData.password);

    if (result.success) {
      const userData = JSON.parse(localStorage.getItem('user'));
      const role = userData?.role?.toLowerCase() || 'user';

      if (role === 'admin' || role.includes('staff')) {
        navigate('/home');
      } else {
        navigate('/public-home');
      }
    } else {
      setError(result.error || 'Login failed');
    }

    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.password2) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    const result = await register(formData);

    if (result.success) {
      alert('Registration successful! Please login.');
      setMode('login');
      setFormData({
        username: '',
        email: '',
        password: '',
        password2: '',
        first_name: '',
        last_name: '',
        role: 'user',
      });
    } else {
      setError(result.error || 'Registration failed');
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Left Side - Image Panel */}
      <div 
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        style={{
          backgroundImage: "url(/src/images/bg.png)",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/85 to-gray-900/95"></div>
        
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12 w-full">
          <div className="w-48 h-48 rounded-full bg-white/10 backdrop-blur-sm p-4 shadow-2xl mb-8 animate-fade-in">
            <img
              src={Logo}
              alt="Maintenance Tracker Logo"
              className="w-full h-full object-contain"
            />
          </div>
          
          <h1 className="text-4xl font-bold mb-4 text-center animate-slide-up">
            Maintenance Tracker
          </h1>
          <p className="text-xl text-center text-blue-100 max-w-md animate-slide-up">
            Streamline your maintenance requests and keep track of all your facility needs
          </p>
          
          <div className="mt-12 grid grid-cols-3 gap-8 animate-fade-in">
            <div className="text-center">
              <div className="text-3xl font-bold">1000+</div>
              <div className="text-sm text-blue-200">Requests Handled</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">98%</div>
              <div className="text-sm text-blue-200">Satisfaction Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">24/7</div>
              <div className="text-sm text-blue-200">Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="w-24 h-24 rounded-full bg-white p-2 shadow-lg">
              <img src={Logo} alt="Logo" className="w-full h-full object-contain" />
            </div>
          </div>

          {/* Form Container */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 relative overflow-hidden">
            {/* Sliding Indicator */}
            <div className="relative mb-8">
              <div className="flex border-2 border-gray-200 rounded-xl overflow-hidden bg-gray-50 relative">
                {/* Sliding Background */}
                <div
                  className="absolute top-0 bottom-0 w-1/2 bg-blue-500 rounded-lg transition-transform duration-300 ease-in-out"
                  style={{
                    transform: mode === 'register' ? 'translateX(100%)' : 'translateX(0)',
                  }}
                ></div>
                
                {/* Buttons */}
                <button
                  className={`relative z-10 w-1/2 py-3 font-semibold transition-colors duration-300 ${
                    mode === 'login' ? 'text-white' : 'text-gray-600'
                  }`}
                  onClick={() => {
                    setMode('login');
                    setError('');
                  }}
                >
                  Login
                </button>
                <button
                  className={`relative z-10 w-1/2 py-3 font-semibold transition-colors duration-300 ${
                    mode === 'register' ? 'text-white' : 'text-gray-600'
                  }`}
                  onClick={() => {
                    setMode('register');
                    setError('');
                  }}
                >
                  Register
                </button>
              </div>
            </div>

            {/* Welcome Text */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {mode === 'login' ? 'Welcome Back!' : 'Create Account'}
              </h2>
              <p className="text-gray-600 text-sm">
                {mode === 'login' 
                  ? 'Sign in to continue to Maintenance Tracker' 
                  : 'Register to get started with us'}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 border border-red-200 animate-shake">
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Form Container with Slide Animation */}
            <div className="relative overflow-hidden">
              <div
                className="transition-transform duration-500 ease-in-out"
                style={{
                  transform: mode === 'register' ? 'translateX(-100%)' : 'translateX(0)',
                }}
              >
                <div className="flex">
                  {/* LOGIN FORM */}
                  <div className="w-full flex-shrink-0">
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div>
                        <label className="block mb-2 text-gray-700 font-medium text-sm">
                          Username
                        </label>
                        <input
                          name="username"
                          placeholder="Enter your username"
                          required
                          value={formData.username}
                          onChange={handleChange}
                          autoComplete="username"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      </div>

                      <div>
                        <label className="block mb-2 text-gray-700 font-medium text-sm">
                          Password
                        </label>
                        <input
                          name="password"
                          type="password"
                          placeholder="Enter your password"
                          required
                          value={formData.password}
                          onChange={handleChange}
                          autoComplete="current-password"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-semibold mt-6 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      >
                        {loading ? (
                          <span className="flex items-center justify-center">
                            <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                            </svg>
                            Signing in...
                          </span>
                        ) : (
                          'Sign In'
                        )}
                      </button>
                    </form>
                  </div>

                  {/* REGISTER FORM */}
                  <div className="w-full flex-shrink-0 pl-4">
                    <form onSubmit={handleRegister} className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block mb-1 text-gray-700 font-medium text-sm">
                            First Name
                          </label>
                          <input
                            name="first_name"
                            placeholder="First Name"
                            required
                            value={formData.first_name}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                          />
                        </div>
                        <div>
                          <label className="block mb-1 text-gray-700 font-medium text-sm">
                            Last Name
                          </label>
                          <input
                            name="last_name"
                            placeholder="Last Name"
                            required
                            value={formData.last_name}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block mb-1 text-gray-700 font-medium text-sm">
                          Username
                        </label>
                        <input
                          name="username"
                          placeholder="Choose a username"
                          required
                          value={formData.username}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                        />
                      </div>

                      <div>
                        <label className="block mb-1 text-gray-700 font-medium text-sm">
                          Email
                        </label>
                        <input
                          name="email"
                          type="email"
                          placeholder="your.email@example.com"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                        />
                      </div>

                      {user?.role === 'admin' && (
                        <div>
                          <label className="block mb-1 text-gray-700 font-medium text-sm">
                            Role
                          </label>
                          <select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm bg-white"
                          >
                            <option value="user">User</option>
                            <option value="staff">Staff</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>
                      )}

                      <div>
                        <label className="block mb-1 text-gray-700 font-medium text-sm">
                          Password
                        </label>
                        <input
                          name="password"
                          type="password"
                          placeholder="Create a password"
                          required
                          value={formData.password}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                        />
                      </div>

                      <div>
                        <label className="block mb-1 text-gray-700 font-medium text-sm">
                          Confirm Password
                        </label>
                        <input
                          name="password2"
                          type="password"
                          placeholder="Confirm your password"
                          required
                          value={formData.password2}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-semibold mt-4 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      >
                        {loading ? 'Creating Account...' : 'Create Account'}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Text */}
          <p className="text-center mt-6 text-gray-600 text-sm">
            {mode === 'login' ? (
              <>
                Don't have an account?{' '}
                <button
                  onClick={() => setMode('register')}
                  className="text-blue-500 hover:text-blue-600 font-semibold hover:underline"
                >
                  Register here
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => setMode('login')}
                  className="text-blue-500 hover:text-blue-600 font-semibold hover:underline"
                >
                  Login here
                </button>
              </>
            )}
          </p>
        </div>
      </div>

      {/* Add Tailwind animations to your index.css or globals.css */}
      <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }

        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}

export default AuthPage;