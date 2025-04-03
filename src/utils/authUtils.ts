/**
 * Simple, reliable logout function that doesn't use React hooks
 */
export const logout = async () => {
  try {
    // Get token (try all possible storage locations)
    const token = localStorage.getItem('token') || 
                 localStorage.getItem('authToken') || 
                 sessionStorage.getItem('token');
    
    // Only send request if we have a token
    if (token) {
      console.log('Sending logout request to backend...');
      
      // Call the backend logout endpoint
      const response = await fetch('/api/v1/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        } 
      });
      
      console.log('Logout response status:', response.status);
    } else {
      console.warn('No token found, skipping backend logout call');
    }
  } catch (error) {
    console.error('Logout request error:', error);
  } finally {
    // Always clear all auth data regardless of API success
    console.log('Clearing local storage...');
    
    // Clear common auth-related keys
    ['token', 'authToken', 'refreshToken', 'user'].forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
    
    // Redirect to login page
    window.location.href = '/auth/signin';
  }
}; 