// axiosConfig.ts (or .tsx)
import axios, { AxiosRequestConfig, CancelTokenSource, AxiosError } from 'axios';
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

// Only log in development environment
const isDev = import.meta.env.DEV;

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8081',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true
});

// Generate a unique ID for request tracking
const generateRequestId = (): string => uuidv4().slice(0, 8);

// Optimized URL pattern matching for auth endpoints
const AUTH_PATTERNS = [
  '/api/v1/auth/signin', 
  '/api/v1/auth/signup', 
  '/api/v1/auth/logout',
  '/api/v1/auth/refresh-token'
];

// Check if URL is an auth endpoint 
const isAuthEndpoint = (url: string): boolean => {
  return AUTH_PATTERNS.some(pattern => url.includes(pattern));
};

// Extend AxiosError with our custom properties
interface EnhancedAxiosError extends AxiosError {
  friendlyMessage?: string;
}

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add request ID for tracking
    const requestId = generateRequestId();
    config.headers['X-Request-ID'] = requestId;

    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      // Check token validity
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          const expiryTime = payload.exp * 1000;
          
          // Only use token if it's not expired
          if (Date.now() < expiryTime) {
            config.headers['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
          } else if (import.meta.env.DEV) {
            console.warn('Expired token detected in request interceptor');
          }
        }
      } catch (e) {
        // Invalid token format, remove it silently
        if (import.meta.env.DEV) {
          console.error('Invalid token format:', e);
        }
      }
    }

    // Create cancel token for this request
    const source = axios.CancelToken.source();
    config.cancelToken = source.token;
    
    // Store the cancel token with the request ID
    pendingRequests.set(requestId, source);
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    const requestId = response.config.headers?.['X-Request-ID'] as string;
    
    // Remove the cancel token for completed requests
    if (requestId) {
      pendingRequests.delete(requestId);
    }
    
    return response;
  },
  (error: EnhancedAxiosError) => {
    const requestId = error.config?.headers?.['X-Request-ID'] as string;
    
    // Remove the cancel token for failed requests
    if (requestId) {
      pendingRequests.delete(requestId);
    }
    
    // Get error details
    const status = error.response?.status;
    const url = error.config?.url || '';
    const isAuthUrl = isAuthEndpoint(url);
    
    // Handle session expiration for non-auth endpoints
    if (status === 401 && !isAuthUrl) {
      // Clear session
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('cachedUserProfile');
      sessionStorage.removeItem('user_session');
      
      // Prevent multiple redirects by checking if we're already on the login page
      if (!window.location.pathname.includes('/signin')) {
        // Add a small delay before redirect
        setTimeout(() => {
          window.location.href = '/signin';
        }, 300);
      }
    }

    // Improve auth error messages
    if (status === 401) {
      if (isAuthUrl && url.includes('/signin')) {
        error.friendlyMessage = 'Invalid credentials. Please check your username and password.';
      } else {
        error.friendlyMessage = 'Your session has expired. Please sign in again.';
      }
    } else if (status === 403) {
      if (url.includes('/logout')) {
        // Don't show an error for logout 403s, they're handled elsewhere
        error.friendlyMessage = 'Successfully logged out';
      } else {
        error.friendlyMessage = 'You do not have permission to perform this action.';
      }
    }

    // Add friendly error message
    if (!error.friendlyMessage) {
      error.friendlyMessage = getReadableErrorMessage(error);
    }

    return Promise.reject(error);
  }
);

// Helper to get error message from response
function getErrorMessage(error: EnhancedAxiosError): string {
  if (!error.response || !error.response.data) {
    return error.message;
  }
  
  const data = error.response.data;
  if (typeof data === 'object' && data !== null && 'message' in data) {
    return (data as any).message;
  }
  
  return error.message;
}

// Helper to get user-friendly error messages
function getReadableErrorMessage(error: EnhancedAxiosError): string {
  if (!error.response) {
    return ERROR_MESSAGES.network;
  }
  
  const status = error.response.status;
  
  // Try to get a message from the response data
  const responseMessage = getErrorMessage(error);
  
  // Return the most specific message available
  return responseMessage || ERROR_MESSAGES[status as ErrorStatusCode] || `Error ${status}`;
}

// Function to cancel all pending requests
export const cancelAllRequests = () => {
  pendingRequests.forEach((source, requestId) => {
    source.cancel(`Request ${requestId} cancelled by user`);
    pendingRequests.delete(requestId);
  });
};

// Export retry helper for failed requests
export const retryRequest = async (failedRequest: any) => {
  if (!failedRequest.config) {
    throw new Error('Invalid request configuration');
  }
  
  // Create a new request with the same config
  return await apiClient(failedRequest.config);
};

export default apiClient;
