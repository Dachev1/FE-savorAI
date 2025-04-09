// src/App.tsx
import React, { Suspense, lazy, memo, useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import { LoadingSpinner } from './components/common';
import { useAuth } from './context';
import { ROUTES } from './routes';
import AuthCleaner from './components/AuthCleaner';
import auth from './utils/auth';
import ErrorBoundary from './components/common/ErrorBoundary';
import { useConnectionQuality } from './hooks';

// Define the gtag function for TypeScript
declare global {
  interface Window {
    gtag?: (command: string, action: string, params: object) => void;
  }
}

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
const AllRecipes = lazy(() => import('./pages/Recipe/AllRecipes'));
const AccountSettings = lazy(() => import('./pages/Profile/AccountSettings'));
const Error = lazy(() => import('./pages/Error'));
const AdminDashboard = lazy(() => import('./pages/Admin/AdminDashboard'));
const FavoritesPage = lazy(() => import('./pages/Favorites/FavoritesPage'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Loading component with connection-aware optimization
const PageLoading = memo(() => {
  const { isLowBandwidth } = useConnectionQuality();
  
  return (
    <div className="flex justify-center items-center min-h-[50vh]">
      <LoadingSpinner 
        size={isLowBandwidth ? "medium" : "large"} 
        className={isLowBandwidth ? "text-gray-600" : "text-blue-600"}
      />
    </div>
  );
});
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

// Protected route component
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
  
  if ((requiresAuth && !isAuthenticated) || (requiresAdmin && !isAdmin)) {
    if (requiresAuth && !isAuthenticated) {
      sessionStorage.setItem('pending_redirect', window.location.pathname);
      return <Navigate to="/signin" replace />;
    }
    
    if (requiresAdmin && !isAdmin) {
      return <Navigate to="/" replace />;
    }
  }
  
  return element;
});
ProtectedRoute.displayName = 'ProtectedRoute';

// Redirect authenticated users away from auth pages
const PublicAuthRoute = memo(({ 
  element
}: { 
  element: React.ReactElement;
}) => {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    return <Navigate to={ROUTES.HOME} replace />;
  }
  
  return element;
});
PublicAuthRoute.displayName = 'PublicAuthRoute';

// Simplified performance reporting
const reportPerformance = (metric: string, value: number) => {
  if (window.gtag) {
    window.gtag('event', metric, {
      value: Math.round(value),
      event_category: 'Performance',
      non_interaction: true,
    });
  }
};

function App() {
  const { isAuthenticated, refreshUserData, isAdmin, user } = useAuth();
  const [isInitializing, setIsInitializing] = useState(true);
  const lastRefreshTime = useRef<number>(0);
  const lastRoleVerificationTime = useRef<number>(0);
  const isInitialRender = useRef(true);
  const refreshPending = useRef(false);
  const MIN_REFRESH_INTERVAL = 5000;
  const navigate = useNavigate();
  const location = useLocation();
  const prevPathRef = useRef(location.pathname);
  
  // Verify user roles for sensitive routes
  const verifyUserRole = useCallback(async () => {
    if (Date.now() - lastRoleVerificationTime.current < ROLE_VERIFICATION_INTERVAL) {
      return;
    }
    
    if (location.pathname.startsWith('/admin')) {
      auth.forceTokenRefresh();
    }
    
    const isAdminRoute = location.pathname.startsWith('/admin');
    if (!isAuthenticated || (!isAdminRoute && Date.now() - lastRoleVerificationTime.current < ROLE_VERIFICATION_INTERVAL)) {
      return;
    }
    
    if (isAdminRoute || isAdmin === undefined || lastRoleVerificationTime.current === 0) {
      const success = await refreshUserData();
      lastRoleVerificationTime.current = Date.now();
      
      if (success && !isAdmin && isAdminRoute) {
        navigate('/');
      }
    }
  }, [isAuthenticated, isAdmin, location.pathname, navigate, refreshUserData]);
  
  // Handle authentication state changes with better debouncing
  const handleAuthStateChange = useCallback((event: Event) => {
    const customEvent = event as CustomEvent;
    const detail = customEvent.detail || {};
    const source = detail.source || 'unknown';
    const action = detail.action || '';
    
    const now = Date.now();
    if (now - lastRefreshTime.current < MIN_REFRESH_INTERVAL && user) {
      return;
    }
    
    if (refreshPending.current) {
      return;
    }
    
    if (['login', 'auth-restored', 'role-changed'].includes(action)) {
      auth.forceTokenRefresh();
    }
    
    if (detail.reason === 'unauthorized' || detail.reason === 'network-error') {
      return;
    }
    
    if (source === 'app-component') {
      return;
    }
    
    if (action === 'role-changed' || detail.roleChanged) {
      lastRoleVerificationTime.current = now;
      refreshPending.current = true;
      
      setTimeout(() => {
        refreshUserData().finally(() => {
          lastRefreshTime.current = Date.now();
          refreshPending.current = false;
        });
      }, 50);
      return;
    }
    
    if (action === 'username-changed' || detail.usernameChanged) {
      refreshPending.current = true;
      
      setTimeout(() => {
        refreshUserData().finally(() => {
          lastRefreshTime.current = Date.now();
          refreshPending.current = false;
        });
      }, 50);
      return;
    }
    
    if (!refreshPending.current) {
      refreshPending.current = true;
      
      setTimeout(() => {
        refreshUserData().finally(() => {
          lastRefreshTime.current = Date.now();
          refreshPending.current = false;
        });
      }, 100);
    }
  }, [refreshUserData, user]);

  // Initialize app with auth check - only on first mount
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

        const initTimeout = setTimeout(() => {
          setIsInitializing(false);
        }, 3000);

        await refreshUserData();

        lastRefreshTime.current = Date.now();
        lastRoleVerificationTime.current = Date.now();
        
        clearTimeout(initTimeout);
      } catch (error) {
        console.error('Error during initialization:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeApp();
    window.addEventListener('auth-state-changed', handleAuthStateChange);
    
    return () => {
      window.removeEventListener('auth-state-changed', handleAuthStateChange);
    };
  }, [handleAuthStateChange, refreshUserData, user]);
  
  // Handle network status changes
  useEffect(() => {
    const handleOnline = () => {
      if (auth.isTokenValid() && isAuthenticated && !refreshPending.current) {
        const now = Date.now();
        if (now - lastRefreshTime.current > 30000) {
          refreshPending.current = true;
          setTimeout(() => {
            refreshUserData().finally(() => {
              lastRefreshTime.current = Date.now();
              refreshPending.current = false;
            });
          }, 2000);
        }
      }
    };
    
    window.addEventListener('online', handleOnline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [refreshUserData, isAuthenticated]);

  // Dispatch auth-restored event on mount if user is already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
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

  // Register basic performance monitoring
  useEffect(() => {
    if ('performance' in window) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          if (performance.timing) {
            const pageLoadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
            reportPerformance('page-load', pageLoadTime);
            
            const domContentLoaded = performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart;
            reportPerformance('dom-content-loaded', domContentLoaded);
            
            const firstPaint = performance.timing.responseStart - performance.timing.navigationStart;
            reportPerformance('first-paint', firstPaint);
          }
          
          if (performance.getEntriesByType) {
            const paintMetrics = performance.getEntriesByType('paint');
            paintMetrics.forEach(metric => {
              reportPerformance(metric.name, metric.startTime);
            });
          }
        }, 0);
      });
    }
  }, []);
  
  // Optimize scroll performance
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  // Prefetch common routes
  useEffect(() => {
    if ('requestIdleCallback' in window) {
      const idleCallback = window.requestIdleCallback(() => {
        const prefetchPromises = [
          import('./pages/Home'),
          import('./pages/Recipe/RecipeCreate')
        ];
        
        Promise.allSettled(prefetchPromises).catch(() => {});
      }, { timeout: 2000 });
      
      return () => {
        if ('cancelIdleCallback' in window) {
          window.cancelIdleCallback(idleCallback);
        }
      };
    }
  }, []);

  // Optimize the verification of roles on route changes - combined route change handler
  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      prevPathRef.current = location.pathname;
      return;
    }
    
    if (prevPathRef.current === location.pathname) {
      return;
    }
    
    prevPathRef.current = location.pathname;
    
    if (Date.now() - lastRoleVerificationTime.current < 10000) {
      return;
    }
    
    const path = location.pathname;
    if (path.startsWith('/admin')) {
      verifyUserRole();
    }
  }, [location.pathname, verifyUserRole]);

  // Preload frequently accessed lazy components
  useEffect(() => {
    // Preload most common components to avoid suspense during navigation
    const preloadComponents = async () => {
      if (isAuthenticated) {
        // Preload authenticated user components
        await Promise.all([
          import('./pages/Recipe/RecipeGenerator'),
          import('./pages/Recipe/UserRecipes')
        ]);
      } else {
        // Preload public components
        await Promise.all([
          import('./pages/Home'),
          import('./pages/About/About')
        ]);
      }
    };
    
    // Wait until after initial render
    const timer = setTimeout(() => {
      preloadComponents().catch(() => {});
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [isAuthenticated]);

  // Memoize the Routes component to prevent unnecessary re-renders
  const AppRoutes = useMemo(() => (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Navigate to="/recipe/generator" replace /> : <Home />} />
      <Route path={ROUTES.ABOUT} element={<About />} />
      <Route path={ROUTES.CONTACT} element={<Contact />} />
      <Route path={ROUTES.CONTACT_SUCCESS} element={<ContactSuccess />} />
      
      <Route path={ROUTES.SIGN_IN} element={<PublicAuthRoute element={<SignIn />} />} />
      <Route path={ROUTES.SIGN_UP} element={<PublicAuthRoute element={<SignUp />} />} />
      <Route path={ROUTES.SIGNUP_SUCCESS} element={<PublicAuthRoute element={<SignupSuccess />} />} />
      
      <Route path="/login" element={<PublicAuthRoute element={<LoginRedirect />} />} />
      <Route path="/registration-success" element={<Navigate to="/signup-success" replace />} />
      
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
        path={ROUTES.RECIPE_EDIT} 
        element={<ProtectedRoute element={<RecipeCreate />} />} 
      />
      <Route 
        path={ROUTES.USER_RECIPES} 
        element={<ProtectedRoute element={<UserRecipes />} />} 
      />
      <Route 
        path={ROUTES.ALL_RECIPES} 
        element={<ProtectedRoute element={<AllRecipes />} />} 
      />
      <Route 
        path={ROUTES.ACCOUNT_SETTINGS} 
        element={<ProtectedRoute element={<AccountSettings />} />} 
      />
      
      <Route 
        path="/favorites" 
        element={<ProtectedRoute element={<FavoritesPage />} />} 
      />
      
      <Route 
        path={ROUTES.ADMIN_DASHBOARD} 
        element={<ProtectedRoute element={<AdminDashboard />} requiresAdmin={true} />} 
      />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  ), [isAuthenticated]);

  if (isInitializing) {
    return <PageLoading />;
  }
  
  return (
    <div>
      <AuthCleaner />
      <Layout>
        <ErrorBoundary>
          <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center opacity-70 transition-opacity duration-300">
            <PageLoading />
          </div>}>
            {AppRoutes}
          </Suspense>
        </ErrorBoundary>
      </Layout>
    </div>
  );
}

export default App;