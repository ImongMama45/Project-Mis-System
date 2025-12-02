import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
    first_name: '',
    last_name: '',
    role: 'user', // Default for non-admin registrars
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // 👇 IMPORTANT: Pull user from context
  const { register, user } = useAuth();
  console.log('user:', user);
  console.log('user role:', user?.role);


  const handleSubmit = async (e) => {
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
      navigate('/login');
    } else {
      setError(result.error || 'Registration failed');
    }

    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh] py-8">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">
          Register New User
        </h2>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded mb-4 border border-red-200">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 text-gray-700 font-medium">First Name</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block mb-2 text-gray-700 font-medium">Last Name</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block mb-2 text-gray-700 font-medium">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block mb-2 text-gray-700 font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* 👇 ROLE FIELD (ADMIN ONLY) */}
          {user?.role === "admin" && (
            <div>
              <label className="block mb-2 text-gray-700 font-medium">Role</label>

              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 bg-white"
              >
                <option value="staff">Staff (Maintenance Staff)</option>
                <option value="admin">Admin (Administrator)</option>
                <option value="user">User (Regular User)</option>
              </select>

              <p className="text-xs text-gray-500 mt-1">
                Staff: Can view and update assigned requests<br />
                Admin: Full access to all features<br />
                User: Can only submit and track requests
              </p>
            </div>
          )}

          {/* Password */}
          <div>
            <label className="block mb-2 text-gray-700 font-medium">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block mb-2 text-gray-700 font-medium">Confirm Password</label>
            <input
              type="password"
              name="password2"
              value={formData.password2}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded mt-4 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? 'Registering...' : 'Create User'}
          </button>
        </form>

        <p className="text-center mt-4 text-gray-600">
          {user?.role === "admin" && (
            <Link to="/home" className="text-blue-500 hover:underline">
              ← Back to Dashboard
            </Link>)
          }
          {user?.role === undefined && (
            <Link to="/home" className="text-blue-500 hover:underline">
              Back to Login
            </Link>)
          } 
          
        </p>
      </div>
    </div>
  );
}

export default Register;
