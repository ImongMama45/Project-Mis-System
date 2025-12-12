// StatisticsLegend.jsx - Statistics and legend component
import React from 'react';
import { Info, Filter } from 'lucide-react';
import { statusColors }from '../../utils/constants.js';
import { statusIcons } from './StatusIcons';

const StatisticsLegend = ({ statistics }) => {
  return (
    <div className="block max-w-md mr-20">
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
          <Info className="w-5 h-5 mr-2 text-amber-600" />
          Floor Statistics
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total Rooms</span>
            <span className="font-bold text-gray-800">{statistics.total}</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
              <span className="text-gray-600">Pending</span>
            </div>
            <span className="font-bold text-gray-800">{statistics.pending}</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
              <span className="text-gray-600">In Progress</span>
            </div>
            <span className="font-bold text-gray-800">{statistics.in_progress}</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
              <span className="text-gray-600">Completed</span>
            </div>
            <span className="font-bold text-gray-800">{statistics.completed}</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-800">
          <Filter className="w-5 h-5 mr-2 text-amber-600" />
          Status Legend
        </h3>
        <div className="space-y-2">
          {Object.entries(statusColors).map(([status, color]) => (
            <div key={status} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border border-gray-200">
              <div className="flex items-center">
                <div 
                  className="w-4 h-4 rounded mr-3" 
                  style={{ backgroundColor: color }}
                ></div>
                <span className="capitalize text-gray-700">{status.replace('_', ' ')}</span>
              </div>
              {statusIcons[status] && React.cloneElement(statusIcons[status], { className: "w-4 h-4 text-gray-500" })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatisticsLegend;