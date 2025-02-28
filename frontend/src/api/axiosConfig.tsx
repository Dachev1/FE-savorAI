// axiosConfig.ts (or .tsx)
import axios from 'axios';

// Create axios instance with default configuration
const instance = axios.create({
  baseURL: '', // Empty baseURL since we'll use absolute paths
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor for common handling
instance.interceptors.request.use(
  (config) => {
    // You can add auth tokens here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for common error handling
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors here
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default instance;
