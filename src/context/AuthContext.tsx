import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from './ToastContext';
import { ToastType } from '../components/common/Toast';
import api, { authApi } from '../api/apiService';
import auth from '../utils/auth';
import { ROUTES } from '../routes';

// Types
interface User {
  id: string;
  username: string;
  email: string;
  role?: string;
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
  fetchUserProfile: () => Promise<boolean>;
}

// Create context with default values
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
  fetchUserProfile: async () => false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const toastContext = useToast();
  
  // State & Refs
  const [user, setUser] = useState<User | null>(() => auth.getUser<User>());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const logoutRef = useRef<() => Promise<void>>();
  const refreshInProgressRef = useRef<boolean>(false);
  const lastRefreshTimeRef = useRef<number>(0);
  const REFRESH_COOLDOWN = 5000;
  const banCheckIntervalRef = useRef<number | null>(null);
  
  // Computed properties
  const isAuthenticated = useMemo(() => !!user && !!user.id, [user]);
  const isAdmin = useMemo(() => {
    if (!isAuthenticated || !user) return false;
    const authRole = auth.getRole();
    const userRole = user.role?.toLowerCase() || '';
    return (authRole && ['admin'].includes(authRole.toLowerCase())) || 
           ['admin'].includes(userRole);
  }, [isAuthenticated, user]);
  
  // Toast utility
  const showToast = useCallback((message: string, type: ToastType = 'info', duration?: number) => {
    if (toastContext) {
      toastContext.showToast(message, type, duration);
    } else {
      console.warn('Toast context is not available, message:', message);
    }
  }, [toastContext]);
  
  // Update user state
  const updateUserState = useCallback((userData: User | null) => {
    if (userData) {
      auth.setUser(userData);
    } else {
      localStorage.removeItem('user_data');
    }
    setUser(userData);
  }, []);

  // Handle user banning
  const handleUserBanned = useCallback(() => {
    sessionStorage.clear();
    auth.clearAuth();
    
    Object.keys(localStorage).forEach(key => {
      if (key.includes('user') || key.includes('admin') || key.includes('auth')) {
        localStorage.removeItem(key);
      }
    });
    
    updateUserState(null);
    showToast('Your account has been banned.', 'error', 5000);
    navigate(ROUTES.SIGN_IN);
  }, [showToast, updateUserState, navigate]);

  // Background polling for ban status
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;
    
    const checkBanStatus = async () => {
      try {
        if (auth.isUserBanned()) {
          handleUserBanned();
          return;
        }
        
        const now = Date.now();
        const fiveMinutes = 5 * 60 * 1000;
        if (now - lastRefreshTimeRef.current < fiveMinutes) {
          return;
        }
        
        const timestamp = Date.now();
        const response = await authApi.get<{ banned: boolean }>(
          `/api/v1/auth/check-status?identifier=${encodeURIComponent(user.username || user.email)}&_t=${timestamp}`
        );
        
        if (response.data?.banned) {
          handleUserBanned();
        }
      } catch (error: any) {
        if (error?.isCancel || error?.isCancelled || error?.code === 'ERR_CANCELED') {
          return;
        }
      }
    };
    
    const initialTimer = setTimeout(checkBanStatus, 3000);
    const intervalId = window.setInterval(checkBanStatus, 600000);
    banCheckIntervalRef.current = intervalId as unknown as number;
    
    return () => {
      clearTimeout(initialTimer);
      if (banCheckIntervalRef.current) {
        window.clearInterval(banCheckIntervalRef.current);
        banCheckIntervalRef.current = null;
      }
    };
  }, [isAuthenticated, user, handleUserBanned, lastRefreshTimeRef]);

  // Enhanced refresh user data function with optimized throttling
  const refreshUserData = useCallback(async (): Promise<boolean> => {
    if (refreshInProgressRef.current) {
      return true;
    }
    
    const now = Date.now();
    if (now - lastRefreshTimeRef.current < REFRESH_COOLDOWN) {
      return true;
    }
    
    refreshInProgressRef.current = true;
    lastRefreshTimeRef.current = now;
    
    try {
      if (!auth.isTokenValid()) {
        refreshInProgressRef.current = false;
        return false;
      }
      
      try {
        const response = await authApi.get<ProfileResponse>('/api/v1/profile', {
          headers: {
            'Authorization': `Bearer ${auth.getToken()}`,
            'Cache-Control': 'no-cache',
          },
          params: {
            '_': Date.now()
          }
        });
        
        const profileData = response.data;
        
        if (profileData?.id) {
          const previousRole = user?.role;
          
          updateUserState(profileData);
          
          if (previousRole && profileData.role && previousRole !== profileData.role) {
            showToast(`Your account role has been updated to ${profileData.role}`, 'info', 5000);
            auth.notifyRoleChange(previousRole, profileData.role);
          }
          
          if (profileData.banned === true && user?.banned !== true) {
            handleUserBanned();
            return false;
          }
          
          return true;
        }
        
        return false;
      } finally {
        refreshInProgressRef.current = false;
      }
    } catch (error) {
      refreshInProgressRef.current = false;
      return false;
    }
  }, [updateUserState, user, showToast, handleUserBanned]);
  
  // Fetch latest user data
  const fetchLatestUserData = useCallback(async (): Promise<User | null> => {
    try {
      const cachedUserData = auth.getUser<User>();
      const now = Date.now();
      const fiveMinutes = 5 * 60 * 1000;
      
      if (cachedUserData && (now - lastRefreshTimeRef.current < fiveMinutes)) {
        return cachedUserData;
      }
      
      const token = auth.getToken();
      if (!token) return null;
      
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        params: {
          '_': Date.now()
        }
      };
      
      const response = await authApi.get<User>('/api/v1/profile', config);
      lastRefreshTimeRef.current = now;
      
      if (response.data) {
        auth.setUser(response.data);
      }
      
      return response.data || null;
    } catch (error) {
      return null;
    }
  }, []);

  // Enhanced checkAuth function with optimized server verification
  const checkAuth = useCallback(async (): Promise<boolean> => {
    if (refreshInProgressRef.current) {
      return isAuthenticated;
    }
    
    if (!auth.isTokenValid()) {
      updateUserState(null);
      return false;
    }
    
    const now = Date.now();
    const ENHANCED_REFRESH_COOLDOWN = 60000;
    if (now - lastRefreshTimeRef.current < ENHANCED_REFRESH_COOLDOWN) {
      return isAuthenticated;
    }
    
    refreshInProgressRef.current = true;
    
    try {
      const token = auth.getToken();
      
      const response = await authApi.get<ProfileResponse>('/api/v1/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache'
        },
        params: {
          '_': Date.now()
        }
      });
      
      const userData = response.data;
      lastRefreshTimeRef.current = now;
      
      if (userData.banned === true) {
        handleUserBanned();
        refreshInProgressRef.current = false;
        return false;
      }
      
      if (userData && userData.id) {
        updateUserState(userData);
        refreshInProgressRef.current = false;
        return true;
      }
      
      updateUserState(null);
      refreshInProgressRef.current = false;
      return false;
    } catch (error) {
      if ((error as any)?.response?.status === 401 || (error as any)?.response?.status === 403) {
        updateUserState(null);
        auth.clearAuth();
      }
      
      refreshInProgressRef.current = false;
      return isAuthenticated;
    }
  }, [isAuthenticated, updateUserState, handleUserBanned]);
  
  // Periodic auth verification
  useEffect(() => {
    const authCheckInterval = setInterval(async () => {
      if (user?.id && auth.isTokenValid()) {
        await checkAuth();
      }
    }, 300000);
    
    if (!user?.id && auth.isTokenValid()) {
      checkAuth();
    }
    
    return () => {
      clearInterval(authCheckInterval);
    };
  }, [user, checkAuth]);

  // Route change handler for auth check
  useEffect(() => {
    const handleRouteChange = () => {
      if (isAuthenticated && user) {
        if (auth.isUserBanned()) {
          handleUserBanned();
          return;
        }
        
        const now = Date.now();
        const lastCheck = lastRefreshTimeRef.current;
        
        if (now - lastCheck > 60000) {
          checkAuth();
        }
      }
    };
    
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [isAuthenticated, user, handleUserBanned, checkAuth, lastRefreshTimeRef]);

  // Handle logout
  const logout = useCallback(async (): Promise<void> => {
    try {
      api.cancelPendingRequests?.();
      
      window.dispatchEvent(new CustomEvent('prepare-for-logout', { 
        detail: { timestamp: Date.now() }
      }));
      
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
      
      window.history.pushState(null, '', window.location.pathname);
      
      const preventClicks = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
      };
      
      document.addEventListener('click', preventClicks, true);
      
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
      
      const response = await authApi.post<AuthResponse>('/api/v1/auth/signin', { identifier, password });
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
          error: 'Your account has been banned by an admin. Please contact support for assistance.',
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
      const response = await authApi.post<AuthResponse>('/api/v1/auth/signup', {
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
    try {
      // Validate password and new username are provided
      if (!currentPassword || !newUsername) {
        return {
          success: false,
          error: 'Password and new username are required'
        };
      }
      
      // Make API call to update username
      const response = await authApi.post('/api/v1/user/update-username', {
        currentPassword,
        newUsername
      });
      
      if (response.data?.success) {
        // Update local user data
        if (user) {
          updateUserState({ ...user, username: newUsername });
        }
        
        showToast('Username updated successfully', 'success');
        return { success: true, message: 'Username updated successfully' };
      }
      
      return { success: false, error: 'Failed to update username' };
    } catch (error: any) {
      console.error('Username update error:', error);
      const errorMsg = error.response?.status === 403 
        ? 'Permission denied: You cannot change your username. Contact an admin.'
        : error.response?.data?.message || 'Failed to update username';
      
      showToast(errorMsg, 'error');
      return {
        success: false,
        error: errorMsg
      };
    }
  }, [isAuthenticated, user, updateUserState, showToast]);

  // Fetch user profile data specifically
  const fetchUserProfile = useCallback(async (): Promise<boolean> => {
    if (!isAuthenticated) return false;
    
    try {
      const token = auth.getToken();
      
      if (!token) {
        console.warn('No token available for fetchUserProfile');
        return false;
      }
      
      const response = await api.get<ProfileResponse>('/api/v1/profile');
      
      if (response.data) {
        // Update user data with latest username
        const updatedUser = {
          ...user,
          username: response.data.username,
        };
        updateUserState(updatedUser as User);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return false;
    }
  }, [isAuthenticated, user, updateUserState]);

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
    fetchUserProfile,
  }), [
    isAuthenticated, user, isAdmin,
    signin, signup, logout, refreshUserData, updateUsername, checkAuth, fetchUserProfile,
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

