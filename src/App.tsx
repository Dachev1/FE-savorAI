// src/App.tsx
import React, { Suspense, lazy, memo, useEffect, useState, useCallback, useRef } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate, Link } from 'react-router-dom';
import Layout from './components/layout/Layout';
import { LoadingSpinner } from './components/common';
import { useAuth } from './context/AuthContext';
import { ROUTES } from './routes';
import AuthCleaner from './components/AuthCleaner';
import auth from './utils/auth';
import ErrorBoundary from './components/common/ErrorBoundary';
import { FaHeart } from 'react-icons/fa';

// Lazily loaded components
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About/About'));
const Contact = lazy(() => import('./pages/Contact'));
const ContactSuccess = lazy(() => import('./pages/ContactSuccess'));
const SignIn = lazy(() => import('./pages/Auth/SignIn'));
const SignUp = lazy(() => import('./pages/Auth/SignUp'));
const SignupSuccess = lazy(() => import('./pages/Auth/SignupSuccess'));
const RecipeGenerator = lazy(() => import('./pages/Recipe/RecipeGenerator'));
const RecipeDetail = lazy(() => import('./pages/Recipe/RecipeDetail'));
const RecipeCreate = lazy(() => import('./pages/Recipe/RecipeCreate'));
const UserRecipes = lazy(() => import('./pages/Recipe/UserRecipes'));
const AccountSettings = lazy(() => import('./pages/Profile/AccountSettings'));
const Error = lazy(() => import('./pages/Error'));
const AdminDashboard = lazy(() => import('./pages/Admin/AdminDashboard'));
const FavoritesPage = lazy(() => import('./pages/Favorites/FavoritesPage'));

// Loading and error components
const PageLoading = memo(() => (
  <div className="flex justify-center items-center min-h-[50vh]">
    <LoadingSpinner size="large" />
  </div>
));
PageLoading.displayName = 'PageLoading';

// Redirect component for old login path
const LoginRedirect = memo(() => {
  const location = useLocation();
  const newPath = `/signin${location.search}`;
  return <Navigate to={newPath} replace />;
});
LoginRedirect.displayName = 'LoginRedirect';

// Define a minimum interval between role verifications
const ROLE_VERIFICATION_INTERVAL = 60000; // 1 minute

// Simplified protected route with instant role verification
const ProtectedRoute = memo(({ 
  element, 
  requiresAuth = true,
  requiresAdmin = false 
}: { 
  element: React.ReactElement; 
  requiresAuth?: boolean;
  requiresAdmin?: boolean;
}) => {
  const { isAuthenticated, isAdmin } = useAuth();
  
  // Immediately check conditions without additional API calls
  if ((requiresAuth && !isAuthenticated) || (requiresAdmin && !isAdmin)) {
    // Store the attempted URL to redirect back after authentication
    if (requiresAuth && !isAuthenticated) {
      sessionStorage.setItem('pending_redirect', window.location.pathname);
      return <Navigate to="/signin" replace />;
    }
    
    // If admin is required but user isn't admin
    if (requiresAdmin && !isAdmin) {
      return <Navigate to="/" replace />;
    }
  }
  
  return element;
});
ProtectedRoute.displayName = 'ProtectedRoute';

// Redirect authenticated users away from public auth pages
const PublicAuthRoute = memo(({ 
  element
}: { 
  element: React.ReactElement;
}) => {
  const { isAuthenticated } = useAuth();
  
  // Redirect authenticated users to home page
  if (isAuthenticated) {
    return <Navigate to={ROUTES.HOME} replace />;
  }
  
  return element;
});
PublicAuthRoute.displayName = 'PublicAuthRoute';

const createTimeout = (ms: number): Promise<never> => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject('Refresh timeout');
    }, ms);
  });
};

function App() {
  // Comment the line below to reduce console noise
  // console.log('App component rendering');
  const { isAuthenticated, refreshUserData, isAdmin, user } = useAuth();
  const [isInitializing, setIsInitializing] = useState(true);
  const timeoutRef = useRef<number | null>(null);
  const lastRefreshTime = useRef<number>(0);
  const lastRoleVerificationTime = useRef<number>(0);
  const isInitialRender = useRef(true);
  const MIN_REFRESH_INTERVAL = 2000; // minimum 2 seconds between refreshes
  const navigate = useNavigate();
  const location = useLocation();
  
  // Verify user roles for sensitive routes
  const verifyUserRole = useCallback(async () => {
    // Force token refresh on admin routes
    if (location.pathname.startsWith('/admin')) {
      auth.forceTokenRefresh();
    }
    
    // Skip verification if:
    // 1. User is not authenticated
    // 2. We verified recently (but always verify for admin routes)
    // 3. User is not on an admin route
    const isAdminRoute = location.pathname.startsWith('/admin');
    if (!isAuthenticated || 
        (!isAdminRoute && Date.now() - lastRoleVerificationTime.current < ROLE_VERIFICATION_INTERVAL)) {
      return;
    }
    
    // Always refresh on admin routes, or if needed for protected routes
    if (isAdminRoute || isAdmin === undefined || lastRoleVerificationTime.current === 0) {
      const success = await refreshUserData();
      lastRoleVerificationTime.current = Date.now();
      
      // If refresh was successful and user is not an admin but trying to access admin routes
      if (success && !isAdmin && isAdminRoute) {
        navigate('/');
      }
    }
  }, [isAuthenticated, isAdmin, location.pathname, navigate, refreshUserData]);
  
  // Run role verification on route changes
  useEffect(() => {
    // Only run when route changes, not on every render
    // And prevent running on initial render
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }
    
    // Only verify roles for admin pages
    if (location.pathname.startsWith('/admin')) {
      verifyUserRole();
    }
  }, [location.pathname, verifyUserRole]);
  
  // Listen for role change events
  useEffect(() => {
    const handleRoleChange = () => {
      // Update our verification timestamp to prevent duplicate checks
      lastRoleVerificationTime.current = Date.now();
    };
    
    window.addEventListener('user-role-changed', handleRoleChange);
    return () => window.removeEventListener('user-role-changed', handleRoleChange);
  }, [navigate]);

  // Handle authentication state changes event for inter-component communication
  const handleAuthStateChange = useCallback((event: Event) => {
    const customEvent = event as CustomEvent;
    const detail = customEvent.detail || {};
    
    // Store the event source for debugging
    const source = detail.source || 'unknown';
    
    // Force token refresh on auth state change
    auth.forceTokenRefresh();
    
    // Don't refresh user data on network errors or unauthorized events
    // These are handled separately
    if (detail.reason === 'unauthorized' || detail.reason === 'network-error') {
      return;
    }
    
    // Skip refreshes from ourselves to avoid loops
    if (source === 'app-component') {
      return;
    }
    
    // If role changed, refresh immediately regardless of timing
    if (detail.roleChanged) {
      lastRoleVerificationTime.current = Date.now();
      refreshUserData();
      return;
    }
    
    // If username changed, refresh immediately
    if (detail.usernameChanged) {
      refreshUserData();
      return;
    }
    
    // Skip additional refreshes if we recently refreshed
    const now = Date.now();
    const timeSinceLastRefresh = now - lastRefreshTime.current;
    
    // Use a higher threshold (5 seconds) to prevent rapid refreshes
    if (timeSinceLastRefresh < 5000 && user) {
      return;
    }
    
    // Refresh user data
    refreshUserData();
  }, [refreshUserData, user, isAuthenticated]);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        if (!auth.isTokenValid()) {
          setIsInitializing(false);
          return;
        }

        const now = Date.now();
        if (now - lastRefreshTime.current < MIN_REFRESH_INTERVAL && user) {
          setIsInitializing(false);
          return;
        }

        await Promise.race([
          refreshUserData(),
          createTimeout(5000)
        ]);

        // Update timestamps
        lastRefreshTime.current = Date.now();
        lastRoleVerificationTime.current = Date.now();
      } catch (error) {
        console.error('Error during initialization:', error);
      } finally {
        // Always set initializing to false
        setIsInitializing(false);
      }
    };

    // Start initialization
    initializeApp();

    // Set up auth state change listener
    window.addEventListener('auth-state-changed', handleAuthStateChange);
    
    // Clean up
    return () => {
      window.removeEventListener('auth-state-changed', handleAuthStateChange);
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [refreshUserData, user, handleAuthStateChange]);
  
  // Handle network status changes
  useEffect(() => {
    const handleOnline = () => {
      // Only refresh if authenticated and not refreshed recently
      if (auth.isTokenValid() && isAuthenticated) {
        const now = Date.now();
        if (now - lastRefreshTime.current > MIN_REFRESH_INTERVAL) {
          refreshUserData();
        }
      }
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', () => {});
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', () => {});
    };
  }, [refreshUserData, isAuthenticated]);

  // Dispatch auth-restored event on mount if user is already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      // Small delay to allow components to initialize
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('auth-state-changed', { 
          detail: { 
            action: 'auth-restored',
            timestamp: Date.now(),
            user
          }
        }));
      }, 0);
    }
  }, [isAuthenticated, user]);

  if (isInitializing) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100"><LoadingSpinner size="large" /></div>;
  }

  return (
    <div className="app-container">
      {/* Authentication monitor - invisible component checking for banned users */}
      <AuthCleaner />
      
      <Layout>
        <ErrorBoundary>
          <Suspense fallback={<PageLoading />}>
            <Routes key={`routes-${isAuthenticated ? 'authenticated' : 'unauthenticated'}-${location.pathname}`}>
              {/* Public routes - Home is now conditional */}
              <Route path="/" element={isAuthenticated ? <Navigate to="/recipe/generator" replace /> : <Home />} />
              <Route path={ROUTES.ABOUT} element={<About />} />
              <Route path={ROUTES.CONTACT} element={<Contact />} />
              <Route path={ROUTES.CONTACT_SUCCESS} element={<ContactSuccess />} />
              
              {/* Auth routes */}
              <Route path={ROUTES.SIGN_IN} element={<PublicAuthRoute element={<SignIn />} />} />
              <Route path={ROUTES.SIGN_UP} element={<PublicAuthRoute element={<SignUp />} />} />
              <Route path={ROUTES.SIGNUP_SUCCESS} element={<PublicAuthRoute element={<SignupSuccess />} />} />
              
              {/* Redirects */}
              <Route path="/login" element={<PublicAuthRoute element={<LoginRedirect />} />} />
              <Route path="/registration-success" element={<Navigate to="/signup-success" replace />} />
              
              {/* Protected routes */}
              <Route 
                path={ROUTES.RECIPE_GENERATOR} 
                element={<ProtectedRoute element={<RecipeGenerator />} />} 
              />
              <Route 
                path={ROUTES.RECIPE_DETAIL} 
                element={<ProtectedRoute element={<RecipeDetail />} />} 
              />
              <Route 
                path={ROUTES.RECIPE_CREATE} 
                element={<ProtectedRoute element={<RecipeCreate />} />} 
              />
              <Route 
                path={ROUTES.USER_RECIPES} 
                element={<ProtectedRoute element={<UserRecipes />} />} 
              />
              <Route 
                path={ROUTES.ACCOUNT_SETTINGS} 
                element={<ProtectedRoute element={<AccountSettings />} />} 
              />
              
              {/* Favorites Route */}
              <Route 
                path="/favorites" 
                element={<ProtectedRoute element={<FavoritesPage />} />} 
              />
              
              {/* Admin routes */}
              <Route 
                path={ROUTES.ADMIN_DASHBOARD} 
                element={<ProtectedRoute element={<AdminDashboard />} requiresAdmin={true} />} 
              />
              
              {/* Catch-all / 404 route */}
              <Route path="*" element={<Error />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </Layout>
    </div>
  );
}

export default App;