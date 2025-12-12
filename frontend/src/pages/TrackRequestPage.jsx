import { useState, useEffect } from 'react';
import { CheckCircle, Clock, Package, User, Calendar, MapPin, FileText, Image } from 'lucide-react';
import api from '../api/axios';
import Footer from '../components/Footer.jsx';
import Header from '../components/Header.jsx';

export default function TrackRequest() {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

  useEffect(() => {
    fetchUserRequests();
  }, []);

  const fetchUserRequests = async () => {
    try {
      setLoading(true);
      
      // Check if user is logged in
      const token = localStorage.getItem('access_token');
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      
      if (!token) {
        setError('Please log in to view your requests.');
        window.location.href = '/login';
        return;
      }

      // Use the configured axios instance instead of raw fetch
      const response = await api.get('/maintenance/requests/');
      
      console.log('API Response:', response.data); // Debug log
      
      const requestsData = Array.isArray(response.data) ? response.data : response.data.results || [];

      // Debug: Log first request to see structure
      if (requestsData.length > 0) {
        console.log('First request structure:', requestsData[0]);
        console.log('Building:', requestsData[0].building);
        console.log('Floor:', requestsData[0].floor);
        console.log('Room:', requestsData[0].room);
      }

      const requesterName = userData.first_name && userData.last_name
        ? `${userData.first_name} ${userData.last_name}`.toLowerCase().trim()
        : userData.username?.toLowerCase() || '';
          
      const userRequests = requestsData.filter(
        req => req.requester_name?.toLowerCase() === requesterName
      );

      setRequests(userRequests);
      if (userRequests.length > 0) {
        setSelectedRequest(userRequests[0]);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching requests:', err);
      
      // Handle specific error cases
      if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else if (err.response?.status === 403) {
        setError('You do not have permission to view these requests.');
      } else {
        setError('Failed to load your requests. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_BASE_URL}${imagePath}`;
  };

  const getStatusStep = (status) => {
    const steps = { 'pending': 0, 'in_progress': 1, 'completed': 2 };
    return steps[status] || 0;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  // Helper functions that extract only the name part
  const getBuildingName = (req) => {
    if (!req) return 'N/A';
    
    if (typeof req.building === 'object' && req.building?.name) {
      return req.building.name;
    }
    
    if (typeof req.building === 'string') {
      return req.building;
    }
    
    if (req.building_name) {
      return req.building_name;
    }
    
    return 'N/A';
  };

  const getFloorLabel = (req) => {
    if (!req) return 'N/A';
    
    if (typeof req.floor === 'object' && req.floor?.label) {
      return req.floor.label;
    }
    
    if (typeof req.floor === 'object' && req.floor?.number) {
      return `${req.floor.number}`;
    }
    
    if (typeof req.floor === 'string') {
      const parts = req.floor.split('–').map(p => p.trim());
      if (parts.length >= 2) {
        return parts[1];
      }
      return req.floor;
    }
    
    if (req.floor_label) return req.floor_label;
    if (req.floor_number) return `Floor ${req.floor_number}`;
    
    return 'N/A';
  };

  const getRoomName = (req) => {
    if (!req) return 'N/A';
    
    if (typeof req.room === 'object' && req.room?.name) {
      return req.room.name;
    }
    
    if (typeof req.room === 'string') {
      const parts = req.room.split('–').map(p => p.trim());
      if (parts.length >= 3) {
        return parts[2];
      }
      if (parts.length === 2) {
        return parts[1];
      }
      return req.room;
    }
    
    if (req.room_name) {
      return req.room_name;
    }
    
    return 'N/A';
  };
  
  const getLocationDisplay = (req) => {
    const building = getBuildingName(req);
    const floor = getFloorLabel(req);
    const room = getRoomName(req);
    
    let location = building;
    if (floor !== 'N/A') location += `, ${floor}`;
    if (room !== 'N/A') location += `, ${room}`;
    return location;
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your requests...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="bg-red-50 text-red-600 p-6 rounded-lg border border-red-200 max-w-md">
            <p className="font-medium mb-2">Error</p>
            <p>{error}</p>
            {!error.includes('log in') && (
              <button 
                onClick={fetchUserRequests}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Retry
              </button>
            )}
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (requests.length === 0) {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center bg-white p-12 rounded-lg shadow-md max-w-md">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No Requests Found</h2>
            <p className="text-gray-600 mb-6">You haven't submitted any maintenance requests yet.</p>
            <a 
              href="/submit-request"
              className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Submit a Request
            </a>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const currentStep = getStatusStep(selectedRequest?.status);

  return (
    <>
      <Header />
      <div className="p-6 max-w-7xl min-h-screen mx-auto">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Track Your Requests</h1>
            <p className="text-gray-600">Monitor the status of your maintenance requests</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Request List Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-4 max-h-[600px] overflow-y-auto">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Your Requests</h2>
                <div className="space-y-2">
                  {requests.map((req) => (
                    <button
                      key={req.id}
                      onClick={() => setSelectedRequest(req)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        selectedRequest?.id === req.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold text-gray-800">Request #{req.id}</span>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          req.status === 'completed' ? 'bg-green-100 text-green-700' :
                          req.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {req.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate mb-1">{req.description}</p>
                      <div className="flex items-center text-xs text-gray-500 mt-2">
                        <MapPin className="w-3 h-3 mr-1" />
                        <span className="truncate">{getBuildingName(req)}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(req.created_at)}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2">
              {selectedRequest && (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  {/* Progress Tracker */}
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
                    <h2 className="text-white text-2xl font-bold mb-2">Request #{selectedRequest.id}</h2>
                    <p className="text-blue-100 text-sm mb-6">{getLocationDisplay(selectedRequest)}</p>
                    
                    {/* Progress Steps */}
                    <div className="relative">
                      <div className="flex justify-between items-center">
                        <div className="flex flex-col items-center flex-1">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            currentStep >= 0 ? 'bg-white text-blue-600' : 'bg-blue-400 text-white'
                          }`}>
                            <Clock className="w-6 h-6" />
                          </div>
                          <span className="text-white text-sm font-medium mt-2">Pending</span>
                        </div>

                        <div className={`flex-1 h-1 ${currentStep >= 1 ? 'bg-white' : 'bg-blue-400'}`}></div>

                        <div className="flex flex-col items-center flex-1">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            currentStep >= 1 ? 'bg-white text-blue-600' : 'bg-blue-400 text-white'
                          }`}>
                            <User className="w-6 h-6" />
                          </div>
                          <span className="text-white text-sm font-medium mt-2">In Progress</span>
                        </div>

                        <div className={`flex-1 h-1 ${currentStep >= 2 ? 'bg-white' : 'bg-blue-400'}`}></div>

                        <div className="flex flex-col items-center flex-1">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            currentStep >= 2 ? 'bg-white text-green-600' : 'bg-blue-400 text-white'
                          }`}>
                            <CheckCircle className="w-6 h-6" />
                          </div>
                          <span className="text-white text-sm font-medium mt-2">Completed</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content Area */}
                  <div className="p-6">
                    {/* Location Info Card */}
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-lg border border-gray-200 mb-6">
                      <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                        <MapPin className="w-5 h-5 mr-2 text-gray-600" />
                        Location Details
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Building</p>
                          <p className="font-semibold text-gray-800">{getBuildingName(selectedRequest)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Floor</p>
                          <p className="font-semibold text-gray-800">{getFloorLabel(selectedRequest)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Room</p>
                          <p className="font-semibold text-gray-800">{getRoomName(selectedRequest)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Status-specific content */}
                    {selectedRequest.status === 'pending' && (
                      <div className="space-y-6">
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                          <p className="text-yellow-800 font-medium">Your request is pending assignment</p>
                          <p className="text-yellow-700 text-sm mt-1">A staff member will be assigned soon</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-start space-x-3">
                            <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                            <div>
                              <p className="text-sm text-gray-600">Submitted</p>
                              <p className="font-medium text-gray-800">{formatDate(selectedRequest.created_at)}</p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <FileText className="w-5 h-5 text-gray-400" />
                            <h3 className="font-semibold text-gray-800">Description</h3>
                          </div>
                          <p className="text-gray-700 bg-gray-50 p-4 rounded border">{selectedRequest.description}</p>
                        </div>

                        {selectedRequest.issue_photo && (
                          <div>
                            <div className="flex items-center space-x-2 mb-2">
                              <Image className="w-5 h-5 text-gray-400" />
                              <h3 className="font-semibold text-gray-800">Issue Photo</h3>
                            </div>
                            <img 
                              src={getImageUrl(selectedRequest.issue_photo)}
                              alt="Issue"
                              className="w-full max-h-64 object-contain rounded border"
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {selectedRequest.status === 'in_progress' && (
                      <div className="space-y-6">
                        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                          <p className="text-blue-800 font-medium">A staff member is working on your request</p>
                        </div>

                        {selectedRequest.assigned_to_details && (
                          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
                            <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                              <User className="w-5 h-5 mr-2 text-blue-600" />
                              Assigned Staff
                            </h3>
                            <div className="flex items-center space-x-4">
                              <div className="w-16 h-16 rounded-full bg-blue-200 flex items-center justify-center text-blue-600 font-bold text-xl">
                                {selectedRequest.assigned_to_details.first_name?.[0] || 'S'}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-800 text-lg">
                                  {selectedRequest.assigned_to_details.first_name} {selectedRequest.assigned_to_details.last_name}
                                </p>
                                <p className="text-gray-600">@{selectedRequest.assigned_to_details.username}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {selectedRequest.status === 'completed' && (
                      <div className="space-y-6">
                        <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded">
                          <div className="flex items-center">
                            <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                            <div>
                              <p className="text-green-800 font-medium">Request Completed!</p>
                              <p className="text-green-700 text-sm mt-1">Successfully resolved</p>
                            </div>
                          </div>
                        </div>

                        {selectedRequest.completion_notes && (
                          <div>
                            <h3 className="font-semibold text-gray-800 mb-2">Completion Notes</h3>
                            <p className="text-gray-700 bg-green-50 p-4 rounded border border-green-200">{selectedRequest.completion_notes}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}