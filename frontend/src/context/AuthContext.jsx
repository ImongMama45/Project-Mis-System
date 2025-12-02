import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

  // Check if user is authenticated on mount
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      console.log('Attempting login for:', username);
      
      const response = await fetch(`${API_BASE_URL}/api/accounts/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      console.log('Login response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Login failed:', errorData);
        
        // Format error messages nicely
        let errorMessage = '';
        if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (typeof errorData === 'object') {
          // Handle field-specific errors
          errorMessage = Object.entries(errorData)
            .map(([key, value]) => {
              const msg = Array.isArray(value) ? value.join(', ') : value;
              return `${key}: ${msg}`;
            })
            .join('; ');
        } else {
          errorMessage = 'Invalid credentials';
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Login tokens received:', { hasAccess: !!data.access, hasRefresh: !!data.refresh });
      
      // Store tokens
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);

      // Fetch user profile to get role information
      console.log('Fetching user profile...');
      const userResponse = await fetch(`${API_BASE_URL}/api/accounts/profile/`, {
        headers: {
          'Authorization': `Bearer ${data.access}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Profile response status:', userResponse.status);

      if (userResponse.ok) {
        const userData = await userResponse.json();
        console.log('Fetched user profile:', userData);
        
        // Extract role - check multiple possible locations
        let role = 'staff'; // default
        if (userData.role) {
          role = userData.role;
        } else if (userData.staff_profile && userData.staff_profile.role) {
          role = userData.staff_profile.role;
        }
        
        // Normalize role to lowercase for consistent comparison
        role = role.toLowerCase().trim();
        
        const userInfo = {
          id: userData.id,
          username: userData.username,
          email: userData.email,
          role: role,
          first_name: userData.first_name,
          last_name: userData.last_name,
        };
        
        console.log('Storing user info:', userInfo);
        localStorage.setItem('user', JSON.stringify(userInfo));
        setUser(userInfo);
        setIsAuthenticated(true);
        
        return { success: true };
      } else {
        const errorText = await userResponse.text();
        console.error('Profile fetch failed:', errorText);
        throw new Error('Failed to fetch user profile');
      }
    } catch (error) {
      console.error('Login error:', error);
      // Clean up on error
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      return { success: false, error: error.message };
    }
  };

  const register = async (userData) => {
    try {
      console.log('Sending registration data:', userData);
      
      const response = await fetch(`${API_BASE_URL}/api/accounts/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      console.log('Registration response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Registration error data:', errorData);
        
        // Format error messages nicely
        let errorMessage = 'Registration failed: ';
        if (typeof errorData === 'object') {
          errorMessage += Object.entries(errorData)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
            .join('; ');
        } else {
          errorMessage += errorData.message || JSON.stringify(errorData);
        }
        
        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      console.log('Registration successful:', responseData);
      
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    navigate('/login');
  };

  const refreshToken = async () => {
    try {
      const refresh = localStorage.getItem('refresh_token');
      if (!refresh) return false;

      const response = await fetch(`${API_BASE_URL}/api/accounts/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('access_token', data.access);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  };

  const value = {
    isAuthenticated,
    user,
    login,
    register,
    logout,
    refreshToken,
    loading,
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};