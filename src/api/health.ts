import apiClient from './axiosConfig';

/**
 * Health check utility to verify backend connectivity
 * Used for system diagnostics and troubleshooting
 */
export const checkBackendHealth = async (): Promise<{
  status: 'online' | 'offline' | 'error';
  message: string;
  timestamp: string;
}> => {
  try {
    // Use the username check endpoint as it's lightweight and doesn't require auth
    const response = await apiClient.get('/api/v1/user/check-username?username=healthcheck', { 
      timeout: 5000,
      // Don't fail on 400 as that means the server is running but username invalid
      validateStatus: (status) => (status >= 200 && status < 300) || status === 400
    });
    
    return {
      status: 'online',
      message: 'Backend is online and responding',
      timestamp: new Date().toISOString()
    };
  } catch (error: any) {
    // Determine if it's CORS, connection refused, or other error
    const isConnectionRefused = error.message?.includes('Network Error');
    const isCORS = error.message?.includes('CORS');
    
    let errorMessage = 'Failed to connect to backend';
    
    if (isConnectionRefused) {
      errorMessage = 'Cannot connect to backend server. Please check if server is running.';
    } else if (isCORS) {
      errorMessage = 'CORS policy preventing connection. Check backend CORS settings.';
    } else if (error.response) {
      errorMessage = `Backend error: ${error.response.status} ${error.response.statusText}`;
    }
    
    return {
      status: 'offline',
      message: errorMessage,
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Creates a persistent backend health check that will automatically
 * retry and notify when backend comes back online
 */
export const setupHealthMonitor = (
  onStatusChange?: (status: 'online' | 'offline' | 'error') => void,
  checkInterval = 30000 // 30 seconds by default
): () => void => {
  let lastStatus: 'online' | 'offline' | 'error' | null = null;
  let timerId: number | null = null;
  
  const check = async () => {
    const health = await checkBackendHealth();
    
    // Only notify on status changes
    if (health.status !== lastStatus && onStatusChange) {
      onStatusChange(health.status);
    }
    
    lastStatus = health.status;
  };
  
  // Run initial check
  check();
  
  // Set up interval
  timerId = window.setInterval(check, checkInterval);
  
  // Return cleanup function
  return () => {
    if (timerId !== null) {
      window.clearInterval(timerId);
    }
  };
};

export default {
  checkBackendHealth,
  setupHealthMonitor
}; 