// Room.jsx - Individual room rendering component
import React from 'react';
import {
  BLUEPRINT_PAPER,
  BLUEPRINT_STAIRS,
  BLUEPRINT_HALLWAY,
  BLUEPRINT_CR,
  BLUEPRINT_LINE,
  BLUEPRINT_LABEL,
  BLUEPRINT_TEXT,
  statusColors
}   from '../../utils/constants.js';

const Room = ({
  room,
  isHovered,
  isSelected,
  showDimensions,
  onMouseEnter,
  onMouseLeave,
  onClick
}) => {
  const hasRequests = room.request_count > 0;
  
  if (room.special === 'title' || room.special === 'scale') {
    return (
      <g key={room.id}>
        <text
          x={room.x + room.width / 2}
          y={room.y + room.height / 2}
          textAnchor="middle"
          fill={room.special === 'title' ? '#1E3A8A' : '#374151'}
          fontSize={room.special === 'title' ? '14' : '12'}
          fontWeight={room.special === 'title' ? 'bold' : 'normal'}
          fontFamily="monospace"
          className="select-none"
        >
          {room.room_number}
        </text>
      </g>
    );
  }
  
  const fillColor = room.special === 'stairs' ? BLUEPRINT_STAIRS : 
                   room.special === 'hallway' ? BLUEPRINT_HALLWAY : 
                   room.special === 'cr' ? BLUEPRINT_CR :
                   BLUEPRINT_PAPER;
  const strokeColor = isSelected ? '#3B82F6' : 
                     hasRequests ? statusColors[room.status] : 
                     BLUEPRINT_LINE;
  const strokeWidth = isSelected ? 3 : (isHovered ? 2 : 1.5);
  const strokeDasharray = room.special === 'hallway' ? "5,3" : "none";

  return (
    <g
      key={room.id}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      className="cursor-pointer transition-all duration-200"
      style={{
        transform: isHovered ? 'scale(1.02)' : 'scale(1)',
        transformOrigin: 'center'
      }}
    >
      <rect
        x={room.x}
        y={room.y}
        width={room.width}
        height={room.height}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeDasharray={strokeDasharray}
        rx="2"
        ry="2"
        className="transition-all duration-200"
      />
      
      {room.special === 'stairs' && (
        <>
          <line x1={room.x + 10} y1={room.y + 10} x2={room.x + room.width - 10} y2={room.y + 10} stroke="#93C5FD" strokeWidth="1" />
          <line x1={room.x + 10} y1={room.y + 30} x2={room.x + room.width - 10} y2={room.y + 30} stroke="#93C5FD" strokeWidth="1" />
          <line x1={room.x + 10} y1={room.y + 50} x2={room.x + room.width - 10} y2={room.y + 50} stroke="#93C5FD" strokeWidth="1" />
          <line x1={room.x + 10} y1={room.y + 70} x2={room.x + room.width - 10} y2={room.y + 70} stroke="#93C5FD" strokeWidth="1" />
          <line x1={room.x + 10} y1={room.y + 90} x2={room.x + room.width - 10} y2={room.y + 90} stroke="#93C5FD" strokeWidth="1" />
        </>
      )}
      
      <text
        x={room.x + room.width / 2}
        y={room.y + room.height / 2}
        textAnchor="middle"
        fill={BLUEPRINT_LABEL}
        fontSize={Math.min(16, Math.max(10, room.width / 8))}
        fontWeight="600"
        className="select-none"
      >
        {room.room_number}
      </text>
      
      {room.special !== 'hallway' && (
        <text
          x={room.x + room.width / 2}
          y={room.y + room.height - 8}
          textAnchor="middle"
          fill={BLUEPRINT_TEXT}
          fontSize="10"
          className="select-none"
        >
          {room.room_name.length > 20 ? room.room_name.substring(0, 20) + '...' : room.room_name}
        </text>
      )}
      
      {room.status !== 'no_request' && (
        <circle
          cx={room.x + room.width - 12}
          cy={room.y + 12}
          r="6"
          fill={statusColors[room.status]}
          stroke="#FFFFFF"
          strokeWidth="1"
        />
      )}
      
      {hasRequests && (
        <g>
          <circle
            cx={room.x + 12}
            cy={room.y + 12}
            r="8"
            fill="#EF4444"
            stroke="#FFFFFF"
            strokeWidth="1"
          />
          <text
            x={room.x + 12}
            y={room.y + 15}
            textAnchor="middle"
            fill="white"
            fontSize="8"
            fontWeight="bold"
          >
            {room.request_count}
          </text>
        </g>
      )}
      
      {showDimensions && room.special !== 'hallway' && !room.special && (
        <>
          <text
            x={room.x + room.width / 2}
            y={room.y - 5}
            textAnchor="middle"
            fill="#64748B"
            fontSize="8"
          >
            {room.width}ft
          </text>
          <text
            x={room.x - 15}
            y={room.y + room.height / 2}
            textAnchor="middle"
            fill="#64748B"
            fontSize="8"
            transform={`rotate(-90, ${room.x - 15}, ${room.y + room.height / 2})`}
          >
            {room.height}ft
          </text>
        </>
      )}
      
      {isHovered && (
        <rect
          x={room.x}
          y={room.y}
          width={room.width}
          height={room.height}
          fill="rgba(59, 130, 246, 0.1)"
          rx="2"
          ry="2"
        />
      )}
    </g>
  );
};

export default Room;