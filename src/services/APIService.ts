import axiosInstance from '../api/axiosConfig';

/**
 * Parse JWT token to extract data
 * @param token The JWT token to parse
 * @returns The decoded token data or null if invalid
 */
export function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Error parsing JWT token:', e);
    return null;
  }
}

/**
 * General API service for making HTTP requests
 * This is a thin wrapper around axiosInstance for any legacy code
 */
const APIService = {
  /**
   * Send a GET request
   * @param url The URL to send the request to
   * @param params Query parameters
   * @param config Additional axios config options
   */
  get: (url: string, params = {}, config = {}) => {
    return axiosInstance.get(url, { ...config, params });
  },
  
  /**
   * Send a POST request
   * @param url The URL to send the request to
   * @param data The data to send in the request body
   * @param config Additional axios config options
   */
  post: (url: string, data = {}, config = {}) => {
    return axiosInstance.post(url, data, config);
  },
  
  /**
   * Send a PUT request
   * @param url The URL to send the request to
   * @param data The data to send in the request body
   * @param config Additional axios config options
   */
  put: (url: string, data = {}, config = {}) => {
    return axiosInstance.put(url, data, config);
  },
  
  /**
   * Send a DELETE request
   * @param url The URL to send the request to
   * @param config Additional axios config options
   */
  delete: (url: string, config = {}) => {
    return axiosInstance.delete(url, config);
  }
};

export default APIService; 