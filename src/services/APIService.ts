// Process JWT token from response header and save it
private processBearerToken(response: AxiosResponse) {
  const authHeader = response.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    this.setToken(token);
    
    // Check if token contains role information
    try {
      const tokenData = parseJwt(token);
      if (tokenData && tokenData.role) {
        // Always update user data with token information
        const userData = {
          ...JSON.parse(localStorage.getItem('userData') || '{}'),
          role: tokenData.role,
          lastTokenUpdate: Date.now()
        };
        
        localStorage.setItem('userData', JSON.stringify(userData));
        
        // Dispatch event for role change
        window.dispatchEvent(new CustomEvent('auth-state-changed', {
          detail: { 
            roleChanged: true, 
            newRole: tokenData.role,
            source: 'token-refresh'
          }
        }));
      }
    } catch (e) {
      console.error('Error processing token data:', e);
    }
  }
  return response;
}

// Parse JWT token to extract data
function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
} 