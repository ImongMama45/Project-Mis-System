import React, { useState, useEffect } from 'react';
import { Bell, Calendar, AlertCircle, Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { notificationAPI } from '../services/api';

const NotificationsWidget = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationAPI.getAll();
      
      let notificationsData = [];
      
      if (Array.isArray(response.data)) {
        notificationsData = response.data;
      } else if (response.data?.notifications && Array.isArray(response.data.notifications)) {
        notificationsData = response.data.notifications;
      } else if (response.data?.results && Array.isArray(response.data.results)) {
        notificationsData = response.data.results;
      }
      
      // Get only the latest 5 notifications
      setNotifications(notificationsData.slice(0, 5));
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getNotificationIcon = (message) => {
    if (message.includes('scheduled')) return <Calendar className="w-4 h-4 text-blue-500" />;
    if (message.includes('assigned')) return <AlertCircle className="w-4 h-4 text-orange-500" />;
    if (message.includes('status')) return <Clock className="w-4 h-4 text-purple-500" />;
    return <Bell className="w-4 h-4 text-gray-500" />;
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleViewAll = () => {
    navigate('/notifications');
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-gray-700" />
          <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <button
          onClick={handleViewAll}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors"
        >
          View All
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500 text-sm">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-3 rounded-lg border transition-all hover:shadow-md cursor-pointer ${
                !notif.is_read 
                  ? 'bg-blue-50 border-blue-200' 
                  : 'bg-gray-50 border-gray-200'
              }`}
              onClick={handleViewAll}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getNotificationIcon(notif.message)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${!notif.is_read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                    {notif.message.length > 80 
                      ? `${notif.message.substring(0, 80)}...` 
                      : notif.message
                    }
                  </p>
                  {notif.request_details && (
                    <p className="text-xs text-gray-500 mt-1">
                      Request #{notif.request_details.id} - {notif.request_details.request_type}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {getTimeAgo(notif.created_at)}
                  </p>
                </div>
                {!notif.is_read && (
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {notifications.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={handleViewAll}
            className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors text-sm"
          >
            See All Notifications
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationsWidget;