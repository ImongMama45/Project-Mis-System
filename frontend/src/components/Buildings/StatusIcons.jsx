// StatusIcons.jsx - Status icon components
import React from 'react';
import { Clock, AlertCircle, CheckCircle } from 'lucide-react';

export const statusIcons = {
  pending: <Clock className="w-4 h-4" />,
  in_progress: <AlertCircle className="w-4 h-4" />,
  completed: <CheckCircle className="w-4 h-4" />,
  no_request: null
};

export const StatusIcon = ({ status }) => {
  return statusIcons[status];
};