// RoomTooltip.jsx - Tooltip component for room hover
import React, { useRef, useEffect } from 'react';
import { statusColors } from '../../utils/constants.js';

const RoomTooltip = ({ room, containerRef }) => {
  const tooltipRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (room && tooltipRef.current && containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const tooltipRect = tooltipRef.current.getBoundingClientRect();
        
        let x = e.clientX - containerRect.left + 20;
        let y = e.clientY - containerRect.top + 20;
        
        if (x + tooltipRect.width > containerRect.width) {
          x = containerRect.width - tooltipRect.width - 10;
        }
        if (y + tooltipRect.height > containerRect.height) {
          y = containerRect.height - tooltipRect.height - 10;
        }
        if (x < 10) x = 10;
        if (y < 10) y = 10;
        
        tooltipRef.current.style.left = `${x}px`;
        tooltipRef.current.style.top = `${y}px`;
      }
    };

    if (room) {
      document.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [room, containerRef]);

  if (!room) return null;

  return (
    <div 
      ref={tooltipRef}
      className="fixed z-40 bg-white border border-gray-200 rounded-xl p-4 shadow-xl backdrop-blur-sm max-w-xs pointer-events-none"
      style={{
        left: '0',
        top: '0'
      }}
    >
      <div className="flex items-center space-x-3 mb-2">
        <div 
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: statusColors[room.status] || statusColors.no_request }}
        ></div>
        <h4 className="font-bold text-gray-800">{room.room_name}</h4>
      </div>
      <p className="text-gray-600 text-sm">Room {room.room_number}</p>
      <p className="text-sm mt-2 text-gray-700 capitalize">Status: {room.status?.replace('_', ' ') || 'no request'}</p>
      <p className="text-sm text-gray-500">
        Requests: {room.request_count || 0}
      </p>
      <p className="text-sm text-gray-500 mt-2">
        Dimensions: {room.width}ft × {room.height}ft
      </p>
    </div>
  );
};

export default RoomTooltip;