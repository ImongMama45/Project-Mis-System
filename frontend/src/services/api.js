import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle token refresh and 401 errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${API_BASE_URL}/api/accounts/refresh/`, {
          refresh: refreshToken,
        });

        localStorage.setItem('access_token', response.data.access);
        api.defaults.headers.Authorization = `Bearer ${response.data.access}`;
        
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/accounts/login/', credentials),
  register: (userData) => api.post('/accounts/register/', userData),
  refreshToken: (refresh) => api.post('/accounts/refresh/', { refresh }),
};

// Maintenance API
export const maintenanceAPI = {
  getAll: () => api.get('/maintenance/requests/'),
  getById: (id) => api.get(`/maintenance/requests/${id}/`),

  create: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    return api.post('/maintenance/requests/create/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  claim: (id) => api.post(`/maintenance/requests/${id}/claim/`),

  complete: (id, data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    return api.post(`/maintenance/requests/${id}/complete/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  updateStatus: (id, data) =>
    api.post(`/maintenance/requests/${id}/update-status/`, data),
};

// Request System API (Alias for maintenance)
export const requestAPI = {
  getAll: () => api.get('/maintenance/requests/'),
  getById: (id) => api.get(`/maintenance/requests/${id}/`),
  create: (data) => api.post('/maintenance/requests/', data),
  update: (id, data) => api.put(`/maintenance/requests/${id}/`, data),
  delete: (id) => api.delete(`/maintenance/requests/${id}/`),
};

// Notification API
export const notificationAPI = {
  getAll: () => api.get('/notifications/my/'),
  markAsRead: (id) => api.post(`/notifications/${id}/mark-read/`),
  markAllAsRead: () => api.post('/notifications/mark-all-read/'),
  delete: (id) => api.delete(`/notifications/${id}/`),
};

// Calendar/Schedule API
export const calendarAPI = {
  // Get schedules for a specific month
  getMonthSchedules: (year, month) => {
    console.log(`📅 Fetching schedules for ${year}-${month}`);
    return api.get('/calendar/calendar/month/', {
      params: { year, month }
    });
  },
  
  // ✅ NEW: Get ALL schedules (fallback if month filtering doesn't work)
  getAllSchedules: () => {
    console.log('📅 Fetching ALL schedules');
    return api.get('/calendar/calendar/');
  },
  
  // Create/update schedule for a maintenance request
  setSchedule: (requestId, data) => {
    console.log(`📅 Creating schedule for request ${requestId}:`, data);
    return api.post(`/calendar/schedule/${requestId}/`, data);
  },
  
  // Get schedule for a specific request
  getRequestSchedule: (requestId) => {
    console.log(`📅 Getting schedule for request ${requestId}`);
    return api.get(`/calendar/schedule/${requestId}/`);
  },
};

// Buildings/Location API
export const buildingsAPI = {
  getAll: () => api.get('/location/buildings/'),
  getFloors: (buildingId) => 
    api.get(`/location/buildings/${buildingId}/floors/`),
  getRooms: (floorId) => 
    api.get(`/location/floors/${floorId}/rooms/`)
};

// ✅ UPDATED: Requests API with proper filtering support
export const requestsAPI = {
  // Get all requests with optional filters
  getAll: (filters = {}) => {
    const params = {};
    if (filters.room) params.room = filters.room;
    if (filters.building) params.building = filters.building;
    if (filters.floor) params.floor = filters.floor;
    if (filters.status) params.status = filters.status;
    
    return api.get('/maintenance/requests/', { params });
  },
  
  // Get requests for a specific room
  getByRoom: (roomId) => 
    api.get('/maintenance/requests/', {
      params: { room: roomId }
    }),
  
  // Get requests for a specific building
  getByBuilding: (buildingId) =>
    api.get('/maintenance/requests/', {
      params: { building: buildingId }
    }),
  
  // Get requests for a specific floor
  getByFloor: (floorId) =>
    api.get('/maintenance/requests/', {
      params: { floor: floorId }
    }),
  
  // ✅ FIXED: Create request using proper endpoint and format
  create: (data) => {
    // Transform data to match backend expectations
    const requestData = {
      requester_name: data.requester_name || 'Anonymous',
      role: data.role || 'staff',
      description: data.description,
      building_id: data.building_id,
      floor_id: data.floor_id,
      room_id: data.room_id,
      section: data.section || '',
      student_id: data.student_id || ''
    };
    
    console.log('Creating maintenance request with data:', requestData);
    
    return api.post('/maintenance/requests/create/', requestData);
  },
  
  // Update request status
  update: (id, data) => api.patch(`/maintenance/requests/${id}/`, data)
};

export default api;