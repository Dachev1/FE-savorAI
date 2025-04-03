import { jwtDecode } from 'jwt-decode';

// Types
export interface TokenPayload {
  sub: string;
  exp: number;
  iat: number;
  role?: string;
  username?: string;
  userId?: string;
  email?: string;
  banned?: boolean;
  [key: string]: any;
}

// Storage keys
const AUTH_TOKEN_KEY = 'auth_token';
const USER_DATA_KEY = 'user_data';

// Cache for token validation
const tokenCache = {
  token: '',
  isValid: false,
  timestamp: 0
};

// Auth utilities
const auth = {
  /**
   * Parse JWT token to extract payload
   */
  parseToken(token: string): TokenPayload | null {
    try {
      // Remove 'Bearer ' prefix if present before decoding
      const tokenValue = token.startsWith('Bearer ') ? token.substring(7) : token;
      return jwtDecode<TokenPayload>(tokenValue);
    } catch (error) {
      return null;
    }
  },

  /**
   * Store auth token
   */
  setToken(token: string): void {
    // Store token without Bearer prefix to avoid issues with token validation
    const tokenValue = token.startsWith('Bearer ') ? token.substring(7) : token;
    localStorage.setItem(AUTH_TOKEN_KEY, tokenValue);
    tokenCache.token = '';
  },

  /**
   * Get stored token
   */
  getToken(): string | null {
    try {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      return token;
    } catch (error) {
      console.error('Error retrieving auth token:', error);
      return null;
    }
  },

  /**
   * Remove auth token
   */
  removeToken(): void {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    tokenCache.token = '';
  },

  /**
   * Store user data
   */
  setUser<T>(userData: T): void {
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
  },

  /**
   * Get stored user data
   */
  getUser<T>(): T | null {
    const data = localStorage.getItem(USER_DATA_KEY);
    if (!data) return null;
    
    try {
      return JSON.parse(data) as T;
    } catch {
      return null;
    }
  },

  /**
   * Clear all auth data (logout)
   */
  clearAuth(): void {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_DATA_KEY);
    sessionStorage.clear();
    // Reset token cache completely
    tokenCache.token = '';
    tokenCache.isValid = false;
    tokenCache.timestamp = 0;
    
    console.log('Auth data cleared successfully');
  },

  /**
   * Reset auth state for clean login
   */
  resetForLogin(): void {
    this.clearAuth();
    // Force a reload of the token validation state on next check
    tokenCache.token = '';
    tokenCache.isValid = false;
    tokenCache.timestamp = 0;
  },

  /**
   * Check if token is valid
   */
  isTokenValid(): boolean {
    try {
      const token = this.getToken();
      if (!token) return false;
      
      // Check cache first
      const now = Date.now();
      if (tokenCache.token === token && (now - tokenCache.timestamp) < 30000) {
        return tokenCache.isValid;
      }
      
      try {
        const payload = this.parseToken(token);
        if (!payload || !payload.exp) {
          tokenCache.token = token;
          tokenCache.isValid = false;
          tokenCache.timestamp = now;
          return false;
        }
        
        // Check expiration with 30s buffer
        const expiryTime = payload.exp * 1000;
        const isValid = expiryTime > (now + 30000);
        
        // Check for banned status in token
        if (payload.banned === true) {
          console.warn('User is banned according to token payload');
          tokenCache.token = token;
          tokenCache.isValid = false;
          tokenCache.timestamp = now;
          return false;
        }
        
        // Update cache
        tokenCache.token = token;
        tokenCache.isValid = isValid;
        tokenCache.timestamp = now;
        
        return isValid;
      } catch {
        tokenCache.token = token;
        tokenCache.isValid = false;
        tokenCache.timestamp = now;
        return false;
      }
    } catch (error) {
      console.error('Error validating token:', error);
      return false;
    }
  },

  /**
   * Check if user is banned
   */
  isUserBanned(): boolean {
    // First check local storage user data
    const userData = this.getUser<{ banned?: boolean }>();
    if (userData?.banned === true) {
      return true;
    }
    
    // Then check token payload
    const token = this.getToken();
    if (!token) return false;
    
    const payload = this.parseToken(token);
    return payload?.banned === true;
  },

  /**
   * Get user role from token
   */
  getRole(): string | null {
    const token = this.getToken();
    if (!token) return null;
    
    const payload = this.parseToken(token);
    return payload?.role || null;
  },

  /**
   * Check if user is admin
   */
  isAdmin(): boolean {
    const role = this.getRole();
    return !!role && ['admin', 'administrator'].includes(role.toLowerCase());
  },
  
  /**
   * Notify about role changes
   */
  notifyRoleChange(previousRole: string, newRole: string): void {
    // Dispatch role change event
    window.dispatchEvent(new CustomEvent('user-role-changed', { 
      detail: { 
        previousRole,
        newRole,
        timestamp: Date.now()
      }
    }));
    
    // Also trigger auth state changed event for components to refresh
    window.dispatchEvent(new CustomEvent('auth-state-changed', { 
      detail: { 
        roleChanged: true,
        previousRole,
        newRole,
        timestamp: Date.now()
      }
    }));
  },

  /**
   * Force a refresh of token validation state
   * Used when admin operations need to ensure fresh validation
   */
  forceTokenRefresh(): void {
    tokenCache.token = '';
    tokenCache.isValid = false;
    tokenCache.timestamp = 0;
    console.log('Token validation state forcefully refreshed');
  }
};

export default auth; 