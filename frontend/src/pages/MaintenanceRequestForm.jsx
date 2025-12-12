// /frontend/src/components/MaintenanceRequestForm.jsx
import React, { useState, useEffect } from 'react';
import api from '../api/axios'
import Header from '../components/Header';
import Footer from '../components/Footer.jsx'
import { Upload, MapPin, User, FileText, Camera, CheckCircle } from 'lucide-react';

function MaintenanceRequestForm({ onSuccess }) {
  const [buildings, setBuildings] = useState([]);
  const [floors, setFloors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [formData, setFormData] = useState({
    requester_name: '',
    description: '',
    building: '',
    floor: '',
    room: '',
    role: 'staff', // Auto-detected from profile, default to staff
    issue_photo: null,
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchUserProfile();
    fetchBuildings();
  }, []);

  // Fetch current user profile
  const fetchUserProfile = async () => {
    try {
      setLoadingProfile(true);
      const response = await api.get('/accounts/profile/');
      const profile = response.data;
      
      setUserProfile(profile);
      
      // Auto-fill form with user data
      const fullName = profile.first_name && profile.last_name 
        ? `${profile.first_name} ${profile.last_name}`.trim() 
        : profile.username || '';
      
      // Auto-determine role from profile (only staff/instructor can make requests)
      let userRole = 'staff'; // default
      if (profile.staff_profile?.role) {
        const staffRole = profile.staff_profile.role.toLowerCase();
        if (staffRole.includes('instructor') || staffRole.includes('teacher')) {
          userRole = 'instructor';
        } else if (staffRole.includes('staff') || staffRole.includes('admin')) {
          userRole = 'staff';
        }
      }
      
      setFormData(prev => ({
        ...prev,
        requester_name: fullName,
        role: userRole, // Auto-set role silently
      }));
    } catch (err) {
      console.error('Error fetching user profile:', err);
      // If profile fetch fails, try to get basic user info from token
      const username = localStorage.getItem('username');
      if (username) {
        setFormData(prev => ({ ...prev, requester_name: username, role: 'staff' }));
      }
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchBuildings = async () => {
    try {
      const response = await api.get('location/buildings/');
      const data = Array.isArray(response.data) ? response.data : response.data.results || [];
      setBuildings(data);
    } catch (err) {
      console.error('Error fetching buildings:', err);
    }
  };

  const fetchFloors = async (buildingId) => {
    try {
      const response = await api.get(`location/buildings/${buildingId}/floors/`);
      const data = Array.isArray(response.data) ? response.data : response.data.results || [];
      setFloors(data);
    } catch (err) {
      console.error('Error fetching floors:', err);
      setFloors([]);
    }
  };

  // ✅ FIXED: Fetch rooms by floor, not by building
  const fetchRoomsByFloor = async (floorId) => {
    try {
      const response = await api.get(`location/floors/${floorId}/rooms/`);
      const data = Array.isArray(response.data) ? response.data : response.data.results || [];
      setRooms(data);
    } catch (err) {
      console.error('Error fetching rooms:', err);
      setRooms([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // When building changes, fetch floors and reset floor/room
    if (name === 'building' && value) {
      fetchFloors(value);
      setFormData(prev => ({ ...prev, floor: '', room: '' }));
      setRooms([]);
    }

    // When floor changes, fetch rooms for that floor
    if (name === 'floor' && value) {
      fetchRoomsByFloor(value);
      setFormData(prev => ({ ...prev, room: '' }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, issue_photo: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, issue_photo: null }));
    setPreviewImage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const data = new FormData();
      data.append("requester_name", formData.requester_name);
      data.append("description", formData.description);
      data.append("building_id", formData.building);
      data.append("role", formData.role); // Auto-detected role (staff/instructor)

      if (formData.floor) data.append("floor_id", formData.floor);
      if (formData.room) data.append("room_id", formData.room);
      if (formData.issue_photo) data.append("issue_photo", formData.issue_photo);

      await api.post('maintenance/requests/create/', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSuccess(true);
      
      // Reset form
      const fullName = userProfile?.first_name && userProfile?.last_name 
        ? `${userProfile.first_name} ${userProfile.last_name}`.trim() 
        : userProfile?.username || '';
      
      setFormData({
        requester_name: fullName,
        description: '',
        building: '',
        floor: '',
        room: '',
        role: formData.role, // Keep the auto-detected role
        issue_photo: null,
      });
      setPreviewImage(null);
      setFloors([]);
      setRooms([]);

      // Auto-hide success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);

      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Full error:', err);
      const errorMsg = err.response?.data 
        ? Object.entries(err.response.data).map(([key, val]) => `${key}: ${val}`).join(', ')
        : 'Failed to submit request. Please check all required fields.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (loadingProfile) {
    return (
      <>
        <Header showSearch={false} />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 font-medium">Loading your information...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header showSearch={false} />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Submit Maintenance Request
            </h1>
            <p className="text-gray-600">
              Report an issue and our team will address it promptly
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg shadow-sm animate-fade-in">
              <div className="flex items-center">
                <CheckCircle className="w-6 h-6 text-green-500 mr-3" />
                <div>
                  <p className="font-semibold text-green-800">Request Submitted Successfully!</p>
                  <p className="text-sm text-green-700">Our team has been notified and will address your request soon.</p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg shadow-sm">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Main Form Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <form onSubmit={handleSubmit} className="p-8">
              {/* Personal Information Section */}
              <div className="mb-8">
                <div className="flex items-center mb-4">
                  <User className="w-5 h-5 text-indigo-600 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-900">Your Information</h2>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="requester_name"
                    value={formData.requester_name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    placeholder="Enter your full name"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    This will be used to identify your request
                  </p>
                </div>
              </div>

              {/* Location Information Section */}
              <div className="mb-8">
                <div className="flex items-center mb-4">
                  <MapPin className="w-5 h-5 text-indigo-600 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-900">Location Details</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Building */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Building <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="building"
                      value={formData.building}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white transition-all"
                    >
                      <option value="">Select Building</option>
                      {buildings.map((b) => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Floor */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Floor {floors.length > 0 && <span className="text-gray-500">(Optional)</span>}
                    </label>
                    <select
                      name="floor"
                      value={formData.floor}
                      onChange={handleChange}
                      disabled={!formData.building || floors.length === 0}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">Select Floor</option>
                      {floors.map(f => (
                        <option key={f.id} value={f.id}>{f.label || `Floor ${f.number}`}</option>
                      ))}
                    </select>
                    {!formData.building && (
                      <p className="mt-1 text-xs text-gray-500">Select a building first</p>
                    )}
                    {formData.building && floors.length === 0 && (
                      <p className="mt-1 text-xs text-gray-500">This building has no floors</p>
                    )}
                  </div>

                  {/* Room */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Room {rooms.length > 0 && <span className="text-gray-500">(Optional)</span>}
                    </label>
                    <select
                      name="room"
                      value={formData.room}
                      onChange={handleChange}
                      disabled={!formData.floor || rooms.length === 0}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">Select Room</option>
                      {rooms.map(r => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                    {!formData.floor && (
                      <p className="mt-1 text-xs text-gray-500">Select a floor first</p>
                    )}
                    {formData.floor && rooms.length === 0 && (
                      <p className="mt-1 text-xs text-gray-500">No rooms available on this floor</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Issue Description Section */}
              <div className="mb-8">
                <div className="flex items-center mb-4">
                  <FileText className="w-5 h-5 text-indigo-600 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-900">Issue Description</h2>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Describe the issue <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="5"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                    placeholder="Please provide detailed information about the maintenance issue..."
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Be as specific as possible to help us address the issue quickly
                  </p>
                </div>
              </div>

              {/* Photo Upload Section */}
              <div className="mb-8">
                <div className="flex items-center mb-4">
                  <Camera className="w-5 h-5 text-indigo-600 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-900">Issue Photo (Optional)</h2>
                </div>
                
                {!previewImage ? (
                  <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-all">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-12 h-12 text-gray-400 mb-3" />
                      <p className="mb-2 text-sm text-gray-600">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG or JPEG (MAX. 10MB)</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="relative">
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="w-full h-64 object-cover rounded-lg border-2 border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-all shadow-lg"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-lg shadow-lg transform transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting Request...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Submit Request
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Helper Text */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Your request will be reviewed and assigned to our maintenance team
          </p>
        </div>
      </div>
      <Footer/>
    </>
  );
}

export default MaintenanceRequestForm;