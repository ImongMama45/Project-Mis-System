import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${API_URL}/accounts/refresh/`, {
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
  // Get all maintenance requests
  getAll: () => api.get('/maintenance/requests/'),
  
  // Create new maintenance request (no auth required)
  create: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    return axios.post(`${API_URL}/maintenance/requests/create/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // Claim a request (staff only)
  claim: (id) => api.post(`/maintenance/requests/${id}/claim/`),
  
  // Complete a request (staff only)
  complete: (id, data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    return api.post(`/maintenance/requests/${id}/complete/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// Request System API
export const requestAPI = {
  getAll: () => api.get('/requests/'),
  getById: (id) => api.get(`/requests/${id}/`),
  create: (data) => api.post('/requests/', data),
  update: (id, data) => api.put(`/requests/${id}/`, data),
  delete: (id) => api.delete(`/requests/${id}/`),
};

export default api;