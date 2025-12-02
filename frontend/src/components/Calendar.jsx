import React, { useState, useEffect } from 'react';
import { requestAPI } from '../services/api';

function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [markedDates, setMarkedDates] = useState({
    pending: [],
    in_progress: [],
    completed: [],
  });
  const [requests, setRequests] = useState([]);
  const [selectedDateRequests, setSelectedDateRequests] = useState([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchRequestsForCalendar();
  }, [currentDate]);

  const fetchRequestsForCalendar = async () => {
    try {
      const response = await requestAPI.getAll();
      const allRequests = response.data;
      setRequests(allRequests);

      // Group dates by status
      const pending = new Set();
      const inProgress = new Set();
      const completed = new Set();

      allRequests.forEach(req => {
        const date = new Date(req.created_at);
        const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

        if (req.status === 'pending') {
          pending.add(dateKey);
        } else if (req.status === 'in_progress' || req.status === 'approved') {
          inProgress.add(dateKey);
        } else if (req.status === 'completed') {
          completed.add(dateKey);
        }
      });

      setMarkedDates({
        pending: Array.from(pending),
        in_progress: Array.from(inProgress),
        completed: Array.from(completed),
      });
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;
    
    return { firstDay: adjustedFirstDay, daysInMonth };
  };

  const getDateMarkerColor = (day) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const dateKey = `${year}-${month}-${day}`;

    // Priority: completed > in_progress > pending
    if (markedDates.completed.includes(dateKey)) {
      return 'bg-green-500';
    } else if (markedDates.in_progress.includes(dateKey)) {
      return 'bg-red-500';
    } else if (markedDates.pending.includes(dateKey)) {
      return 'bg-yellow-500';
    }
    return null;
  };

  const handleDateClick = (day) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const requestsOnDate = requests.filter(req => {
      const reqDate = new Date(req.created_at);
      return reqDate.getFullYear() === year &&
             reqDate.getMonth() === month &&
             reqDate.getDate() === day;
    });

    if (requestsOnDate.length > 0) {
      setSelectedDateRequests(requestsOnDate);
      setShowDetailsModal(true);
    }
  };

  const renderCalendar = () => {
    const { firstDay, daysInMonth } = getDaysInMonth(currentDate);
    const days = [];
    const today = new Date().getDate();
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const isCurrentMonth = currentDate.getMonth() === currentMonth && 
                          currentDate.getFullYear() === currentYear;

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="text-center py-2"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = isCurrentMonth && day === today;
      const markerColor = getDateMarkerColor(day);

      days.push(
        <div
          key={day}
          onClick={() => handleDateClick(day)}
          className={`text-center py-2 rounded relative cursor-pointer transition-colors ${
            isToday ? 'bg-blue-500 text-white font-bold' :
            markerColor ? 'hover:bg-gray-100' :
            'text-gray-700 hover:bg-gray-100'
          }`}
        >
          {day}
          {markerColor && (
            <div className={`absolute top-1 right-1 w-2 h-2 ${markerColor} rounded-full`}></div>
          )}
        </div>
      );
    }

    return days;
  };

  const changeMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-red-100 text-red-800',
      completed: 'bg-green-100 text-green-800',
      rejected: 'bg-gray-100 text-gray-800',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Request Calendar</h1>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          {/* Calendar Header */}
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => changeMonth(-1)}
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors font-bold text-xl"
            >
              ‹
            </button>
            <h2 className="text-2xl font-bold text-gray-800">
              {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h2>
            <button
              onClick={() => changeMonth(1)}
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors font-bold text-xl"
            >
              ›
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
              <div key={i} className="text-center font-bold text-gray-600 text-sm py-2">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {renderCalendar()}
          </div>

          {/* Legend */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="font-semibold text-gray-700 mb-3">Status Legend</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Pending</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-600">In Progress</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Completed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Requests Modal */}
        {showDetailsModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
            onClick={() => setShowDetailsModal(false)}
          >
            <div
              className="bg-white rounded-lg w-full max-w-2xl p-6 max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                  Requests on this Date ({selectedDateRequests.length})
                </h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                {selectedDateRequests.map((req) => (
                  <div key={req.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-800">
                        Request #{req.id}
                      </h4>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(req.status)}`}>
                        {req.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><strong>Type:</strong> {req.request_type}</p>
                      <p><strong>Building:</strong> {req.building?.name || 'N/A'}</p>
                      <p><strong>Room:</strong> {req.room}</p>
                      <p><strong>Description:</strong> {req.description}</p>
                      {req.assigned_to && (
                        <p><strong>Assigned to:</strong> {req.assigned_to.username}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Calendar;