import React, { useState, useEffect } from 'react';
import api from '../api/axios'
import Header from './Header';

function MaintenanceRequestForm({ onSuccess }) {
  const [buildings, setBuildings] = useState([]);
  const [floors, setFloors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [formData, setFormData] = useState({
    requester_name: '',
    requester_role: 'student',
    section: '',
    student_id: '',
    description: '',
    building: '',
    floor: '',
    room: '',
    issue_photo: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBuildings();
  }, []);

  const fetchBuildings = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await api.get('location/buildings/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = Array.isArray(response.data) ? response.data : response.data.results || [];
      setBuildings(data);
    } catch (err) {
      console.error('Error fetching buildings:', err);
    }
  };

  const fetchFloors = async (buildingId) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await api.get(`location/buildings/${buildingId}/floors/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = Array.isArray(response.data) ? response.data : response.data.results || [];
      setFloors(data);
    } catch (err) {
      console.error('Error fetching floors:', err);
      setFloors([]);
    }
  };

  const fetchRooms = async (buildingId) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await api.get(`location/buildings/${buildingId}/rooms/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
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

    // When building changes, fetch its floors and rooms
    if (name === 'building' && value) {
      fetchFloors(value);
      fetchRooms(value);
      setFormData(prev => ({ ...prev, floor: '', room: '' }));
    }
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, issue_photo: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('access_token');
      const data = new FormData();

      // Append all fields to FormData
      data.append("requester_name", formData.requester_name);
      data.append("role", formData.requester_role); // ← FIXED: backend expects "role"
      data.append("description", formData.description);
      data.append("building", formData.building);
      
      if (formData.floor) data.append("floor", formData.floor);
      if (formData.room) data.append("room", formData.room);
      if (formData.section) data.append("section", formData.section);
      if (formData.student_id) data.append("student_id", formData.student_id);
      if (formData.issue_photo) data.append("issue_photo", formData.issue_photo);

      await api.post('maintenance/requests/create/', data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('Maintenance request submitted successfully!');
      setFormData({
        requester_name: '',
        requester_role: 'student',
        section: '',
        student_id: '',
        description: '',
        building: '',
        floor: '',
        room: '',
        issue_photo: null,
      });

      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Full error:', err);
      console.error('Error response:', err.response?.data);
      
      const errorMsg = err.response?.data 
        ? JSON.stringify(err.response.data) 
        : 'Failed to submit request. Please check all required fields.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (<>
    <Header showSearch={false} />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-100 to-purple-200 p-6">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-6xl w-full p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Submit Maintenance Request</h2>

          {error && (
            <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Top Section: Left & Right */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left */}
              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block mb-2 text-sm font-semibold text-gray-700">Your Name</label>
                  <input
                    type="text"
                    name="requester_name"
                    value={formData.requester_name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block mb-2 text-sm font-semibold text-gray-700">Role</label>
                  <select
                    name="requester_role"
                    value={formData.requester_role}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm bg-white"
                  >
                    <option value="student">Student</option>
                    <option value="staff">Staff</option>
                    <option value="instructor">Instructor</option>
                  </select>
                </div>

                {/* Section (if student) */}
                {formData.requester_role === 'student' && (
                  <div>
                    <label className="block mb-2 text-sm font-semibold text-gray-700">Section</label>
                    <input
                      type="text"
                      name="section"
                      value={formData.section}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
                    />
                  </div>
                )}
              </div>

              {/* Right */}
              <div className="space-y-4">
                {/* Student ID (if student) */}
                {formData.requester_role === 'student' && (
                  <div>
                    <label className="block mb-2 text-sm font-semibold text-gray-700">Student ID</label>
                    <input
                      type="text"
                      name="student_id"
                      value={formData.student_id}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
                    />
                  </div>
                )}

                {/* Building */}
                <div>
                  <label className="block mb-2 text-sm font-semibold text-gray-700">Building</label>
                  <select
                    name="building"
                    value={formData.building}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm bg-white"
                  >
                    <option value="">Select Building</option>
                    {buildings.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                {/* Floor */}
                <div>
                  <label className="block mb-2 text-sm font-semibold text-gray-700">Floor</label>
                  <select
                    name="floor"
                    value={formData.floor}
                    onChange={handleChange}
                    disabled={!formData.building}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm disabled:bg-gray-100"
                  >
                    <option value="">Select Floor</option>
                    {floors.map(f => (
                      <option key={f.id} value={f.id}>{f.label || `Floor ${f.number}`}</option>
                    ))}
                  </select>
                </div>

                {/* Room */}
                <div>
                  <label className="block mb-2 text-sm font-semibold text-gray-700">Room</label>
                  <select
                    name="room"
                    value={formData.room}
                    onChange={handleChange}
                    required
                    disabled={!formData.building}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm disabled:bg-gray-100"
                  >
                    <option value="">Select Room</option>
                    {rooms.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Middle Bottom: Description */}
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm resize-none"
              />
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">Issue Photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full text-gray-600"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </form>
        </div>
      </div>

    </>
  );
  
}

export default MaintenanceRequestForm;