import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Logo from '../images/Logo.png';
import api, { maintenanceAPI, requestAPI } from '../api/axios.js';
import Footer from '../components/Footer.jsx';
import RequestTrendsChart from '../components/RequestTrendsChart.jsx';
import CompletionTrendsChart from '../components/CompletionTrendsChart.jsx';
import NotificationsWidget from '../components/NotificationsWidget.jsx';

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalTasks: 0,
    pendingCount: 0,
    inProgressCount: 0,
    completedCount: 0,
    recentRequests: [],
    requestTrends: [],
    completionTrends: [],
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await requestAPI.getAll();
      
      let requests;
      if (Array.isArray(response.data)) {
        requests = response.data;
      } else if (response.data && Array.isArray(response.data.results)) {
        requests = response.data.results;
      } else {
        console.error('Unexpected API response format:', response.data);
        requests = [];
      }

      const pendingCount = requests.filter(r => r.status === 'pending').length;
      const inProgressCount = requests.filter(r => r.status === 'in_progress').length;
      const completedCount = requests.filter(r => r.status === 'completed').length;
      const totalTasks = requests.length;

      const recentRequests = requests.slice(0, 4);
      const requestTrends = calculateRequestTrends(requests, 30);
      const completionTrends = calculateCompletionTrends(requests, 30);

      setStats({
        totalTasks,
        pendingCount,
        inProgressCount,
        completedCount,
        recentRequests,
        requestTrends,
        completionTrends,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setStats({
        totalTasks: 0,
        pendingCount: 0,
        inProgressCount: 0,
        completedCount: 0,
        recentRequests: [],
        requestTrends: [],
        completionTrends: [],
      });
    }
  };

  const calculateRequestTrends = (requests, days) => {
    const trends = {};
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      trends[dateStr] = 0;
    }

    requests.forEach(req => {
      const reqDate = new Date(req.created_at).toISOString().split('T')[0];
      if (trends.hasOwnProperty(reqDate)) {
        trends[reqDate]++;
      }
    });

    return Object.entries(trends).map(([date, count]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      requests: count
    }));
  };

  const calculateCompletionTrends = (requests, days) => {
    const trends = {};
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      trends[dateStr] = 0;
    }

    const completedRequests = requests.filter(r => r.status === 'completed');
    completedRequests.forEach(req => {
      const reqDate = new Date(req.updated_at).toISOString().split('T')[0];
      if (trends.hasOwnProperty(reqDate)) {
        trends[reqDate]++;
      }
    });

    return Object.entries(trends).map(([date, count]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      completed: count
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <Header showSearch={true} />

      <div className="p-6">
        <div className="pb-6 flex items-center space-x-6">
          <div className="w-20 h-20 rounded-full bg-white p-2 shadow-2xl flex items-center justify-center">
            <img
              className="w-full h-full object-contain"
              src={Logo}
              alt="Maintenance Tracker Logo"
            />
          </div>

          <div className="flex flex-col">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Dalubhasaan ng Lungsod ng Lucena
            </h1>
            <h3 className="text-sm md:text-lg text-gray-500 font-medium">
              Maintenance Tracker
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Section - Stats and Graphs */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-md p-4">
                <h3 className="text-sm text-gray-600 mb-2">Total Tasks</h3>
                <p className="text-3xl font-bold text-gray-800">{stats.totalTasks}</p>
              </div>
              <div className="bg-yellow-50 rounded-xl shadow-md p-4">
                <h3 className="text-sm text-yellow-800 mb-2">Pending</h3>
                <p className="text-3xl font-bold text-yellow-600">{stats.pendingCount}</p>
              </div>
              <div className="bg-blue-50 rounded-xl shadow-md p-4">
                <h3 className="text-sm text-blue-800 mb-2">In Progress</h3>
                <p className="text-3xl font-bold text-blue-600">{stats.inProgressCount}</p>
              </div>
              <div className="bg-green-50 rounded-xl shadow-md p-4">
                <h3 className="text-sm text-green-800 mb-2">Completed</h3>
                <p className="text-3xl font-bold text-green-600">{stats.completedCount}</p>
              </div>
            </div>

            {/* Charts Row - Using Recharts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <RequestTrendsChart 
                data={stats.requestTrends}
                title="Request Trends (30 Days)"
                showClickHint={true}
              />
              
              <CompletionTrendsChart 
                data={stats.completionTrends}
                title="Completions (30 Days)"
                showClickHint={true}
              />
            </div>

            {/* Recent Requests */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800">
                  Recent Requests ({stats.totalTasks})
                </h3>
                <Link
                  to="/dashboard"
                  className="text-blue-500 hover:text-blue-600 font-medium"
                >
                  VIEW ALL →
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {stats.recentRequests.map((request) => (
                  <div
                    key={request.id}
                    className="bg-gray-50 rounded-xl p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-800">
                          {request.request_type}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {request.building?.name || 'N/A'} - Room {request.room?.name || request.room || 'N/A'}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        request.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        request.status === 'completed' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {request.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{request.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Section - Quick Actions & Notifications */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  to="/maintenance/calendar-admin"
                  className="block w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-xl transition-colors text-center font-medium"
                >
                  📅 View Calendar
                </Link>
                <Link
                  to="/maintenance/complaints"
                  className="block w-full bg-purple-500 hover:bg-purple-600 text-white py-3 px-4 rounded-xl transition-colors text-center font-medium"
                >
                  📋 All Requests
                </Link>
                <Link
                  to="/analytics"
                  className="block w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-xl transition-colors text-center font-medium"
                >
                  📊 View Analytics
                </Link>
              </div>
            </div>

            {/* Notifications Widget */}
            <NotificationsWidget />
          </div>
        </div>
      </div>

      <Footer/>
    </div>
  );
}

export default AdminDashboard;