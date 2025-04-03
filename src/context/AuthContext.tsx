import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from './ToastContext';
import { ToastType } from '../components/common/Toast';
import api from '../api/apiService';
import auth from '../utils/auth';
import { ROUTES } from '../routes';

// Types
interface User {
  id: string;
  username: string;
  email: string;
  role?: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  createdAt?: string;
  updatedAt?: string;
  banned?: boolean;
}

interface SignupData {
  username: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

interface SignInResult {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  isBanned?: boolean;
}

interface AuthResponse {
  token?: string;
  access_token?: string;
  authToken?: string;
  jwt?: string;
  user?: User;
  userData?: User;
  userDetails?: User;
  success?: boolean;
  message?: string;
  [key: string]: any;
}

interface ProfileResponse extends User {
  success?: boolean;
}

interface AuthContextInterface {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  signin: (
    identifier: string, 
    password: string, 
    remember?: boolean, 
    redirectPath?: string
  ) => Promise<SignInResult>;
  signup: (formData: SignupData) => Promise<{
    success: boolean;
    message?: string;
    error?: string;
    isDuplicate?: boolean;
    duplicateEmail?: string;
  }>;
  logout: () => Promise<void>;
  refreshUserData: () => Promise<boolean>;
  checkAuth: () => Promise<boolean>;
  updateUsername: (currentPassword: string, newUsername: string) => Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }>;
}

// Create the context with default values
const AuthContext = createContext<AuthContextInterface>({
  isAuthenticated: false,
  user: null,
  isLoading: true,
  isAdmin: false,
  signin: async () => ({ success: false, error: 'AuthContext not initialized' }),
  signup: async () => ({ success: false, error: 'AuthContext not initialized' }),
  logout: async () => {},
  refreshUserData: async () => false,
  updateUsername: async () => ({ success: false, error: 'AuthContext not initialized' }),
  checkAuth: async () => false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Only log if not suppressed
  if (!window.localStorage.getItem('suppress_logs')) {
    // Comment the line below to disable logs
    // console.log('AuthProvider rendering');
  }
  const navigate = useNavigate();
  const toastContext = useToast();
  
  // Toast utility
  const showToast = useCallback((message: string, type: ToastType = 'info', duration?: number) => {
    if (toastContext) {
      toastContext.showToast(message, type, duration);
    } else {
      console.warn('Toast context is not available, message:', message);
    }
  }, [toastContext]);
  
  // State
  const [user, setUser] = useState<User | null>(() => auth.getUser<User>());
  
  // Function references to avoid circular dependencies
  const logoutRef = useRef<() => Promise<void>>();
  
  // Request tracking
  const refreshInProgressRef = useRef<boolean>(false);
  const lastRefreshTimeRef = useRef<number>(0);
  const REFRESH_COOLDOWN = 3000; // 3 seconds between refreshes
  
  // Polling reference for background checks
  const banCheckIntervalRef = useRef<number | null>(null);
  
  // Computed properties
  const isAuthenticated = useMemo(() => !!user && !!user.id, [user]);
  const isAdmin = useMemo(() => {
    if (!isAuthenticated || !user) return false;
    const authRole = auth.getRole();
    const userRole = user.role?.toLowerCase() || '';
    const isAdminRole = 
      (authRole && ['admin', 'administrator'].includes(authRole.toLowerCase())) || 
      ['admin', 'administrator'].includes(userRole);
    return !!isAdminRole;
  }, [isAuthenticated, user]);
  
  // Update user state
  const updateUserState = useCallback((userData: User | null) => {
    if (userData) {
      auth.setUser(userData);
    } else {
      localStorage.removeItem('user_data');
    }
    setUser(userData);
  }, []);

  // Enhanced handle user banning with cache clearing
  const handleUserBanned = useCallback(() => {
    console.warn('User has been banned, clearing auth state');
    
    // Clear all caches
    sessionStorage.clear();
    
    // Clear auth state
    auth.clearAuth();
    
    // Clear any localStorage cache related to user
    Object.keys(localStorage).forEach(key => {
      if (key.includes('user') || key.includes('admin') || key.includes('auth')) {
        localStorage.removeItem(key);
      }
    });
    
    // Update UI
    updateUserState(null);
    
    // Show toast notification
    showToast('Your account has been banned.', 'error', 5000);
    
    // Navigate to sign-in
    navigate(ROUTES.SIGN_IN);
  }, [showToast, updateUserState, navigate]);

  // Background polling for ban status
  useEffect(() => {
    // Only check if authenticated
    if (!isAuthenticated || !user?.id) return;
    
    // Start polling for ban status if user is authenticated
    const checkBanStatus = async () => {
      try {
        // Check if token already indicates banned
        if (auth.isUserBanned()) {
          handleUserBanned();
          return;
        }
        
        // Check with server - add timestamp to prevent duplicate request errors
        const timestamp = Date.now();
        const response = await api.get<{ banned: boolean }>(
          `/api/v1/auth/check-status?identifier=${encodeURIComponent(user.username || user.email)}&_t=${timestamp}`
        );
        
        if (response.data?.banned) {
          handleUserBanned();
        }
      } catch (error: any) {
        // Ignore cancellation errors to prevent console spam
        if (error?.isCancel || error?.isCancelled || error?.code === 'ERR_CANCELED') {
          return; // Silently ignore canceled requests
        }
        console.error('Error checking ban status:', error);
      }
    };
    
    // Initial check
    checkBanStatus();
    
    // Setup polling every 5 minutes (300000ms)
    const intervalId = window.setInterval(checkBanStatus, 300000);
    banCheckIntervalRef.current = intervalId as unknown as number;
    
    return () => {
      if (banCheckIntervalRef.current) {
        window.clearInterval(banCheckIntervalRef.current);
        banCheckIntervalRef.current = null;
      }
    };
  }, [isAuthenticated, user, handleUserBanned]);

  // Route change handler for auth check
  useEffect(() => {
    const handleRouteChange = () => {
      // Check ban status on route change for authenticated users
      if (isAuthenticated && user) {
        const checkBanStatus = async () => {
          // First check local cache/token
          if (auth.isUserBanned()) {
            handleUserBanned();
            return;
          }
          
          // We don't need to make an API call on every route change 
          // as the polling will handle periodic checks
        };
        
        checkBanStatus();
      }
    };
    
    // Listen for route changes
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [isAuthenticated, user, handleUserBanned]);

  // Refresh user data
  const refreshUserData = useCallback(async (): Promise<boolean> => {
    try {
      if (!auth.isTokenValid()) {
        return false;
      }
      
      // Throttle requests
      const now = Date.now();
      if (now - lastRefreshTimeRef.current < REFRESH_COOLDOWN) {
        return true;
      }
      if (refreshInProgressRef.current) {
        return true;
      }
      
      refreshInProgressRef.current = true;
      lastRefreshTimeRef.current = now;
      
      try {
        const response = await api.get<ProfileResponse>('/api/v1/user/profile');
        const profileData = response.data;
        
        if (profileData?.id) {
          // Store previous role to detect changes
          const previousRole = user?.role;
          
          // Always update with latest server data
          updateUserState(profileData);
          
          // Detect and handle role changes
          if (previousRole && profileData.role && previousRole !== profileData.role) {
            console.log(`User role changed from ${previousRole} to ${profileData.role}`);
            showToast(`Your account role has been updated to ${profileData.role}`, 'info', 5000);
            
            // Notify about role change
            auth.notifyRoleChange(previousRole, profileData.role);
          }
          
          // Check if user is now banned
          if (profileData.banned === true && user?.banned !== true) {
            handleUserBanned();
            return false;
          }
          
          return true;
        }
        
        return false;
      } finally {
        setTimeout(() => {
          refreshInProgressRef.current = false;
        }, 100);
      }
    } catch (error) {
      return false;
    }
  }, [updateUserState, user, showToast, handleUserBanned]);
  
  // Enhanced fetchLatestUserData function with token refresh
  const fetchLatestUserData = useCallback(async (): Promise<User | null> => {
    try {
      // Force token refresh before fetching profile
      auth.forceTokenRefresh();
      
      const token = auth.getToken();
      if (!token) return null;
      
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        // Prevent caching
        params: {
          '_': Date.now() // Add timestamp to prevent caching
        }
      };
      
      const response = await api.get<User>('/api/v1/user/profile', config);
      return response.data || null;
    } catch (error) {
      console.error('Error fetching latest user data:', error);
      return null;
    }
  }, []);

  // Enhanced checkAuth function to force server verification
  const checkAuth = useCallback(async (): Promise<boolean> => {
    // Skip if already in progress or if we've refreshed recently
    if (refreshInProgressRef.current) {
      return isAuthenticated;
    }
    
    // Check if the token is still valid
    if (!auth.isTokenValid()) {
      updateUserState(null);
      return false;
    }
    
    // Check for cooldown to avoid excessive API calls
    const now = Date.now();
    if (now - lastRefreshTimeRef.current < REFRESH_COOLDOWN) {
      return isAuthenticated;
    }
    
    // Set refresh in progress flag
    refreshInProgressRef.current = true;
    
    try {
      const response = await api.get<ProfileResponse>('/api/v1/auth/profile');
      const userData = response.data;
      
      // Check if banned 
      if (userData.banned === true) {
        handleUserBanned();
        refreshInProgressRef.current = false;
        return false;
      }
      
      // Only update if we got valid data
      if (userData && userData.id) {
        // Update state with latest user data
        updateUserState(userData);
        lastRefreshTimeRef.current = now;
        
        // Dispatch auth-restored event if user was already authenticated
        if (isAuthenticated) {
          window.dispatchEvent(new CustomEvent('auth-state-changed', { 
            detail: { 
              action: 'auth-restored',
              timestamp: Date.now(),
              user: userData
            }
          }));
        }
        
        refreshInProgressRef.current = false;
        return true;
      }
      
      // If we didn't get valid data, clear auth
      updateUserState(null);
      refreshInProgressRef.current = false;
      return false;
    } catch (error) {
      console.error('Error refreshing auth:', error);
      refreshInProgressRef.current = false;
      return isAuthenticated; // Return current state on error
    }
  }, [isAuthenticated, updateUserState, handleUserBanned]);

  // Enhanced useEffect to ensure auth state is frequently checked
  useEffect(() => {
    // Set up auth check interval to detect banned/role changes
    // Check every 30 seconds when user is logged in
    const authCheckInterval = setInterval(async () => {
      if (user?.id && auth.isTokenValid()) {
        await checkAuth();
      }
    }, 30000); // 30 seconds
    
    // Initial auth check
    if (!user?.id && auth.isTokenValid()) {
      checkAuth();
    }
    
    return () => {
      clearInterval(authCheckInterval);
    };
  }, [user, checkAuth]);

  // Add useEffect to enforce immediate auth check on route changes
  useEffect(() => {
    // Listen for navigation events
    const handleRouteChange = () => {
      // Force check auth on every route change if the user is logged in
      if (user?.id && auth.isTokenValid()) {
        checkAuth();
      }
    };
    
    // Add event listener for navigation
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [user, checkAuth]);

  // Handle logout
  const logout = useCallback(async (): Promise<void> => {
    try {
      // Cancel any pending requests to avoid React errors
      api.cancelPendingRequests?.();
      
      // First dispatch event to notify components to prepare for unmounting
      window.dispatchEvent(new CustomEvent('prepare-for-logout', { 
        detail: { timestamp: Date.now() }
      }));
      
      // Add a visible indicator that logout is in progress
      const loaderEl = document.createElement('div');
      loaderEl.style.position = 'fixed';
      loaderEl.style.top = '0';
      loaderEl.style.left = '0';
      loaderEl.style.width = '100%';
      loaderEl.style.height = '3px';
      loaderEl.style.backgroundColor = '#3b82f6';
      loaderEl.style.zIndex = '9999';
      loaderEl.style.transition = 'width 0.5s ease-out';
      document.body.appendChild(loaderEl);
      
      // Prevent any navigation during logout
      window.history.pushState(null, '', window.location.pathname);
      
      // Prevent default behavior for all links during logout
      const preventClicks = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
      };
      
      document.addEventListener('click', preventClicks, true);
      
      // Small delay to allow components to prepare for unmounting
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Animate loader
      loaderEl.style.width = '70%';
      
      const token = auth.getToken();
      
      // Try server-side logout if we have a token
      if (token) {
        try {
          await api.post('/api/v1/auth/logout', {}, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          console.log('Server-side logout successful');
        } catch (error) {
          console.warn('Server-side logout failed, continuing with client-side logout');
        }
      }
      
      // Complete loader animation
      loaderEl.style.width = '100%';
      
      // Clear client-side state
      auth.clearAuth();
      
      // First update UI state in a safe manner
      updateUserState(null);
      
      // UI feedback
      showToast('Logged out successfully', 'success');
      
      // Dispatch event to notify app components of logout
      window.dispatchEvent(new CustomEvent('auth-state-changed', { 
        detail: { 
          action: 'logout',
          timestamp: Date.now()
        }
      }));
      
      // Clear any references to removed components
      // This helps React's garbage collection
      window.dispatchEvent(new CustomEvent('cleanup-components', {
        detail: { timestamp: Date.now() }
      }));
      
      // A more substantial delay for navigation to ensure cleanup is complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Remove the loader
      try {
        document.body.removeChild(loaderEl);
      } catch (e) {
        // Ignore errors
      }
      
      // Remove click prevention
      document.removeEventListener('click', preventClicks, true);
      
      // Reset all flags
      sessionStorage.removeItem('logout_in_progress');
      
      // Finally navigate
      navigate(ROUTES.SIGN_IN);
    } catch (error) {
      // Emergency cleanup in case of error
      console.error('Logout error:', error);
      auth.clearAuth();
      setUser(null);
      sessionStorage.removeItem('logout_in_progress');
      
      // Force navigation
      window.location.href = ROUTES.SIGN_IN;
    }
  }, [navigate, showToast, updateUserState]);
  
  // Store logout reference to avoid circular dependencies
  useEffect(() => {
    logoutRef.current = logout;
  }, [logout]);

  // Wrap signin to enforce token refresh
  const signin = useCallback(async (
    identifier: string, 
    password: string, 
    remember?: boolean, 
    redirectPath?: string
  ): Promise<SignInResult> => {
    try {
      // Reset auth state for clean login
      auth.resetForLogin();
      
      const response = await api.post<AuthResponse>('/api/v1/auth/signin', { identifier, password });
      const data = response.data;
      
      if (!data) return { success: false, error: 'Invalid response from server' };
      
      // Process user data
      const userData = data.user || data.userData || data.userDetails || data;
      if (!userData?.id) {
        auth.removeToken();
        return { success: false, error: 'Invalid credentials' };
      }
      
      // Enhanced check for banned users with clear messaging
      if (userData.banned === true) {
        // Set the banned flag in session storage
        sessionStorage.setItem('account_banned', 'true');
        
        // Clear any existing auth tokens
        auth.removeToken();
        
        // Show prominent error toast
        showToast('Your account has been banned. Please contact support for assistance.', 'error', 10000);
        
        // Return detailed error
        return {
          success: false,
          error: 'Your account has been banned by an administrator. Please contact support for assistance.',
          isBanned: true
        };
      }
      
      // Only proceed with token storage and welcome message if not banned
      const token = data.token || data.access_token || data.authToken || data.jwt;
      if (!token) return { success: false, error: 'Invalid credentials' };
      
      // Remove any previous banned flag
      sessionStorage.removeItem('account_banned');
      
      // Store token and update state
      auth.setToken(token);
      updateUserState(userData as User);
      lastRefreshTimeRef.current = Date.now();
      
      console.log('User authenticated successfully, dispatching auth event');
      
      // First update our own state
      setUser(userData as User);
      
      // Always redirect to recipe generator page after successful login
      setTimeout(() => {
        // Dispatch login event to notify the app
        window.dispatchEvent(new CustomEvent('auth-state-changed', { 
          detail: { 
            action: 'login',
            timestamp: Date.now(),
            user: userData
          }
        }));
        
        console.log('Navigating to recipe generator page after successful login');
        
        // Always redirect to recipe generator after login
        navigate('/recipe/generator');
        showToast(`Welcome back, ${userData.username}!`, 'success');
      }, 100);
      
      return { success: true };
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Invalid credentials';
      
      // Check if the error message indicates a banned status
      if (errorMessage.toLowerCase().includes('banned') || errorMessage.toLowerCase().includes('suspended')) {
        // Set the banned flag in session storage
        sessionStorage.setItem('account_banned', 'true');
        
        // Return with banned flag
        return { 
          success: false, 
          error: 'Your account has been banned. Please contact support for assistance.',
          isBanned: true
        };
      }
      
      return { 
        success: false, 
        error: errorMessage
      };
    }
  }, [navigate, updateUserState, showToast]);

  // Signup function
  const signup = useCallback(async (formData: SignupData): Promise<{
    success: boolean;
    message?: string;
    error?: string;
    isDuplicate?: boolean;
    duplicateEmail?: string;
  }> => {
    try {
      const response = await api.post<AuthResponse>('/api/v1/auth/signup', {
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      const data = response.data;
      
      if (data?.success) {
        showToast('Registration successful! Please check your email for verification.', 'success');
        
        navigate('/signup-success', { 
          state: { 
            email: formData.email,
            username: formData.username 
          } 
        });
        
        return {
          success: true,
          message: 'Registration successful! Please check your email for verification.'
        };
      }
      
      return { success: false, error: 'Registration failed' };
    } catch (error: any) {
      // Handle duplicate user errors
      if (error.response?.status === 409) {
        const data = error.response.data;
        const isDuplicateEmail = data?.message?.toLowerCase().includes('email already exists');
        const isDuplicateUsername = data?.message?.toLowerCase().includes('username already exists');
        
        if (isDuplicateEmail || isDuplicateUsername) {
          return {
            success: false,
            error: data.message || 'This email or username is already registered',
            isDuplicate: true,
            duplicateEmail: isDuplicateEmail ? formData.email : undefined
          };
        }
      }
      
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      };
    }
  }, [navigate, showToast]);

  // Update username
  const updateUsername = useCallback(async (currentPassword: string, newUsername: string): Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }> => {
    if (!isAuthenticated) {
      return { success: false, error: 'You must be logged in to update your username' };
    }
    
    try {
      console.log('Attempting to update username from', user?.username, 'to', newUsername);
      
      // Create request payload for both endpoint formats
      const oldFormatPayload = {
        currentPassword,
        newUsername
      };
      
      const newFormatPayload = {
        currentPassword,
        username: newUsername
      };

      // Add authorization header explicitly
      const config = {
        headers: {
          'Authorization': `Bearer ${auth.getToken()}`,
          'Content-Type': 'application/json'
        }
      };
      
      try {
        // First try new endpoint
        console.log('Trying new username update endpoint');
        const response = await api.post<{success: boolean; message?: string}>(
          '/api/v1/auth/change-username', 
          newFormatPayload,
          config
        );
        const data = response.data;
        
        if (data?.success) {
          // Update local user data
          if (user) {
            updateUserState({ ...user, username: newUsername });
          }
          
          showToast('Username updated successfully', 'success');
          return { success: true, message: 'Username updated successfully' };
        }
        
        return { success: false, error: 'Failed to update username' };
      } catch (primaryError: any) {
        console.warn('First username endpoint failed, trying fallback:', primaryError);
        
        // Check for specific 403 error
        if (primaryError?.response?.status === 403) {
          const errorMsg = 'You do not have permission to change your username. Contact an administrator for assistance.';
          showToast(errorMsg, 'error');
          return { success: false, error: errorMsg };
        }
        
        // If that fails, try old endpoint
        try {
          const response = await api.put<{success: boolean; message?: string}>(
            '/api/v1/user/username', 
            oldFormatPayload,
            config
          );
          const data = response.data;
          
          if (data?.success) {
            // Update local user data
            if (user) {
              updateUserState({ ...user, username: newUsername });
            }
            
            showToast('Username updated successfully', 'success');
            return { success: true, message: 'Username updated successfully' };
          }
          
          return { success: false, error: 'Failed to update username' };
        } catch (fallbackError: any) {
          // Both endpoints failed
          // Check for specific 403 error in fallback
          if (fallbackError?.response?.status === 403) {
            const errorMsg = 'You do not have permission to change your username. Contact an administrator for assistance.';
            showToast(errorMsg, 'error');
            return { success: false, error: errorMsg };
          }
          
          console.error('Both username update endpoints failed:', fallbackError);
          throw fallbackError;
        }
      }
    } catch (error: any) {
      console.error('Username update error:', error);
      const errorMsg = error.response?.status === 403 
        ? 'Permission denied: You cannot change your username. Contact an administrator.'
        : error.response?.data?.message || 'Failed to update username';
      
      showToast(errorMsg, 'error');
      return {
        success: false,
        error: errorMsg
      };
    }
  }, [isAuthenticated, user, updateUserState, showToast]);

  // Context value
  const contextValue = useMemo(() => ({
    isAuthenticated,
    user,
    isLoading: false, // Always false since we removed loading state
    isAdmin,
    signin,
    signup,
    logout,
    refreshUserData,
    updateUsername,
    checkAuth,
  }), [
    isAuthenticated, user, isAdmin,
    signin, signup, logout, refreshUserData, updateUsername, checkAuth,
  ]);
  
  try {
    return (
      <AuthContext.Provider value={contextValue}>
        {children}
      </AuthContext.Provider>
    );
  } catch (error) {
    console.error('AuthProvider render error:', error);
    return <div>Authentication Error. Please refresh the page.</div>;
  }
};

// Custom hook to access the auth context
export const useAuth = () => useContext(AuthContext);

export default AuthContext;

