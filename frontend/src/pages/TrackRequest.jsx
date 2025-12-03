import React, { useState, useEffect } from 'react';
import { Search, Eye, Edit2, UserPlus, X, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import Header from '../components/Header';

const TrackRequest = ({ onNavigate }) => {
  const [complaints, setComplaints] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
 

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
      
      
      await fetchComplaints();
      await fetchBuildings();
    } catch (error) {
      console.error('Error initializing data:', error);
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

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'on_hold': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleBadgeColor = (role) => {
    switch(role) {
      case 'student': return 'bg-blue-100 text-blue-800';
      case 'instructor': return 'bg-purple-100 text-purple-800';
      case 'staff': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatusText = (status) => {
    return status ? status.replace(/_/g, ' ').toUpperCase() : 'NONE';
  };

  const fetchComplaints = async () => {
    try {
      const response = await api.get('/maintenance/requests/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      
      const data = response.data;
      let complaintsArray = [];
      
      if (Array.isArray(data)) {
        complaintsArray = data;
      } else if (data && Array.isArray(data.results)) {
        complaintsArray = data.results;
      }
      
      setComplaints(complaintsArray);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      setComplaints([]);
    }
  };



  const fetchBuildings = async () => {
    try {
      const response = await api.get('/location/buildings/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      const buildingsData = Array.isArray(response.data) 
        ? response.data 
        : response.data.results || [];
      setBuildings(buildingsData);
    } catch (error) {
      console.error('Error fetching buildings:', error);
      setBuildings([]);
    }
  };

  const filteredComplaints = complaints.filter(complaint =>
    (complaint.description?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (complaint.building?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const getBuildingName = (building) => {
    if (!building) return 'N/A';
    if (typeof building === 'object' && building.name) return building.name;
    const buildingObj = buildings.find(b => b.id === building);
    return buildingObj ? buildingObj.name : 'Unknown';
  };


  const openDetailModal = (complaint) => {
    setSelectedComplaint(complaint);
    

    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedComplaint(null);
    setUpdateData({ status: '', notes: '', image: null});
  };

  return (<>
      <Header showSearch={false} />
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <button className="text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-1">
            <Link to={`/dashboard/`}>
                ← Back to Dashboard
            </Link>
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Maintenance Requests</h1>
            <p className="text-gray-600 mt-1">Monitor and manage maintenance requests</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search complaints..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading maintenance requests...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredComplaints.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                        No maintenance requests found.
                      </td>
                    </tr>
                  ) : (
                    filteredComplaints.map((complaint) => (
                      <tr key={complaint.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{complaint.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          <div>
                            <div className="font-medium">{getBuildingName(complaint.building)}</div>
                            <div className="text-xs text-gray-500">
                              Floor {complaint.floor?.number || complaint.floor || 'N/A'}, Room {complaint.room?.name || complaint.room || 'N/A'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          <div className="max-w-xs truncate">
                            {complaint.description ? complaint.description.substring(0, 50) + '...' : 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(complaint.status)}`}>
                            {formatStatusText(complaint.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {new Date(complaint.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => openDetailModal(complaint)}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detail Modal */}
        {showDetailModal && selectedComplaint && (
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
                    Request #{selectedComplaint.id}
                  </h2>
                  <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedComplaint.status)}`}>
                    {formatStatusText(selectedComplaint.status)}
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
                      <p className="mt-1 text-gray-900">{selectedComplaint.requester_name || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Role</label>
                      {selectedComplaint.role ? (
                        <span className={`inline-block mt-1 px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(selectedComplaint.role)}`}>
                          {selectedComplaint.role}
                        </span>
                      ) : (
                        <p className="mt-1 text-gray-900">N/A</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Building</label>
                      <p className="mt-1 text-gray-900">{getBuildingName(selectedComplaint.building)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Floor</label>
                      <p className="mt-1 text-gray-900">{selectedComplaint.floor?.number || selectedComplaint.floor || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Room</label>
                      <p className="mt-1 text-gray-900">{selectedComplaint.room?.name || selectedComplaint.room || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Date Submitted</label>
                      <p className="mt-1 text-gray-900">{new Date(selectedComplaint.created_at).toLocaleString()}</p>
                    </div>
                  </div>

                  {selectedComplaint.section && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Section</label>
                      <p className="mt-1 text-gray-900">{selectedComplaint.section}</p>
                    </div>
                  )}

                  {selectedComplaint.student_id && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Student ID</label>
                      <p className="mt-1 text-gray-900">{selectedComplaint.student_id}</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <p className="mt-1 text-gray-900 bg-gray-50 p-3 rounded">{selectedComplaint.description || 'N/A'}</p>
                  </div>

                  {selectedComplaint.issue_photo && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Issue Photo</label>
                      <img 
                        src={getImageUrl(selectedComplaint.issue_photo)}
                        alt="Issue" 
                        className="w-full max-h-64 object-contain rounded border"
                        onError={(e) => {
                          console.error('Image failed to load:', getImageUrl(selectedComplaint.issue_photo));
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default TrackRequest;