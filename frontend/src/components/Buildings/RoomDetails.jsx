// RoomDetails.jsx - Selected room details and requests
import React from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { statusColors } from '../../utils/constants.js';



const RoomDetails = ({
  selectedRoom,
  requests,
  isLoadingRequests,
  onNewRequest
}) => {
  if (!selectedRoom) return null;

  return (
    <div className="mt-6 bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800">{selectedRoom.room_name}</h3>
          <p className="text-gray-600">Room {selectedRoom.room_number}</p>
        </div>
        <div className="flex items-center space-x-3">
          <div 
            className="px-3 py-1 rounded-full text-sm font-medium"
            style={{ 
              backgroundColor: `${statusColors[selectedRoom.status]}20`,
              color: statusColors[selectedRoom.status]
            }}
          >
            {selectedRoom.status.replace('_', ' ').toUpperCase()}
          </div>
          <button
            onClick={onNewRequest}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Request
          </button>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-800">Recent Requests ({requests.length})</h4>
          {isLoadingRequests && (
            <div className="flex items-center text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Loading...
            </div>
          )}
        </div>
        <div className="space-y-3">
          {requests.length > 0 ? (
            requests.map(request => (
              <div key={request.id} className="bg-gray-50 p-4 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-gray-800">{request.title}</h5>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    request.priority === 'high' ? 'bg-red-100 text-red-700' :
                    request.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {request.priority?.toUpperCase() || 'MEDIUM'}
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-2">{request.description}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{request.created_at ? new Date(request.created_at).toLocaleDateString() : 'No date'}</span>
                  <div className="flex items-center">
                    <div 
                      className="w-2 h-2 rounded-full mr-2"
                      style={{ backgroundColor: statusColors[request.status] || statusColors.no_request }}
                    ></div>
                    <span className="capitalize">{request.status?.replace('_', ' ') || 'unknown'}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              No requests for this room yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomDetails;