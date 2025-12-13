import React, { useState, useEffect } from 'react';
import { ClipboardList, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import api from '../api/axios';
import Footer from '../components/Footer.jsx';
import Header from '../components/Header.jsx';


function MaintenanceList() {
  const [allRequests, setAllRequests] = useState([]);
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
  const [userId, setUserId] = useState(null);
  const [activeTab, setActiveTab] = useState('available');

  const getImageUrl = (imagePath) => {
    if (!imagePath || imagePath.trim() === '') return null;
    
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    return `${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}${imagePath}`;
  };

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    try {
      setLoading(true);
      const profile = await fetchUserProfile();
      setUserRole(profile.role);
      setUserId(profile.userId);
      
      await fetchRequests();
    } catch (error) {
      console.error('Error initializing data:', error);
      setError(`Failed to initialize: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/accounts/staffprofile/');
      const profileData = response.data;
      const userId = profileData.user?.id || profileData.user;
      const role = (profileData.role || 'staff').toLowerCase();
      
      return { role: role, userId: userId };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return { role: 'staff', userId: null };
    }
  };

  const fetchRequests = async () => {
    try {
      const response = await api.get('/maintenance/requests/');
      const data = response.data;

      let requestsArray = [];
      
      if (Array.isArray(data)) {
        requestsArray = data;
      } else if (data && Array.isArray(data.results)) {
        requestsArray = data.results;
      } else if (data && typeof data === 'object' && !data.detail) {
        requestsArray = [data];
      } else {
        requestsArray = [];
      }

      // Filter to only show approved or in-progress/completed requests
      const filteredRequests = requestsArray.filter(req => 
        req.status !== 'pending' && req.status !== 'rejected'
      );

      setAllRequests(filteredRequests);
      setError(null);
      
    } catch (error) {
      console.error('Error fetching requests:', error);
      
      if (error.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else if (error.response?.status === 403) {
        setError('You do not have permission to view these requests.');
      } else {
        setError(`Failed to load maintenance requests: ${error.response?.data?.detail || error.message}`);
      }
      
      setAllRequests([]);
    }
  };

  const getFilteredRequests = () => {
    if (activeTab === 'available') {
      // Show approved requests that are unassigned
      return allRequests.filter(req => req.status === 'approved' && !req.assigned_to);
    } else if (activeTab === 'assigned') {
      // Show requests assigned to this staff member
      return allRequests.filter(req => {
        const assignedToId = typeof req.assigned_to === 'object' 
          ? req.assigned_to?.id 
          : req.assigned_to;
        return assignedToId === userId;
      });
    } else if (activeTab === 'completed') {
      // Show completed requests by this staff member
      return allRequests.filter(req => {
        const assignedToId = typeof req.assigned_to === 'object' 
          ? req.assigned_to?.id 
          : req.assigned_to;
        return req.status === 'completed' && assignedToId === userId;
      });
    }
    return allRequests;
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
      
      let endpoint = '';
      
      if (updateData.status === 'completed') {
        endpoint = `/maintenance/requests/${selectedRequest.id}/complete/`;
        if (updateData.notes) {
          formData.append('completion_notes', updateData.notes);
        }
        if (updateData.image) {
          formData.append('completion_photo', updateData.image);
        }
      } else {
        endpoint = `/maintenance/requests/${selectedRequest.id}/update-status/`;
        formData.append('status', updateData.status);
        if (updateData.notes) {
          formData.append('notes', updateData.notes);
        }
        if (updateData.image) {
          formData.append('image', updateData.image);
        }
      }
      
      await api.post(endpoint, formData);
      
      alert('Request updated successfully!');
      closeDetailModal();
      await fetchRequests();
      
    } catch (error) {
      console.error('Update error:', error);
      
      if (error.response?.status === 401) {
        alert('Authentication failed. Please log in again.');
      } else {
        alert(`Failed to update request: ${error.response?.data?.detail || error.message}`);
      }
    }
  };

  const handleAcceptRequest = async (request) => {
    try {
      await api.post(`/maintenance/requests/${request.id}/claim/`);
      alert('Request claimed successfully!');
      await fetchRequests();
    } catch (error) {
      console.error('Error claiming request:', error);
      alert(`Failed to claim request: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleCancelRequest = async (request) => {
    if (!window.confirm('Are you sure you want to cancel this assignment?')) return;
    
    try {
      await api.patch(`/maintenance/requests/${request.id}/`, {
        status: 'approved',
        assigned_to: ''
      });
      alert('Assignment cancelled successfully!');
      await fetchRequests();
    } catch (error) {
      console.error('Error cancelling request:', error);
      alert(`Failed to cancel request: ${error.response?.data?.error || error.message}`);
    }
  };

  const getStatusBadgeClass = (status) => {
    const badges = {
      approved: 'bg-green-100 text-green-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-gray-100 text-gray-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const formatStatusText = (status) => {
    return status.replace(/_/g, ' ').toUpperCase();
  };

  const getTabCounts = () => {
    return {
      available: allRequests.filter(req => req.status === 'approved' && !req.assigned_to).length,
      assigned: allRequests.filter(req => {
        const assignedToId = typeof req.assigned_to === 'object' 
          ? req.assigned_to?.id 
          : req.assigned_to;
        return assignedToId === userId && req.status !== 'completed';
      }).length,
      completed: allRequests.filter(req => {
        const assignedToId = typeof req.assigned_to === 'object' 
          ? req.assigned_to?.id 
          : req.assigned_to;
        return req.status === 'completed' && assignedToId === userId;
      }).length
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-xl">Loading maintenance requests...</p>
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

  const filteredRequests = getFilteredRequests();
  const tabCounts = getTabCounts();
  
  return (
    <>
    <Header showSearch={true}/>
      <div className="p-6 max-w-7xl min-h-screen flex flex-col mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">My Maintenance Tasks</h1>
          <p className="text-gray-600 mt-2">
            Accept approved requests and manage your assigned tasks
          </p>
        </div>

        <div className="mb-6 border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('available')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'available'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5" />
                <span>Available Tasks</span>
                <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs">
                  {tabCounts.available}
                </span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('assigned')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'assigned'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>My Tasks</span>
                <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">
                  {tabCounts.assigned}
                </span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('completed')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'completed'
                  ? 'border-gray-500 text-gray-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>Completed</span>
                <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-xs">
                  {tabCounts.completed}
                </span>
              </div>
            </button>
          </nav>
        </div>

        {filteredRequests.length === 0 ? (
          <div className="bg-white p-12 rounded-lg text-center shadow-md">
            <div className="text-gray-400 mb-4">
              <ClipboardList className="w-16 h-16 mx-auto" />
            </div>
            <p className="text-xl text-gray-700 font-medium mb-2">
              No requests found
            </p>
            <p className="text-gray-600">
              {activeTab === 'available'
                ? "There are no approved tasks available to accept at the moment."
                : activeTab === 'assigned'
                ? "You don't have any active tasks assigned to you."
                : "You haven't completed any tasks yet."}
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
                {filteredRequests.map((req) => (
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
                      <div className="flex items-center gap-2">
                        {activeTab === 'available' && (
                          <button
                            onClick={() => handleAcceptRequest(req)}
                            className="text-green-600 hover:text-green-800 font-medium"
                          >
                            Accept
                          </button>
                        )}
                        
                        {activeTab === 'assigned' && req.status !== 'completed' && (
                          <button
                            onClick={() => handleCancelRequest(req)}
                            className="text-red-600 hover:text-red-800 font-medium"
                          >
                            Cancel
                          </button>
                        )}
                        
                        <button
                          onClick={() => openDetailModal(req)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          View Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showDetailModal && selectedRequest && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
            onClick={closeDetailModal}
          >
            <div 
              className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
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

              <div className="p-6 space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 pb-2">Request Information</h3>
                  
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
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              {activeTab !== 'completed' && (
                <div className="space-y-4 pt-6 px-8 pb-6">
                  <h3 className="text-lg font-semibold text-gray-800 pb-2">Update Request</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={updateData.status}
                      onChange={(e) => setUpdateData({ ...updateData, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    >
                      <option value="approved">Approved</option>
                      <option value="in_progress">In Progress</option>
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
              )}

              <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex gap-3 border-t">
                {activeTab !== 'completed' && (
                  <button 
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition-colors font-medium"
                    onClick={handleUpdateRequest}
                  >
                    Update Request
                  </button>
                )}
                <button 
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded transition-colors font-medium"
                  onClick={closeDetailModal}
                >
                  {activeTab === 'completed' ? 'Close' : 'Cancel'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer/>
    </>
  );
}

export default MaintenanceList;