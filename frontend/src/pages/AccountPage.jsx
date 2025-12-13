import { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, User, Mail, Phone, Briefcase, Lock, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer.jsx';
import api from '../api/axios';

export default function AccountSettingsDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    contact_number: '',
    specialization: ''
  });
  
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  
  const [taskStats, setTaskStats] = useState({
    totalAssigned: 0,
    workInProgress: 0,
    completed: 0,
    pendingMonth: 0,
    complaintsMonth: 0,
    accomplishedMonth: 0
  });
  
  const [userId, setUserId] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchTaskStatistics();
      fetchSchedules();
    }
  }, [userId, currentDate]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        setError('Not authenticated. Please login.');
        setLoading(false);
        return;
      }

      const response = await api.get('/accounts/profile/');
      const data = response.data;
      
      setProfile(data);
      setUserId(data.id || data.user?.id);
      
      setFormData({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        email: data.email || '',
        contact_number: data.staff_profile?.contact_number || '',
        specialization: data.staff_profile?.specialization || ''
      });
      
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTaskStatistics = async () => {
    try {
      const response = await api.get('/maintenance/requests/');
      const data = response.data;
      
      let requestsArray = [];
      if (Array.isArray(data)) {
        requestsArray = data;
      } else if (data && Array.isArray(data.results)) {
        requestsArray = data.results;
      }

      const myRequests = requestsArray.filter(req => {
        const assignedToId = typeof req.assigned_to === 'object' 
          ? req.assigned_to?.id 
          : req.assigned_to;
        return assignedToId === userId;
      });

      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

      const totalAssigned = myRequests.length;
      const workInProgress = myRequests.filter(req => req.status === 'in_progress').length;
      const completed = myRequests.filter(req => req.status === 'completed').length;
      
      const monthlyRequests = myRequests.filter(req => {
        const createdDate = new Date(req.created_at);
        return createdDate >= monthStart && createdDate <= monthEnd;
      });
      
      const pendingMonth = monthlyRequests.filter(req => 
        req.status === 'pending' || req.status === 'approved'
      ).length;
      
      const complaintsMonth = monthlyRequests.length;
      const accomplishedMonth = monthlyRequests.filter(req => 
        req.status === 'completed'
      ).length;

      setTaskStats({
        totalAssigned,
        workInProgress,
        completed,
        pendingMonth,
        complaintsMonth,
        accomplishedMonth
      });

    } catch (err) {
      console.error('Error fetching task statistics:', err);
    }
  };

  const fetchSchedules = async () => {
    try {
      const response = await api.get('/maintenance/schedules/');
      const data = response.data;
      
      let schedulesArray = [];
      if (Array.isArray(data)) {
        schedulesArray = data;
      } else if (data && Array.isArray(data.results)) {
        schedulesArray = data.results;
      }

      const mySchedules = schedulesArray.filter(schedule => {
        const assignedToId = typeof schedule.assigned_to === 'object' 
          ? schedule.assigned_to?.id 
          : schedule.assigned_to;
        
        if (assignedToId !== userId) return false;
        
        const scheduleDate = new Date(schedule.schedule_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        return scheduleDate >= today;
      });

      mySchedules.sort((a, b) => new Date(a.schedule_date) - new Date(b.schedule_date));
      setSchedules(mySchedules.slice(0, 2));

    } catch (err) {
      console.error('Error fetching schedules:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateProfile = async () => {
    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        setError('Not authenticated. Please login.');
        return;
      }

      const staffProfileId = profile.staff_profile?.id || profile.id;

      await api.put(`/accounts/staff-management/${staffProfileId}/`, {
        username: profile.username,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        contact_number: formData.contact_number,
        specialization: formData.specialization,
        role: profile.role || profile.staff_profile?.role
      });

      await fetchProfile();
      
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (err) {
      setError(err.message);
      console.error('Error updating profile:', err);
      alert('Failed to update profile: ' + err.message);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    
    // Validation
    if (!passwordData.current_password || !passwordData.new_password || !passwordData.confirm_password) {
      setPasswordError('All fields are required');
      return;
    }
    
    if (passwordData.new_password.length < 8) {
      setPasswordError('New password must be at least 8 characters long');
      return;
    }
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      setPasswordError('New passwords do not match');
      return;
    }
    
    if (passwordData.current_password === passwordData.new_password) {
      setPasswordError('New password must be different from current password');
      return;
    }

    try {
      setPasswordLoading(true);
      
      await api.post('/accounts/change-password/', {
        old_password: passwordData.current_password,
        new_password: passwordData.new_password,
        new_password_confirm: passwordData.confirm_password
      });

      alert('Password changed successfully!');
      setShowPasswordModal(false);
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
    } catch (err) {
      console.error('Error changing password:', err);
      setPasswordError(
        err.response?.data?.error || 
        err.response?.data?.old_password?.[0] || 
        err.response?.data?.new_password?.[0] ||
        'Failed to change password. Please check your current password.'
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleViewCalendar = () => {
    navigate('/calendar');
  };

  const getRoleDisplay = (role) => {
    const roleMap = {
      'admin': 'Administrator',
      'staff': 'Maintenance Staff',
      'user': 'User',
      'Maintenance Staff': 'Maintenance Staff'
    };
    return roleMap[role] || role;
  };

  const getRoleBadgeColor = (role) => {
    const colorMap = {
      'admin': 'bg-purple-100 text-purple-800 border-purple-300',
      'staff': 'bg-blue-100 text-blue-800 border-blue-300',
      'user': 'bg-gray-100 text-gray-800 border-gray-300',
      'Maintenance Staff': 'bg-blue-100 text-blue-800 border-blue-300'
    };
    return colorMap[role] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;
    const days = [];
    
    for (let i = 0; i < adjustedFirstDay; i++) {
      days.push({ day: null });
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({ day });
    }
    
    return days;
  };

  const getHighlightedDays = () => {
    if (!schedules || schedules.length === 0) return [];
    
    return schedules.map(schedule => {
      const scheduleDate = new Date(schedule.schedule_date);
      if (scheduleDate.getMonth() === currentDate.getMonth() && 
          scheduleDate.getFullYear() === currentDate.getFullYear()) {
        return scheduleDate.getDate();
      }
      return null;
    }).filter(day => day !== null);
  };

  const formatScheduleForDisplay = (schedule) => {
    const scheduleDate = new Date(schedule.schedule_date);
    const monthAbbr = scheduleDate.toLocaleString('default', { month: 'short' }).toUpperCase();
    const day = scheduleDate.getDate();
    
    return {
      building: schedule.request_details?.building?.name || 'Unknown Building',
      room: schedule.request_details?.room?.name 
        ? `Room ${schedule.request_details.room.name}` 
        : 'Unknown Room',
      date: monthAbbr,
      day: day
    };
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="flex min-h-screen bg-gray-100 items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <p className="text-red-600 font-semibold mb-4">Error: {error}</p>
          <button 
            onClick={fetchProfile}
            className="px-6 py-2 bg-slate-800 text-white rounded hover:bg-slate-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const calendarDays = generateCalendarDays();
  const highlightedDays = getHighlightedDays();
  const displaySchedules = schedules.map(formatScheduleForDisplay);

  return (
    <>
      <Header />
      <div className="flex min-h-screen bg-gray-100">
        <div className="flex-1 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">Account Settings</h1>
            <p className="text-gray-600 mt-1">Manage your profile and account preferences</p>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white p-6 rounded-xl shadow-lg text-center">
                  <p className="text-sm mb-2 opacity-90">Number of Pendings (Month)</p>
                  <p className="text-5xl font-bold">{taskStats.pendingMonth}</p>
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white p-6 rounded-xl shadow-lg text-center">
                  <p className="text-sm mb-2 opacity-90">Number of Complaints (Month)</p>
                  <p className="text-5xl font-bold">{taskStats.complaintsMonth}</p>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-emerald-500 text-white p-6 rounded-xl shadow-lg text-center">
                  <p className="text-sm mb-2 opacity-90">Number of Accomplished (Month)</p>
                  <p className="text-5xl font-bold">{taskStats.accomplishedMonth}</p>
                </div>
              </div>

              {/* Profile Form */}
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <User className="text-slate-600" size={24} />
                    <h2 className="text-xl font-bold text-slate-900">Profile Information</h2>
                  </div>
                  <div className={`px-4 py-2 rounded-full border-2 flex items-center gap-2 ${getRoleBadgeColor(profile?.role || profile?.staff_profile?.role)}`}>
                    <Briefcase size={16} />
                    <span className="font-semibold text-sm">
                      Role: {getRoleDisplay(profile?.role || profile?.staff_profile?.role)}
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Username</label>
                  <input
                    type="text"
                    value={profile?.username || ''}
                    disabled
                    className="w-full px-4 py-2 border border-gray-300 rounded bg-gray-100 text-gray-600 cursor-not-allowed"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">First Name</label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-2 border border-gray-300 rounded ${isEditing ? 'bg-white' : 'bg-gray-50'}`}
                      placeholder="First Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Last Name</label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-2 border border-gray-300 rounded ${isEditing ? 'bg-white' : 'bg-gray-50'}`}
                      placeholder="Last Name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 flex items-center gap-2">
                      <Mail size={16} />
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-2 border border-gray-300 rounded ${isEditing ? 'bg-white' : 'bg-gray-50'}`}
                      placeholder="Email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 flex items-center gap-2">
                      <Phone size={16} />
                      Contact Number
                    </label>
                    <input
                      type="text"
                      name="contact_number"
                      value={formData.contact_number}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-2 border border-gray-300 rounded ${isEditing ? 'bg-white' : 'bg-gray-50'}`}
                      placeholder="Contact Number"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Specialization</label>
                  <input
                    type="text"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full px-4 py-2 border border-gray-300 rounded ${isEditing ? 'bg-white' : 'bg-gray-50'}`}
                    placeholder="e.g., Plumbing, Electrical, HVAC"
                  />
                </div>

                <div className="flex gap-4">
                  {!isEditing ? (
                    <>
                      <button 
                        onClick={() => setIsEditing(true)}
                        className="px-6 py-2 bg-slate-800 text-white rounded hover:bg-slate-700 transition-colors font-semibold"
                      >
                        EDIT PROFILE
                      </button>
                      <button 
                        onClick={() => setShowPasswordModal(true)}
                        className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors font-semibold flex items-center gap-2"
                      >
                        <Lock size={16} />
                        CHANGE PASSWORD
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={handleUpdateProfile}
                        className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors font-semibold"
                      >
                        SAVE CHANGES
                      </button>
                      <button 
                        onClick={() => {
                          setIsEditing(false);
                          setFormData({
                            first_name: profile.first_name || '',
                            last_name: profile.last_name || '',
                            email: profile.email || '',
                            contact_number: profile.staff_profile?.contact_number || '',
                            specialization: profile.staff_profile?.specialization || ''
                          });
                        }}
                        className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors font-semibold"
                      >
                        CANCEL
                      </button>
                    </>
                  )}
                </div>

                {/* Work Stats */}
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div>
                    <p className="text-sm font-semibold mb-2">Total work assigned</p>
                    <div className="h-20 bg-gray-100 rounded flex items-center justify-center">
                      <span className="text-2xl font-bold text-gray-600">{taskStats.totalAssigned}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold mb-2">Work in Progress</p>
                    <div className="h-20 bg-yellow-100 rounded flex items-center justify-center">
                      <span className="text-2xl font-bold text-yellow-600">{taskStats.workInProgress}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold mb-2">Completed Tasks</p>
                    <div className="h-20 bg-green-100 rounded flex items-center justify-center">
                      <span className="text-2xl font-bold text-green-600">{taskStats.completed}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Calendar and Schedules */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Track Complaint</h3>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <button 
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <span className="font-medium">
                    {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </span>
                  <button 
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-sm mb-2">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                    <div key={i} className="font-semibold text-gray-600 py-1">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1 text-center text-sm">
                  {calendarDays.map((item, index) => (
                    <div
                      key={index}
                      className={`py-2 rounded cursor-pointer transition-all ${
                        item.day === null
                          ? 'text-transparent'
                          : highlightedDays.includes(item.day)
                          ? 'bg-indigo-500 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {item.day || '.'}
                    </div>
                  ))}
                </div>

                <div className="mt-4 text-center">
                  <button
                    onClick={handleViewCalendar}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <Calendar size={18} />
                    View Full Calendar
                  </button>
                </div>
              </div>

              {/* Schedules */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-800">Upcoming Schedules</h3>
                {displaySchedules.length > 0 ? (
                  displaySchedules.map((schedule, index) => (
                    <div
                      key={index}
                      className="bg-white p-4 rounded-lg shadow flex items-center justify-between hover:shadow-md transition-shadow"
                    >
                      <div>
                        <p className="font-semibold text-sm">{schedule.building}</p>
                        <p className="text-gray-600 text-xs">{schedule.room}</p>
                      </div>
                      <div className="text-center bg-indigo-50 px-3 py-2 rounded-lg">
                        <p className="text-xs font-semibold text-indigo-600">{schedule.date}</p>
                        <p className="text-2xl font-bold text-indigo-700">{schedule.day}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white p-4 rounded-lg shadow text-center text-gray-500 text-sm">
                    No upcoming schedules
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
          onClick={() => setShowPasswordModal(false)}
        >
          <div 
            className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-100 p-3 rounded-xl">
                  <Lock className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Change Password</h3>
              </div>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {passwordError && (
              <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg border border-red-200 text-sm">
                {passwordError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Current Password
                </label>
                <input
                  type="password"
                  name="current_password"
                  value={passwordData.current_password}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  New Password
                </label>
                <input
                  type="password"
                  name="new_password"
                  value={passwordData.new_password}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter new password (min. 8 characters)"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirm_password"
                  value={passwordData.confirm_password}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Confirm new password"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  onClick={handleChangePassword}
                  disabled={passwordLoading}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {passwordLoading ? 'Changing...' : 'Change Password'}
                </button>
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordData({
                      current_password: '',
                      new_password: '',
                      confirm_password: ''
                    });
                    setPasswordError('');
                  }}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}