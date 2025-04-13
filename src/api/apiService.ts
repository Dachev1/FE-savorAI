import axios from 'axios';
import type { CancelTokenSource } from 'axios';
import auth from '../utils/auth';
import { API_CONFIG, API_PATHS } from './serviceConfig';
import { getCsrfHeaders } from '../utils/csrf';

// Track in-flight requests
const pendingRequests = new Map<string, CancelTokenSource>();

// Add global declarations
declare global {
  interface Window {
    dispatchEvent(event: Event): boolean;
  }
}

// Trigger auth state changed event
const triggerAuthStateChanged = () => {
  window.dispatchEvent(new CustomEvent('auth-state-changed', {
    detail: { timestamp: Date.now() }
  }));
};

// Common request config for all API instances
const commonConfig = {
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

// Create API instances
export const authApi = axios.create({
  baseURL: API_CONFIG.USER_SERVICE,
  ...commonConfig
});

export const recipeApi = axios.create({
  baseURL: API_CONFIG.RECIPE_SERVICE,
  ...commonConfig
});

const api = axios.create({
  baseURL: API_CONFIG.USER_SERVICE,
  ...commonConfig
});

// Route API requests to the correct service
api.interceptors.request.use(async (config) => {
  config.baseURL = config.url?.includes('/v1/recipes') 
    ? API_CONFIG.RECIPE_SERVICE 
    : API_CONFIG.USER_SERVICE;
  return config;
});

// Create a standardized error response
const createErrorResponse = (message: string) => ({
  cancelled: true,
  isCancel: true,
  isCancelled: true,
  message
});

// Add a method to cancel all pending requests
const cancelPendingRequests = () => {
  pendingRequests.forEach((source, key) => {
    source.cancel('Operation canceled due to logout');
    pendingRequests.delete(key);
  });
};

// Assign cancelPendingRequests to all API instances
api.cancelPendingRequests = cancelPendingRequests;
authApi.cancelPendingRequests = cancelPendingRequests;
recipeApi.cancelPendingRequests = cancelPendingRequests;

// Add custom property to the AxiosRequestConfig
declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    onComplete?: () => void;
  }
  
  export interface AxiosInstance {
    cancelPendingRequests?: () => void;
  }
}

// Configure interceptors for each API instance
[api, authApi, recipeApi].forEach(apiInstance => {
  // Request interceptor
  apiInstance.interceptors.request.use(
    async (config) => {
      // Allow username change requests during change process
      const isUsernameChangeInProgress = sessionStorage.getItem('username_change_in_progress') === 'true';
      if (isUsernameChangeInProgress && 
          !config.url?.includes('/auth/logout') && 
          !config.url?.includes('/user/update-username')) {
        return Promise.reject(createErrorResponse('Username change in progress - request cancelled'));
      }
      
      // Identify endpoint types
      const isPublicEndpoint = 
        config.url?.includes('/auth/') || 
        config.url?.includes('/public/') ||
        (config.url?.includes('/users') && config.method === 'post');
      const isLogoutRequest = config.url?.includes('/auth/logout');
      
      // Add CSRF token for recipe service
      if (config.baseURL === API_CONFIG.RECIPE_SERVICE && config.method !== 'get') {
        Object.assign(config.headers, getCsrfHeaders());
      }
      
      // Handle duplicate requests
      const pendingKey = `${config.method}-${config.url}-${JSON.stringify(config.params || {})}`;
      if (pendingRequests.has(pendingKey)) {
        const source = pendingRequests.get(pendingKey)!;
        source.cancel('Duplicate request cancelled');
        pendingRequests.delete(pendingKey);
      }
      
      // Create cancel token and track request
      const source = axios.CancelToken.source();
      config.cancelToken = config.cancelToken || source.token;
      pendingRequests.set(pendingKey, source);
      config.onComplete = () => pendingRequests.delete(pendingKey);
      
      // Add auth token for protected endpoints
      if (!isPublicEndpoint || isLogoutRequest) {
        if (!auth.isTokenValid() && !isLogoutRequest) {
          source.cancel('No valid authentication');
          pendingRequests.delete(pendingKey);
          return Promise.reject(createErrorResponse('No valid authentication'));
        }
        
        const token = auth.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      
      return config;
    },
    error => Promise.reject(error)
  );

  // Response interceptor
  apiInstance.interceptors.response.use(
    (response) => {
      // Clean up request tracking
      if (response.config.onComplete) response.config.onComplete();
      
      // Extract and store token
      const token = response.data?.token || 
                   response.headers['x-auth-token'] || 
                   response.headers['authorization'] ||
                   response.headers['Authorization'];
      
      if (token) {
        auth.setToken(token.startsWith('Bearer ') ? token.substring(7) : token);
      }
      
      return response;
    },
    (error) => {
      // Clean up request tracking
      if (error.config?.onComplete) error.config.onComplete();
      
      // Handle cancelled/network requests
      if (axios.isCancel(error) || error.cancelled) {
        return Promise.reject(createErrorResponse(error.message || 'Request cancelled'));
      } else if (!error.response) {
        window.dispatchEvent(new CustomEvent('api-network-error', {
          detail: { message: error.message }
        }));
      }
      
      // Handle authentication errors
      else if (error.response.status === 403 && 
          !error.config.url?.includes('/api/v1/profile') && 
          !error.config.url?.includes('/api/v1/user/update-username')) {
        auth.removeToken();
        triggerAuthStateChanged();
      }
      
      return Promise.reject(error);
    }
  );
});

export default api; 