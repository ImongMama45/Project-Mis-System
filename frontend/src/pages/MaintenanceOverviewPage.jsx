import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Building2, FileText, Calendar, ArrowRight, Settings, BarChart3 } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer.jsx';

export default function ManagementOverview() {
  const cards = [
    {
      title: 'Staffers',
      description: 'Manage personnel responsible for handling maintenance tasks and system operations.',
      page: 'staffers',
      icon: Users,
      gradient: 'from-purple-500 via-purple-600 to-indigo-600',
      bgPattern: 'bg-purple-50',
      iconColor: 'text-purple-600',
      stats: { label: 'Active Staff', value: '24' }
    },
    {
      title: 'Buildings',
      description: 'Oversee all registered buildings, their details, and assigned maintenance staff.',
      page: 'buildings',
      icon: Building2,
      gradient: 'from-green-500 via-green-600 to-emerald-600',
      bgPattern: 'bg-green-50',
      iconColor: 'text-green-600',
      stats: { label: 'Total Buildings', value: '12' }
    },
    {
      title: 'Complaints',
      description: 'Monitor maintenance requests, track their status, and assign to proper staff.',
      page: 'complaints',
      icon: FileText,
      gradient: 'from-red-500 via-red-600 to-rose-600',
      bgPattern: 'bg-red-50',
      iconColor: 'text-red-600',
      stats: { label: 'Open Requests', value: '18' }
    },
    {
      title: 'Schedules',
      description: 'Schedule tasks and monitor upcoming maintenance activities and deadlines.',
      page: 'calendar-admin',
      icon: Calendar,
      gradient: 'from-blue-500 via-blue-600 to-cyan-600',
      bgPattern: 'bg-blue-50',
      iconColor: 'text-blue-600',
      stats: { label: 'This Week', value: '7' }
    },
  ];

  const quickStats = [
    { label: 'Total Requests', value: '247', change: '+12%', trend: 'up' },
    { label: 'Completion Rate', value: '94%', change: '+3%', trend: 'up' },
    { label: 'Avg Response Time', value: '2.4h', change: '-15%', trend: 'down' },
  ];

  return (
    <>
      <Header showSearch={false} />
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Hero Section */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-12">
            {/* Breadcrumb */}

            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue-100 p-3 rounded-xl">
                    <Settings className="w-8 h-8 text-blue-600" />
                  </div>
                  <h1 className="text-4xl font-bold text-gray-900">Management Center</h1>
                </div>
                <p className="text-lg text-gray-600 max-w-2xl">
                  Centralized control for managing staff, buildings, maintenance requests, and schedules. 
                  Access all administrative tools from one place.
                </p>
              </div>
              
              {/* Quick Action Button */}
              <Link
                to="/analytics"
                className="hidden lg:flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <BarChart3 className="w-5 h-5" />
                View Analytics
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="max-w-7xl mx-auto px-6 -mt-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {quickStats.map((stat, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${
                    stat.trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    <span>{stat.change}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Management Cards Grid */}
        <div className="max-w-7xl mx-auto px-6 pb-16">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Management Modules</h2>
            <p className="text-gray-600">Select a module to manage different aspects of the system</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((card) => {
              const IconComponent = card.icon;
              return (
                <div
                  key={card.title}
                  className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-transparent"
                >
                  {/* Card Header with Gradient */}
                  <div className={`bg-gradient-to-br ${card.gradient} p-6 relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
                    
                    <div className="relative z-10">
                      <div className="bg-white/20 backdrop-blur-sm w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <IconComponent className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2">{card.title}</h3>
                      <div className="flex items-center gap-2 text-white/90 text-sm font-medium">
                        <span>{card.stats.label}:</span>
                        <span className="bg-white/20 px-2 py-0.5 rounded-full">{card.stats.value}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6">
                    <p className="text-gray-600 leading-relaxed mb-6 min-h-[60px]">
                      {card.description}
                    </p>

                    <Link
                      to={`/maintenance/${card.page.toLowerCase()}`}
                      className={`flex items-center justify-between w-full px-5 py-3 rounded-xl font-semibold transition-all duration-300 group-hover:transform group-hover:translate-x-1 bg-gradient-to-r ${card.gradient} text-white shadow-lg hover:shadow-xl`}
                    >
                      <span>Manage {card.title}</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>

                  {/* Hover Effect Overlay */}
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-gray-200 rounded-2xl pointer-events-none transition-all"></div>
                </div>
              );
            })}
          </div>

          {/* Additional Info Section */}
          <div className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
            <div className="flex items-start gap-6">
              <div className="bg-blue-100 p-4 rounded-xl">
                <Settings className="w-8 h-8 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Need Help?</h3>
                <p className="text-gray-600 mb-4">
                  Access our comprehensive documentation and support resources to make the most of your management tools.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors border border-gray-200 shadow-sm">
                    View Documentation
                  </button>
                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm">
                    Contact Support
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}