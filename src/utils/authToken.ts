import { storage, STORAGE_KEYS } from './storage';

interface TokenPayload {
  exp: number;
  iat: number;
  user_id: string;
  username: string;
  email: string;
  roles?: string[];
  [key: string]: any;
}

/**
 * Parse JWT token to extract payload
 */
export const parseJwt = (token: string): TokenPayload | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error parsing JWT token:', error);
    return null;
  }
};

/**
 * Check if token is expired
 */
const isTokenExpired = (token: string): boolean => {
  const decoded = parseJwt(token);
  if (!decoded) return true;
  
  // Check if expiration time is passed
  const currentTime = Date.now() / 1000;
  return decoded.exp < currentTime;
};

export const authToken = {
  /**
   * Set auth token in storage
   */
  setToken: (token: string): void => {
    storage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  },

  /**
   * Get auth token from storage
   */
  getToken: (): string | null => {
    return storage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  },

  /**
   * Remove auth token from storage
   */
  removeToken: (): void => {
    storage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  },

  /**
   * Check if user is authenticated (has a valid token)
   */
  isAuthenticated: (): boolean => {
    const token = authToken.getToken();
    if (!token) return false;
    return !isTokenExpired(token);
  },

  /**
   * Get user info from token
   */
  getUserInfo: (): Partial<TokenPayload> | null => {
    const token = authToken.getToken();
    if (!token) return null;
    return parseJwt(token);
  }
}; 