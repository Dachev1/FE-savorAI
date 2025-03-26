import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useMemo } from 'react';
import { User, LoginData, RegisterData } from '../types/auth';
import { authAPI } from '../api/apiService';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from './ToastContext';
import { cancelAllRequests } from '../api/axiosConfig';

// Define auth state types for better type checking
interface AuthState {
  user: User | null;
  isLoading: boolean;
  lastAuthCheck: number;
  authInitialized: boolean; // Add flag to track initialization
}

// Define protected routes for easy navigation checks
const AUTH_ROUTES = ['/signin', '/signup', '/login', '/register'];
const HOME_ROUTE = '/';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = React.memo(({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    lastAuthCheck: 0,
    authInitialized: false // Initialize as false
  });
  
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Use destructured state for cleaner code
  const { user, isLoading, lastAuthCheck, authInitialized } = authState;

  // Memoize the checkAuth function with useCallback to prevent unnecessary re-renders
  const checkAuth = useCallback(async (): Promise<boolean> => {
    try {
      const now = Date.now();
      // Skip frequent checks if user is already authenticated or checked recently
      if ((now - lastAuthCheck < 2000) && (user !== null || lastAuthCheck > 0)) {
        if (import.meta.env.DEV) {
          console.log('Skipping auth check - recently checked');
        }
        return !!user;
      }
      
      // Update last check timestamp
      setAuthState(prev => ({ ...prev, lastAuthCheck: now }));
      
      const token = localStorage.getItem('authToken');
      if (!token) {
        if (import.meta.env.DEV) {
          console.log('No auth token found in localStorage, user not authenticated');
        }
        return false;
      }
      
      // Get current user data from localStorage if available
      let username = '';
      try {
        const userJson = localStorage.getItem('user');
        if (userJson && userJson !== 'undefined') {
          const userData = JSON.parse(userJson);
          if (userData && userData.username) {
            username = userData.username;
          }
        }
      } catch (e) {
        // Ignore parsing errors
      }
      
      if (import.meta.env.DEV) {
        console.log('Auth token found, fetching user profile' + (username ? ` for ${username}` : ''));
      }
      
      try {
        const userData = await authAPI.getProfile();
        
        if (import.meta.env.DEV) {
          console.log('User profile fetched successfully:', { username: userData.username, role: userData.role });
        }
        
        // Store user data for request interceptor - use safe stringify
        if (userData) {
          localStorage.setItem('user', JSON.stringify(userData));
        }
        
        // Update state with user data
        setAuthState(prev => ({ ...prev, user: userData }));
        
        // Check if we are on an auth page and redirect if needed
        const currentPath = location.pathname;
        if (AUTH_ROUTES.includes(currentPath)) {
          if (import.meta.env.DEV) {
            console.log('User is authenticated but on auth page, redirecting...');
          }
          navigate(HOME_ROUTE, { replace: true });
        }
        
        return true;
      } catch (profileError) {
        console.error('Failed to get user profile:', profileError);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('cachedUserProfile');
        setAuthState(prev => ({ ...prev, user: null }));
        return false;
      }
    } catch (error) {
      console.error('Authentication check failed:', error);
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('cachedUserProfile');
      return false;
    } 
  }, [lastAuthCheck, user, navigate, location.pathname]);

  // Effect to initialize authentication - improved with better cleanup
  useEffect(() => {
    // Skip if already initialized
    if (authInitialized) return;
    
    let isMounted = true;
    const abortController = new AbortController();
    
    const initAuth = async () => {
      if (!isMounted) return;
      
      // Only set loading if we're not already loading
      if (!isLoading) {
        setAuthState(prev => ({ ...prev, isLoading: true }));
      }
      
      try {
        // Only log in development mode
        if (import.meta.env.DEV) {
          console.log('Initializing authentication check...');
        }
        
        const isAuthed = await checkAuth();
        
        if (isMounted) {
          // Only log in development mode
          if (import.meta.env.DEV) {
            console.log('Authentication check result:', isAuthed);
          }
          
          // Mark as initialized
          setAuthState(prev => ({ ...prev, authInitialized: true }));
        }
      } finally {
        if (isMounted) {
          setAuthState(prev => ({ ...prev, isLoading: false }));
          
          // Only log in development mode
          if (import.meta.env.DEV) {
            console.log('Authentication initialization complete');
          }
        }
      }
    };

    // Execute init auth
    initAuth();
    
    // Cleanup function to prevent memory leaks and cancel pending requests
    return () => {
      isMounted = false;
      abortController.abort();
      cancelAllRequests();
    };
  }, [checkAuth, authInitialized, isLoading]);

  // Check auth on path change for protected routes
  useEffect(() => {
    const currentPath = location.pathname;
    
    // Only check if we've moved to a different route that needs auth verification
    // This prevents unnecessary auth checks when navigating to non-auth routes
    if (authInitialized && !isLoading && !AUTH_ROUTES.includes(currentPath)) {
      // Add debounce to prevent too frequent checks
      const timer = setTimeout(() => {
        if (import.meta.env.DEV) {
          console.log(`Path changed to ${currentPath}, checking auth status`);
        }
        checkAuth();
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [location.pathname, checkAuth, isLoading, authInitialized]);

  // Login function with improved error handling
  const login = async (data: LoginData): Promise<void> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    try {
      // Only log the identifier, not the full data object that contains password
      const userIdentifier = data.identifier || data.email;
      console.log('Attempting login for user:', userIdentifier);
      
      const response = await authAPI.login(data);
      console.log('Login successful, got response:', {
        hasToken: !!response.token,
        hasUser: !!response.user,
        userKeys: response.user ? Object.keys(response.user) : []
      });
      
      const { token, user } = response;
      
      if (!user) {
        throw new Error('Invalid response: user data missing');
      }
      
      // Store authentication data with proper Bearer prefix
      const tokenToStore = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      localStorage.setItem('authToken', tokenToStore);
      
      // Ensure we're storing a valid JSON string
      localStorage.setItem('user', JSON.stringify(user));
      
      // Set user state
      setAuthState(prev => ({ ...prev, user }));
      
      // Show success message with user's name if available
      const welcomeMessage = user.name ? 
        `Welcome back, ${user.name}!` : 
        'Welcome back!';
      showToast(welcomeMessage, 'success');
      
      // Get the intended destination from localStorage or default to home
      const intendedPath = localStorage.getItem('intendedPath') || HOME_ROUTE;
      localStorage.removeItem('intendedPath'); // Clear it after use
      
      // Add small delay to ensure localStorage is updated before navigation
      setTimeout(() => {
        navigate(intendedPath, { replace: true });
      }, 100);
    } catch (error: any) {
      // Log error without sensitive data
      console.error('Login failed:', error.message || 'Unknown error');
      
      // Prepare a friendlyMessage property on the error object
      // This will be used by the component to display an appropriate message
      if (error.response?.status === 401) {
        error.friendlyMessage = 'Invalid credentials';
      } else if (error.response?.status === 403) {
        error.friendlyMessage = 'Access forbidden. Check if CORS is properly configured on the server.';
      } else if (error.message?.includes('Network Error')) {
        error.friendlyMessage = 'Unable to connect to the server. Please check your internet connection.';
      } else if (error.message?.includes('timeout')) {
        error.friendlyMessage = 'Request timed out. Please try again later.';
      } else if (error.message?.includes('CORS')) {
        error.friendlyMessage = 'Connection issue with the server. Please try again later.';
      } else if (error.message?.includes('token missing')) {
        error.friendlyMessage = 'Authentication token missing from server response. Please contact support.';
      } else if (error.message?.includes('user data missing')) {
        error.friendlyMessage = 'User data missing from server response. Please contact support.';
      } else if (!error.friendlyMessage) {
        error.friendlyMessage = 'Login failed. Please try again.';
      }
      
      // Add preserveForm flag to indicate we should keep form values
      error.preserveForm = true;
      
      throw error;
    } finally {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Registration function with improved error handling
  const register = async (data: RegisterData): Promise<void> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    try {
      await authAPI.register(data);
      showToast('Registration successful! Please check your email to verify your account.', 'success');
      navigate('/registration-success', { state: { email: data.email, username: data.username } });
    } catch (error: any) {
      console.error('Registration failed:', error);
      
      // Show appropriate error message based on response
      if (error.response?.status === 409) {
        showToast('This email is already registered.', 'error');
      } else if (error.friendlyMessage) {
        showToast(error.friendlyMessage, 'error');
      } else {
        showToast('Registration failed. Please try again.', 'error');
      }
      
      throw error;
    } finally {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Optimized logout function
  const logout = useCallback((): void => {
    // Start loading state
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    // Get token before clearing storage - but don't clear it yet
    const token = localStorage.getItem('authToken');
    
    // Update UI state immediately to give feedback to user
    setAuthState(prev => ({ ...prev, user: null }));
    
    // Show success message
    showToast('You have been logged out.', 'success');
    
    // Cancel all pending requests to prevent race conditions
    cancelAllRequests();
    
    // Attempt server-side logout if token exists
    if (token) {
      console.log('Sending logout request to server with token');
      
      // Pass the raw token to the logout function
      authAPI.logout(token)
        .then(response => {
          console.log('Server logout successful:', response);
        })
        .catch(err => {
          console.log('Server logout had issues, error:', err);
        })
        .finally(() => {
          // Only clear localStorage AFTER server request attempts
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          localStorage.removeItem('cachedUserProfile');
          
          setAuthState(prev => ({ ...prev, isLoading: false }));
          navigate('/signin', { replace: true });
        });
    } else {
      console.log('No token available for server logout, completing local logout only');
      
      // For local logout, still clear localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('cachedUserProfile');
      
      setAuthState(prev => ({ ...prev, isLoading: false }));
      navigate('/signin', { replace: true });
    }
  }, [navigate, showToast]);

  // Context value with useMemo to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
    isLoading,
    login,
    register,
    logout,
    checkAuth
  }), [user, isLoading, login, register, logout, checkAuth]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
});

// Add display name for debugging
AuthProvider.displayName = 'AuthProvider';

// Custom hook for using auth throughout the app
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 