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

// Cache for token validation with clear naming and purpose
const tokenCache = {
  // The cached token string
  token: '',
  // Whether the token is still valid
  isValid: false,
  // Last time the validation was performed (timestamp)
  timestamp: 0,
  // User data associated with token
  userData: null,
  // Last time we checked with server
  lastServerCheck: 0
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
   * This optimized function uses caching to reduce validation overhead
   */
  isTokenValid(): boolean {
    try {
      const token = this.getToken();
      
      if (!token) {
        return false;
      }
      
      // Check cache first (valid for 30 seconds)
      const now = Date.now();
      if (tokenCache.token === token && (now - tokenCache.timestamp) < 30000) {
        return tokenCache.isValid;
      }
      
      // Parse and validate the token
      const payload = this.parseToken(token);
      
      // Check if payload exists and has expiration
      if (!payload || !payload.exp) {
        this.updateTokenCache(token, false, now);
        return false;
      }
      
      // Check if token is expired (with 30s buffer)
      const expiryTime = payload.exp * 1000;
      const isValid = expiryTime > (now + 30000);
      
      // Check for banned status
      if (payload.banned === true) {
        this.updateTokenCache(token, false, now);
        return false;
      }
      
      // Update cache and return result
      this.updateTokenCache(token, isValid, now);
      return isValid;
    } catch (error) {
      return false;
    }
  },
  
  /**
   * Helper method to update token cache consistently
   */
  updateTokenCache(token: string, isValid: boolean, timestamp: number): void {
    tokenCache.token = token;
    tokenCache.isValid = isValid;
    tokenCache.timestamp = timestamp;
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
    return !!role && ['admin'].includes(role.toLowerCase());
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
    // Check if we've already refreshed recently (within 1 minute)
    const now = Date.now();
    const oneMinute = 60 * 1000;
    
    if (tokenCache.token && (now - tokenCache.timestamp < oneMinute)) {
      console.debug('Skipping forced token refresh - already refreshed recently');
      return;
    }
    
    console.log('Token validation state forcefully refreshed');
    tokenCache.token = '';
    tokenCache.isValid = false;
    tokenCache.timestamp = now;
  }
};

export default auth; 