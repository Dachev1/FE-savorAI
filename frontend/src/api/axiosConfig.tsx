// axiosConfig.ts (or .tsx)
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 1000000,
});

// Request interceptor for API calls
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    } else {
      // Add a guest token for recipe endpoints to avoid Forbidden errors
      // This is a temporary solution until proper authentication is implemented
      if (config.url?.includes('/recipes')) {
        config.headers['X-Guest-Access'] = 'true';
      }
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Ensure error.config exists before accessing it
    const originalRequest = error.config || {};
    
    try {
      // Handle token expiration
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        // Clear invalid token
        localStorage.removeItem('authToken');
        
        // If you have a refresh token mechanism, you could implement it here
        // For now, just reject and let the auth context handle the redirect
        error.friendlyMessage = 'Your session has expired. Please log in again.';
        return Promise.reject(error);
      }
      
      // For network errors, provide a more user-friendly message
      if (error.message === 'Network Error') {
        console.error('Network error: Unable to connect to the server');
        error.friendlyMessage = 'Unable to connect to the server. Please check your internet connection and try again later.';
      }
      
      // For server errors
      if (error.response?.status >= 500) {
        console.error('Server error:', error.response?.data);
        error.friendlyMessage = 'The service is temporarily unavailable. Please try again later.';
        
        // Add more specific details if available
        if (error.response?.data?.message) {
          error.friendlyMessage = error.response?.data?.message;
        } else if (error.response?.data?.error) {
          error.friendlyMessage = error.response?.data?.error;
        }
      }
      
      // For authentication errors
      if (error.response?.status === 403) {
        console.error('Forbidden error:', error.response?.data);
        error.friendlyMessage = 'You don\'t have permission to access this feature. Please log in with an appropriate account.';
      }
      
      // For client errors
      if (error.response?.status >= 400 && error.response?.status < 500 && error.response?.status !== 403) {
        console.error('Client error:', error.response?.data);
        
        if (error.response?.status === 400) {
          error.friendlyMessage = 'Please check your input and try again.';
        } else if (error.response?.data?.message) {
          error.friendlyMessage = error.response?.data?.message;
        } else {
          error.friendlyMessage = 'There was an error with your request. Please try again.';
        }
      }
      
      // Ensure a friendlyMessage is always set
      if (!error.friendlyMessage) {
        error.friendlyMessage = 'An unexpected error occurred. Please try again.';
      }
    } catch (interceptorError) {
      // If anything fails in our error handling, log it but don't break the app
      console.error('Error in axios interceptor:', interceptorError);
      error.friendlyMessage = 'An unexpected error occurred. Please try again.';
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
