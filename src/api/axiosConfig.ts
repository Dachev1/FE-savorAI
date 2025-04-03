import axios from 'axios';
import auth from '../utils/auth';

// Configure base API settings
const axiosInstance = axios.create({
  baseURL: 'http://localhost:8082/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add authentication token to every request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = auth.getToken() || localStorage.getItem('auth_token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle common response errors across the app
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle authentication errors
    if (error.response?.status === 401) {
      // Trigger logout event
      window.dispatchEvent(new CustomEvent('auth-state-changed', {
        detail: {
          action: 'logout',
          reason: 'unauthorized',
          timestamp: Date.now()
        }
      }));
    }
    
    // Add friendly messages for common errors
    if (error.response?.status === 403) {
      error.friendlyMessage = 'You do not have permission to perform this action.';
    } else if (error.response?.status === 404) {
      error.friendlyMessage = 'The requested resource was not found.';
    } else if (error.response?.status === 500) {
      error.friendlyMessage = 'A server error occurred. Please try again later.';
    } else if (!error.response && error.request) {
      error.friendlyMessage = 'Cannot connect to the server. Please check your internet connection.';
    }
    
    return Promise.reject(error);
  }
);

// Helper method to cancel pending requests if needed
axiosInstance.cancelPendingRequests = () => {
  // Implementation can be added if needed
};

export default axiosInstance; 