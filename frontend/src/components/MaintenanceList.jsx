import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function MaintenanceList() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [updateData, setUpdateData] = useState({
    status: '',
    notes: '',
    image: null
  });
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  // API Configuration
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
  const MAINTENANCE_ENDPOINT = '/api/maintenance/requests/';
  const USER_PROFILE_ENDPOINT = '/api/accounts/';

  // Helper function to get the full image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath || imagePath.trim() === '') return null;
    
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    return `${API_BASE_URL}${imagePath}`;
  };

  // Get authentication token
  const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  };

  useEffect(() => {
    initializeData();
  }, []);

  // Initialize: fetch user profile first, then requests
  const initializeData = async () => {
    try {
      setLoading(true);
      const profile = await fetchUserProfile();
      setUserRole(profile.role);
      await fetchRequests(profile.role, profile.userId);
    } catch (error) {
      console.error('Error initializing data:', error);
      setError(`Failed to initialize: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch current user's profile (includes user ID and role)
  // Fetch current user's profile (includes user ID and role)
  const fetchUserProfile = async () => {
    try {
      // First call to get the profile URL
      const initialResponse = await axios.get(`${API_BASE_URL}${USER_PROFILE_ENDPOINT}`, {
        headers: getAuthHeaders(),
      });
      
      console.log('Initial API response:', initialResponse.data);
      
      // Check if we got a URL to the actual profile
      let profileData;
      if (initialResponse.data.staffprofile) {
        // Fetch the actual profile data from the staffprofile URL
        const profileResponse = await axios.get(initialResponse.data.staffprofile, {
          headers: getAuthHeaders(),
        });
        profileData = profileResponse.data;
      } else {
        // If no nested URL, use the response directly
        profileData = initialResponse.data;
      }
      
      console.log('User profile data:', profileData);
      
      return {
        role: (profileData.role || profileData.user_role || 'staff').toLowerCase(),
        userId: profileData.user || profileData.id || profileData.user_id || profileData.pk || null
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Default to 'staff' if role fetch fails to be more restrictive
      return { role: 'staff', userId: null };
    }
  };
  // Fetch maintenance requests based on user role
  // Fetch maintenance requests based on user role
  const fetchRequests = async (role = userRole, userId = null) => {
    try {
      const response = await axios.get(`${API_BASE_URL}${MAINTENANCE_ENDPOINT}`, {
        headers: getAuthHeaders()
      });
      
      const data = response.data;
      console.log('Fetched requests:', data);
      console.log('Filtering with role:', role, 'userId:', userId);

      // Safely handle API response - ensure we have an array
      let requestsArray = [];
      
      if (Array.isArray(data)) {
        requestsArray = data;
      } else if (data && Array.isArray(data.results)) {
        // Handle paginated response
        requestsArray = data.results;
      } else if (data && typeof data === 'object') {
        // Handle single object wrapped in response
        requestsArray = [data];
      } else {
        console.warn('Unexpected data format:', data);
        requestsArray = [];
      }

      console.log('Requests array before filtering:', requestsArray);

      // Filter based on role
      let filteredRequests = [];
      if (role === 'admin') {
        // Admins see ALL requests
        filteredRequests = requestsArray;
        console.log('Admin - showing all requests');
      } else {
        // Staff see only requests assigned to THEM specifically
        filteredRequests = requestsArray.filter(req => {
          // Check if assigned_to matches current user ID
          // Handle both object format {id: X} and direct ID
          const assignedToId = typeof req.assigned_to === 'object' 
            ? req.assigned_to?.id 
            : req.assigned_to;
          
          console.log('Request', req.id, '- assigned_to:', assignedToId, 'current userId:', userId, 'match:', assignedToId === userId);
          return assignedToId && assignedToId === userId;
        });
        console.log('Staff - filtered to', filteredRequests.length, 'assigned requests');
      }

      setRequests(filteredRequests);
      setError(null);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setError(`Failed to load maintenance requests: ${error.response?.data?.detail || error.message}`);
      setRequests([]); // Set to empty array on error
    }
  };

  const openDetailModal = (request) => {
    setSelectedRequest(request);
    setUpdateData({
      status: request.status,
      notes: request.completion_notes || '',
      image: null
    });
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedRequest(null);
    setUpdateData({ status: '', notes: '', image: null });
  };

  const handleUpdateRequest = async () => {
    if (!selectedRequest) return;

    try {
      const formData = new FormData();
      
      // Determine endpoint based on status change
      let endpoint = '';
      
      if (updateData.status === 'completed') {
        endpoint = `${API_BASE_URL}/api/maintenance/requests/${selectedRequest.id}/complete/`;
        if (updateData.notes) {
          formData.append('completion_notes', updateData.notes);
        }
        if (updateData.image) {
          formData.append('completion_photo', updateData.image);
        }
      } else {
        // For other status updates
        endpoint = `${API_BASE_URL}/api/maintenance/requests/${selectedRequest.id}/update-status/`;
        formData.append('status', updateData.status);
        if (updateData.notes) {
          formData.append('notes', updateData.notes);
        }
        if (updateData.image) {
          formData.append('image', updateData.image);
        }
      }
      
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      await axios.post(endpoint, formData, { headers });
      
      alert('Request updated successfully!');
      closeDetailModal();
      
      // Refresh the list with proper role and userId filtering
      const profile = await fetchUserProfile();
      await fetchRequests(profile.role, profile.userId);
    } catch (error) {
      console.error('Update error:', error);
      alert(`Failed to update request: ${error.response?.data?.detail || error.message}`);
    }
  };
  const getStatusBadgeClass = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      on_hold: 'bg-orange-100 text-orange-800',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const formatStatusText = (status) => {
    return status.replace(/_/g, ' ').toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-xl text-gray-600">Loading maintenance requests...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 text-red-600 p-4 rounded border border-red-200">
          {error}
        </div>
        <button 
          onClick={initializeData}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }
  
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          {userRole === 'admin' ? 'All Maintenance Requests' : 'Assigned Requests'}
        </h1>
        <p className="text-gray-600 mt-2">
          {userRole === 'admin' 
            ? 'View and manage all maintenance requests' 
            : 'Manage your assigned maintenance tasks'}
        </p>
        <div className="mt-2">
          <span className="text-sm text-gray-500">
            Role: <span className="font-semibold capitalize">{userRole}</span>
          </span>
        </div>
      </div>
      
      {requests.length === 0 ? (
        <div className="bg-white p-12 rounded-lg text-center shadow-md">
          <p className="text-xl text-gray-700 font-medium mb-2">
            No {userRole === 'admin' ? '' : 'assigned'} requests found.
          </p>
          <p className="text-lg text-gray-600">
            {userRole === 'admin' 
              ? 'There are currently no maintenance requests in the system.' 
              : "You don't have any tasks assigned to you at the moment."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{req.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    <div>
                      <div className="font-medium">{req.building?.name || req.building || 'N/A'}</div>
                      <div className="text-xs text-gray-500">
                        Floor {req.floor?.number || req.floor || 'N/A'}, Room {req.room?.name || req.room || 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    <div className="max-w-xs truncate">{req.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(req.status)}`}>
                      {formatStatusText(req.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {new Date(req.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => openDetailModal(req)}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Request Detail Modal */}
      {showDetailModal && selectedRequest && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
          onClick={closeDetailModal}
        >
          <div 
            className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Request #{selectedRequest.id}
                </h2>
                <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(selectedRequest.status)}`}>
                  {formatStatusText(selectedRequest.status)}
                </span>
              </div>
              <button
                onClick={closeDetailModal}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              {/* Request Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Request Information</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Requester</label>
                    <p className="mt-1 text-gray-900">{selectedRequest.requester_name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <p className="mt-1 text-gray-900 capitalize">{selectedRequest.role || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Building</label>
                    <p className="mt-1 text-gray-900">{selectedRequest.building?.name || selectedRequest.building || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Floor</label>
                    <p className="mt-1 text-gray-900">{selectedRequest.floor?.number || selectedRequest.floor || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Room</label>
                    <p className="mt-1 text-gray-900">{selectedRequest.room?.name || selectedRequest.room || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date Submitted</label>
                    <p className="mt-1 text-gray-900">{new Date(selectedRequest.created_at).toLocaleString()}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <p className="mt-1 text-gray-900 bg-gray-50 p-3 rounded">{selectedRequest.description}</p>
                </div>

                {selectedRequest.issue_photo && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Issue Photo</label>
                    <img 
                      src={getImageUrl(selectedRequest.issue_photo)}
                      alt="Issue" 
                      className="w-full max-h-64 object-contain rounded border"
                      onError={(e) => {
                        console.error('Image failed to load:', getImageUrl(selectedRequest.issue_photo));
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Update Section */}
              {/* Add this inside the "Update Section" div, before the Status dropdown */}
              {userRole === 'admin' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assign To (Admin Only)
                  </label>
                  <select
                    value={updateData.assigned_to || ''}
                    onChange={(e) => setUpdateData({ ...updateData, assigned_to: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Unassigned</option>
                    {/* You'll need to fetch and populate staff list here */}
                    {/* Example: staffList.map(staff => <option key={staff.id} value={staff.id}>{staff.name}</option>) */}
                  </select>
                </div>
              )}
              <div className="space-y-4 border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Update Request</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={updateData.status}
                    onChange={(e) => setUpdateData({ ...updateData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="on_hold">On Hold</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <textarea
                    rows="4"
                    value={updateData.notes}
                    onChange={(e) => setUpdateData({ ...updateData, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500 resize-y"
                    placeholder="Add notes about this request..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Image (Optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setUpdateData({ ...updateData, image: e.target.files[0] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  />
                  {updateData.image && (
                    <p className="text-sm text-gray-600 mt-1">Selected: {updateData.image.name}</p>
                  )}
                </div>
              </div>

              {/* Previous completion info if exists */}
              {selectedRequest.completion_notes && (
                <div className="space-y-2 border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-800">Previous Completion Notes</h3>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded">{selectedRequest.completion_notes}</p>
                </div>
              )}

              {selectedRequest.completion_photo && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Previous Completion Photo</label>
                  <img 
                    src={getImageUrl(selectedRequest.completion_photo)}
                    alt="Completed" 
                    className="w-full max-h-64 object-contain rounded border"
                    onError={(e) => {
                      console.error('Completion image failed to load:', getImageUrl(selectedRequest.completion_photo));
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex gap-3 border-t">
              <button 
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition-colors font-medium"
                onClick={handleUpdateRequest}
              >
                Update Request
              </button>
              <button 
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded transition-colors font-medium"
                onClick={closeDetailModal}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MaintenanceList;