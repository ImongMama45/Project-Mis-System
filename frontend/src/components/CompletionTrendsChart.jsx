import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CompletionTrendsChart = ({ data, title = "Completion Trends", showClickHint = false }) => {
  const navigate = useNavigate();

  const handleChartClick = () => {
    if (showClickHint) {
      navigate('/analytics');
    }
  };

  return (
    <div 
      className={`bg-white rounded-2xl shadow-lg p-6 transition-all ${
        showClickHint ? 'cursor-pointer hover:shadow-xl hover:scale-[1.02]' : ''
      }`}
      onClick={handleChartClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        </div>
        {showClickHint && (
          <span className="text-xs text-green-600 font-medium bg-green-50 px-3 py-1 rounded-full">
            Click for details →
          </span>
        )}
      </div>
      
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
          />
          <YAxis stroke="#6b7280" />
          <Tooltip 
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="completed" 
            stroke="#10b981" 
            strokeWidth={3}
            dot={{ fill: '#10b981', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CompletionTrendsChart;