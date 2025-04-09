import axios, { CancelTokenSource } from 'axios';
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

// Create a dedicated authentication API instance (port 8081)
export const authApi = axios.create({
  baseURL: API_CONFIG.USER_SERVICE,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Create a dedicated recipe API instance (port 8082)
export const recipeApi = axios.create({
  baseURL: API_CONFIG.RECIPE_SERVICE,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Configure API instance for backwards compatibility
// Default to the user service for auth endpoints
const api = axios.create({
  baseURL: API_CONFIG.USER_SERVICE,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Route API requests to the correct service
api.interceptors.request.use(async (config) => {
  // Determine if this is a recipe endpoint
  const isRecipeEndpoint = config.url?.includes('/v1/recipes');
  
  // Change baseURL for recipe endpoints
  if (isRecipeEndpoint) {
    config.baseURL = API_CONFIG.RECIPE_SERVICE;
  } else {
    config.baseURL = API_CONFIG.USER_SERVICE;
  }
  
  return config;
});

// Add a method to cancel all pending requests
api.cancelPendingRequests = () => {
  pendingRequests.forEach((source, key) => {
    source.cancel('Operation canceled due to logout');
    pendingRequests.delete(key);
  });
};

// Same for recipe and auth APIs
authApi.cancelPendingRequests = api.cancelPendingRequests;
recipeApi.cancelPendingRequests = api.cancelPendingRequests;

// Add custom property to the AxiosRequestConfig
declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    onComplete?: () => void;
  }
  
  export interface AxiosInstance {
    cancelPendingRequests?: () => void;
  }
}

// Configure interceptors for each API instance (auth and recipe)
[api, authApi, recipeApi].forEach(apiInstance => {
  // Request interceptor
  apiInstance.interceptors.request.use(
    async (config) => {
      // Identify public endpoints
      const isPublicEndpoint = 
        config.url?.includes('/auth/') || 
        config.url?.includes('/public/') ||
        (config.url?.includes('/users') && config.method === 'post');
      
      // Special case for logout requests to ensure they always have auth headers
      const isLogoutRequest = config.url?.includes('/auth/logout');
      
      // Add CSRF token to non-GET requests for the recipe service
      if (config.baseURL === API_CONFIG.RECIPE_SERVICE && config.method !== 'get') {
        const csrfHeaders = getCsrfHeaders();
        Object.keys(csrfHeaders).forEach(key => {
          config.headers[key] = csrfHeaders[key];
        });
      }
      
      // Handle duplicate requests
      const pendingKey = `${config.method}-${config.url}-${JSON.stringify(config.params || {})}`;
      if (pendingRequests.has(pendingKey)) {
        const source = pendingRequests.get(pendingKey)!;
        source.cancel('Duplicate request cancelled');
        pendingRequests.delete(pendingKey);
      }
      
      // Create cancel token
      const source = axios.CancelToken.source();
      config.cancelToken = config.cancelToken || source.token;
      pendingRequests.set(pendingKey, source);
      config.onComplete = () => pendingRequests.delete(pendingKey);
      
      // Add auth token for protected endpoints or logout requests
      if (!isPublicEndpoint || isLogoutRequest) {
        if (!auth.isTokenValid() && !isLogoutRequest) {
          source.cancel('No valid authentication');
          return Promise.reject({ cancelled: true });
        }
        
        const token = auth.getToken();
        if (token) {
          // Always add Bearer prefix to the Authorization header
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
      if (response.config.onComplete) response.config.onComplete();
      
      // Handle auth tokens
      const isAuthEndpoint = response.config.url?.includes('/auth/');
      
      // Save token from response
      if (isAuthEndpoint && response.data?.token) {
        // Store raw token without Bearer prefix
        const token = response.data.token;
        const rawToken = token.startsWith('Bearer ') ? token.substring(7) : token;
        auth.setToken(rawToken);
      } else {
        const authHeader = 
          response.headers['x-auth-token'] || 
          response.headers['authorization'] ||
          response.headers['Authorization'];
          
        if (authHeader) {
          // Store raw token without Bearer prefix
          const rawToken = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
          auth.setToken(rawToken);
        }
      }
      
      return response;
    },
    (error) => {
      if (error.config?.onComplete) error.config.onComplete();
      
      // Handle cancelled requests
      if (axios.isCancel(error) || error.cancelled) {
        return Promise.reject({
          isCancel: true,
          isCancelled: true,
          message: error.message || 'Request cancelled'
        });
      }
      
      // Handle network errors
      if (!error.response) {
        window.dispatchEvent(new CustomEvent('api-network-error', {
          detail: { message: error.message }
        }));
      }
      
      // Handle auth errors
      if (error.response?.status === 401 || error.response?.status === 403) {
        if (error.response.status === 403 && !error.config.url?.includes('/profile')) {
          auth.removeToken();
          triggerAuthStateChanged();
        }
      }
      
      return Promise.reject(error);
    }
  );
});

// Export the correctly configured API instance
export default api; 