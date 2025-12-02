import React, { useState, useEffect } from 'react';
import { Search, Eye, Edit2, UserPlus, X, Download } from 'lucide-react';
import { Link } from 'react-router-dom';

const ComplaintsPage = ({ onNavigate }) => {
  const [complaints, setComplaints] = useState([]);
  const [staffers, setStaffers] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStaff, setSelectedStaff] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [completionNotes, setCompletionNotes] = useState('');

  useEffect(() => {
    fetchComplaints();
    fetchStaffers();
    fetchBuildings();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/maintenance-requests/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });
      const data = await response.json();
      setComplaints(data);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStaffers = async () => {
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      
      const response = await fetch('/api/staff/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setStaffers(data);
    } catch (error) {
      console.error('Error fetching staffers:', error);
    }
  };

  const fetchBuildings = async () => {
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      
      const response = await fetch('/api/buildings/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setBuildings(data);
    } catch (error) {
      console.error('Error fetching buildings:', error);
    }
  };

  const filteredComplaints = complaints.filter(complaint =>
    complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    complaint.requester_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (complaint.building && getBuildingName(complaint.building).toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getBuildingName = (buildingId) => {
    const building = buildings.find(b => b.id === buildingId);
    return building ? building.name : 'Unknown';
  };

  const getStaffName = (staffId) => {
    if (!staffId) return 'Unassigned';
    const staff = staffers.find(s => s.user.id === staffId);
    return staff ? `${staff.user.first_name} ${staff.user.last_name}` : 'Unknown';
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
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

  const handleAssignStaff = async () => {
    if (!selectedStaff) {
      alert('Please select a staff member');
      return;
    }

    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      
      const response = await fetch(`/api/maintenance-requests/${selectedComplaint.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          assigned_to: selectedStaff
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(JSON.stringify(errorData));
      }

      fetchComplaints();
      setShowAssignModal(false);
      setSelectedStaff('');
      alert('Staff assigned successfully');
    } catch (error) {
      console.error('Error assigning staff:', error);
      alert('Failed to assign staff: ' + error.message);
    }
  };

  const handleUpdateStatus = async () => {
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      
      const updateData = {
        status: selectedStatus
      };

      if (selectedStatus === 'completed' && completionNotes) {
        updateData.completion_notes = completionNotes;
      }

      const response = await fetch(`/api/maintenance-requests/${selectedComplaint.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(JSON.stringify(errorData));
      }

      fetchComplaints();
      setShowStatusModal(false);
      setSelectedStatus('');
      setCompletionNotes('');
      alert('Status updated successfully');
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status: ' + error.message);
    }
  };

  const openAssignModal = (complaint) => {
    setSelectedComplaint(complaint);
    setSelectedStaff(complaint.assigned_to || '');
    setShowAssignModal(true);
  };

  const openStatusModal = (complaint) => {
    setSelectedComplaint(complaint);
    setSelectedStatus(complaint.status);
    setCompletionNotes(complaint.completion_notes || '');
    setShowStatusModal(true);
  };

  const viewComplaintDetails = (complaint) => {
    setSelectedComplaint(complaint);
    setShowDetailModal(true);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <button className="text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-1">
          <Link to={`/management/`}>
              ← Back to Management Overview
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requester</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Building</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Staff</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Filed</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredComplaints.map((complaint) => (
                  <tr key={complaint.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 max-w-xs truncate">
                        {complaint.description.substring(0, 50)}...
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{complaint.requester_name}</div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(complaint.role)}`}>
                        {complaint.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {complaint.building ? getBuildingName(complaint.building) : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {getStaffName(complaint.assigned_to)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(complaint.status)}`}>
                        {complaint.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {new Date(complaint.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => viewComplaintDetails(complaint)}
                          className="text-blue-600 hover:text-blue-800"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => openStatusModal(complaint)}
                          className="text-green-600 hover:text-green-800" 
                          title="Update Status"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => openAssignModal(complaint)}
                          className="text-purple-600 hover:text-purple-800" 
                          title="Assign Staff"
                        >
                          <UserPlus className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Maintenance Request Details</h2>
              <button onClick={() => setShowDetailModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Requester Name</label>
                  <p className="text-gray-900 mt-1">{selectedComplaint.requester_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <span className={`inline-block mt-1 px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(selectedComplaint.role)}`}>
                    {selectedComplaint.role}
                  </span>
                </div>
              </div>

              {selectedComplaint.section && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Section</label>
                  <p className="text-gray-900 mt-1">{selectedComplaint.section}</p>
                </div>
              )}

              {selectedComplaint.student_id && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Student ID</label>
                  <p className="text-gray-900 mt-1">{selectedComplaint.student_id}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <p className="text-gray-900 mt-1 bg-gray-50 p-3 rounded-lg">{selectedComplaint.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Building</label>
                  <p className="text-gray-900 mt-1">
                    {selectedComplaint.building ? getBuildingName(selectedComplaint.building) : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`inline-block mt-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedComplaint.status)}`}>
                    {selectedComplaint.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Assigned Staff</label>
                <p className="text-gray-900 mt-1">{getStaffName(selectedComplaint.assigned_to)}</p>
              </div>

              {selectedComplaint.issue_photo && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Issue Photo</label>
                  <img 
                    src={selectedComplaint.issue_photo} 
                    alt="Issue" 
                    className="max-w-full h-auto rounded-lg border"
                  />
                </div>
              )}

              {selectedComplaint.completion_notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Completion Notes</label>
                  <p className="text-gray-900 mt-1 bg-gray-50 p-3 rounded-lg">{selectedComplaint.completion_notes}</p>
                </div>
              )}

              {selectedComplaint.completion_photo && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Completion Photo</label>
                  <img 
                    src={selectedComplaint.completion_photo} 
                    alt="Completion" 
                    className="max-w-full h-auto rounded-lg border"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Created At</label>
                  <p className="mt-1">{new Date(selectedComplaint.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Updated At</label>
                  <p className="mt-1">{new Date(selectedComplaint.updated_at).toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Staff Modal */}
      {showAssignModal && selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Assign Staff</h2>
              <button onClick={() => setShowAssignModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Staff Member</label>
              <select
                value={selectedStaff}
                onChange={(e) => setSelectedStaff(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">-- Select Staff --</option>
                {staffers.map(staff => (
                  <option key={staff.user.id} value={staff.user.id}>
                    {staff.user.first_name} {staff.user.last_name} ({staff.role})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowAssignModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignStaff}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Assign Staff
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {showStatusModal && selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Update Status</h2>
              <button onClick={() => setShowStatusModal(false)} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              {selectedStatus === 'completed' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Completion Notes</label>
                  <textarea
                    value={completionNotes}
                    onChange={(e) => setCompletionNotes(e.target.value)}
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter notes about the completion..."
                  />
                </div>
              )}
            </div>

            <div className="flex gap-2 justify-end mt-4">
              <button
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStatus}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintsPage;