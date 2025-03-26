// axiosConfig.ts (or .tsx)
import axios, { AxiosRequestConfig, CancelTokenSource } from 'axios';
import { v4 as uuidv4 } from 'uuid';

type ErrorStatusCode = 404 | 403 | 401 | 500 | 'network';
type ErrorMessages = Record<ErrorStatusCode, string>;

// Store cancel tokens for active requests
const pendingRequests: Map<string, CancelTokenSource> = new Map();

// Default error messages
const ERROR_MESSAGES: ErrorMessages = {
  401: 'Authentication required',
  404: 'Resource not found',
  403: 'Access denied',
  500: 'Server error',
  network: 'Network error'
};

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8081/api/v1',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add request ID for tracking
    const requestId = uuidv4().slice(0, 8);
    config.headers['X-Request-ID'] = requestId;

    // Log request in development
    console.log(`[${config.headers['X-Request-ID']}] Request:`, {
      url: config.url,
      method: config.method,
      timestamp: new Date().toISOString()
    });

    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    }

    // Create cancel token for this request
    const source = axios.CancelToken.source();
    config.cancelToken = source.token;
    
    // Store the cancel token with the request ID
    pendingRequests.set(requestId, source);
    
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    const requestId = response.config.headers?.['X-Request-ID'] as string;
    
    // Remove the cancel token for completed requests
    if (requestId) {
      pendingRequests.delete(requestId);
    }
    
    // Log response
    console.log(`[${requestId}] Response:`, {
      url: response.config.url,
      status: response.status,
      timestamp: new Date().toISOString()
    });
    
    return response;
  },
  (error) => {
    const requestId = error.config?.headers?.['X-Request-ID'] as string;
    
    // Remove the cancel token for failed requests
    if (requestId) {
      pendingRequests.delete(requestId);
    }
    
    // Get error details
    const status = error.response?.status;
    const url = error.config?.url || '';
    
    // Check if this is an auth-related endpoint - add more specific checks for login
    const isLoginEndpoint = url.includes('/user/login') || url.includes('/login') || url.includes('/signin');
    const isRegisterEndpoint = url.includes('/user/register') || url.includes('/register') || url.includes('/signup');
    const isAuthEndpoint = isLoginEndpoint || isRegisterEndpoint || url.includes('/auth/');
    
    // Log all details of the error for better debugging
    console.log('API Error Details:', { 
      url,
      status,
      method: error.config?.method,
      isLoginEndpoint,
      isAuthEndpoint,
      message: error.response?.data?.message || error.message,
      data: error.response?.data,
    });
    
    // Do not redirect on auth failures for auth endpoints 
    if (status === 401 && !isAuthEndpoint) {
      console.log('Redirecting to login due to 401 on protected route');
      // Only redirect for non-auth endpoints
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      // Add a small delay before redirect
      setTimeout(() => {
        window.location.href = '/signin';
      }, 300);
    }

    // Add friendly error message
    error.friendlyMessage = error.response 
      ? (ERROR_MESSAGES[status as ErrorStatusCode] || error.response.data?.message || 'An error occurred')
      : ERROR_MESSAGES.network;

    return Promise.reject(error);
  }
);

// Function to cancel all pending requests
export const cancelAllRequests = () => {
  pendingRequests.forEach((source, requestId) => {
    source.cancel(`Request ${requestId} cancelled by user`);
    pendingRequests.delete(requestId);
  });
};

export default apiClient;
