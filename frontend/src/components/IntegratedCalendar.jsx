import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import MaintenanceCalendar  from './Calendar.jsx';
import Header from '../components/Header';
import Footer from '../components/Footer.jsx'
import { Link } from 'react-router-dom';
import MaintenanceCalendarComponent from './MaintenanceCalendar.jsx';

function IntegratedCalendarMaintenance() {
  const [activeTab, setActiveTab] = useState('calendar');

  return (
    <>
    <Header />
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        <button className="text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-1">
          <Link to="/management/">← Back to Management Overview</Link>
        </button>
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-indigo-600" />
              <h1 className="text-3xl font-bold text-gray-800">Maintenance Management</h1>
            </div>
          </div>
          
          <div className="flex gap-2 bg-white rounded-lg p-1 shadow-md inline-flex">
            <button
              onClick={() => setActiveTab('calendar')}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                activeTab === 'calendar'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              📅 Calendar View
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                activeTab === 'list'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              📋 Maintenance List
            </button>
          </div>
        </div>

        {activeTab === 'calendar' ? <MaintenanceCalendar /> : <MaintenanceCalendarComponent />}
      </div>
    </div>
    <Footer />
    </> 
  );
}

export default IntegratedCalendarMaintenance;