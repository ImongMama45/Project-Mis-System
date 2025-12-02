import React, { useState, useEffect } from 'react';
import api from '../api/axios'

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

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-center mb-6">Submit Maintenance Request</h2>
      {error && <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block mb-1 font-medium">Your Name *</label>
          <input
            type="text"
            name="requester_name"
            value={formData.requester_name}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Role */}
        <div>
          <label className="block mb-1 font-medium">Role *</label>
          <select
            name="requester_role"
            value={formData.requester_role}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="student">Student</option>
            <option value="staff">Staff</option>
            <option value="instructor">Instructor</option>
          </select>
        </div>

        {/* Student Info */}
        {formData.requester_role === 'student' && (
          <>
            <div>
              <label className="block mb-1 font-medium">Section</label>
              <input
                type="text"
                name="section"
                value={formData.section}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Student ID</label>
              <input
                type="text"
                name="student_id"
                value={formData.student_id}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </>
        )}

        {/* Building Dropdown */}
        <div>
          <label className="block mb-1 font-medium">Building *</label>
          <select
            name="building"
            value={formData.building}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Building</option>
            {buildings.map((building) => (
              <option key={building.id} value={building.id}>
                {building.name}
              </option>
            ))}
          </select>
        </div>

        {/* Floor Dropdown */}
        <div>
          <label className="block mb-1 font-medium">Floor</label>
          <select
            name="floor"
            value={formData.floor}
            onChange={handleChange}
            disabled={!formData.building}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          >
            <option value="">Select Floor</option>
            {floors.map((floor) => (
              <option key={floor.id} value={floor.id}>
                {floor.label || `Floor ${floor.number}`}
              </option>
            ))}
          </select>
        </div>

        {/* Room Dropdown */}
        <div>
          <label className="block mb-1 font-medium">Room *</label>
          <select
            name="room"
            value={formData.room}
            onChange={handleChange}
            required
            disabled={!formData.building}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          >
            <option value="">Select Room</option>
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.name}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block mb-1 font-medium">Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            required
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Photo */}
        <div>
          <label className="block mb-1 font-medium">Issue Photo</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>
    </div>
  );
}

export default MaintenanceRequestForm;