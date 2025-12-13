import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, PlayCircle, MapPin, User, Clock, Plus } from 'lucide-react';
import { maintenanceAPI, calendarAPI } from '../services/api';
import MaintenanceCalendar from './Calendar';

function MaintenanceCalendarComponent() {
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [scheduleForm, setScheduleForm] = useState({
    schedule_date: '',
    estimated_duration: '',
    assigned_staff: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await maintenanceAPI.getAll();
      let requestsData = Array.isArray(response.data) 
        ? response.data 
        : response.data.results || [];
      
      requestsData = requestsData.filter(r => r.status !== 'for_approval');
      setMaintenanceRequests(requestsData);
    } catch (error) {
      console.error('❌ Error fetching data:', error);
      setError('Failed to load data. Please try again.');
      setMaintenanceRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleRequest = (request) => {
    setSelectedRequest(request);
    setScheduleForm({
      schedule_date: '',
      estimated_duration: '',
      assigned_staff: ''
    });
    setShowScheduleModal(true);
  };

  const validateScheduleForm = () => {
    const errors = [];
    if (!scheduleForm.schedule_date) {
      errors.push('Schedule date is required');
    }
    return errors;
  };

  const submitSchedule = async () => {
    const errors = validateScheduleForm();
    if (errors.length > 0) {
      alert(errors.join('\n'));
      return;
    }

    try {
      const scheduleData = {
        schedule_date: scheduleForm.schedule_date,
      };
      
      if (scheduleForm.estimated_duration?.trim()) {
        scheduleData.estimated_duration = scheduleForm.estimated_duration.trim();
      }
      
      if (scheduleForm.assigned_staff?.trim()) {
        scheduleData.assigned_staff = scheduleForm.assigned_staff.trim();
      }

      await calendarAPI.setSchedule(selectedRequest.id, scheduleData);
      
      alert('Schedule created successfully!');
      setShowScheduleModal(false);
      setSelectedRequest(null);
      
      await fetchData();
      
    } catch (error) {
      console.error('Error creating schedule:', error);
      alert('Failed to create schedule. Please try again.');
    }
  };

  const handleUpdateStatus = async (requestId, newStatus) => {
    try {
      await maintenanceAPI.updateStatus(requestId, { status: newStatus });
      alert('Status updated successfully!');
      fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
    };
    return badges[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'in_progress': return <PlayCircle className="w-5 h-5 text-blue-600" />;
      case 'pending': return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default: return null;
    }
  };

  return (
    <>
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">All Maintenance Requests</h2>
          <div className="text-sm text-gray-600">
            Total: <span className="font-bold text-indigo-600">{maintenanceRequests.length}</span>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading requests...</p>
          </div>
        ) : maintenanceRequests.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No maintenance requests found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {maintenanceRequests.map((request) => (
              <div key={request.id} className="border border-gray-200 rounded-lg p-5 hover:shadow-lg transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(request.status)}
                    <div>
                      <h4 className="font-semibold text-gray-800 text-lg">Request #{request.id}</h4>
                      <p className="text-sm text-gray-600 mt-1">{request.description}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(request.status)}`}>
                    {request.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-gray-600 font-medium">Location</p>
                      <p className="text-gray-800">
                        {request.building?.name || 'N/A'}
                        {request.room && `, Room ${request.room.name || request.room}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <User className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-gray-600 font-medium">Requester</p>
                      <p className="text-gray-800">{request.requester_name || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-gray-600 font-medium">Created</p>
                      <p className="text-gray-800">
                        {new Date(request.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleScheduleRequest(request)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all text-sm font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Schedule
                  </button>
                  
                  {request.status === 'pending' && (
                    <button
                      onClick={() => handleUpdateStatus(request.id, 'in_progress')}
                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all text-sm font-medium"
                    >
                      Start Work
                    </button>
                  )}
                  
                  {request.status === 'in_progress' && (
                    <button
                      onClick={() => handleUpdateStatus(request.id, 'completed')}
                      className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-all text-sm font-medium"
                    >
                      Mark Complete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showScheduleModal && selectedRequest && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
          onClick={() => setShowScheduleModal(false)}
        >
          <div
            className="bg-white rounded-xl w-full max-w-md p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6 pb-4 border-b">
              <h3 className="text-2xl font-bold text-gray-800">Schedule Request #{selectedRequest.id}</h3>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="text-gray-400 hover:text-gray-600 text-3xl font-bold leading-none"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Schedule Date *</label>
                <input
                  type="date"
                  value={scheduleForm.schedule_date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setScheduleForm({...scheduleForm, schedule_date: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Duration</label>
                <input
                  type="text"
                  placeholder="e.g., 2 hours, 30 minutes"
                  value={scheduleForm.estimated_duration}
                  onChange={(e) => setScheduleForm({...scheduleForm, estimated_duration: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assign Staff ID</label>
                <input
                  type="number"
                  placeholder="Staff user ID (e.g., 1, 2, 3)"
                  value={scheduleForm.assigned_staff}
                  onChange={(e) => setScheduleForm({...scheduleForm, assigned_staff: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div className="pt-4 flex gap-3">
                <button
                  onClick={submitSchedule}
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-all font-medium"
                >
                  Create Schedule
                </button>
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="px-6 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-all font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default MaintenanceCalendarComponent;