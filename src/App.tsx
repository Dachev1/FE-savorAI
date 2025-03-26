// src/App.tsx
import { Suspense, lazy, memo } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/layout/Layout';
import { LoadingSpinner } from './components/common';
import { useAuth } from './context/AuthContext';
import { ROUTES } from './routes';

// Lazily loaded components with prefetching hints
const Home = lazy(() => import('./pages/Home' /* webpackPrefetch: true */));
const About = lazy(() => import('./pages/About/About'));
const SignIn = lazy(() => import('./pages/Auth/SignIn'));
const SignUp = lazy(() => import('./pages/Auth/SignUp'));
const RegistrationSuccess = lazy(() => import('./pages/Auth/RegistrationSuccess'));
const RecipeGenerator = lazy(() => import('./pages/Recipe/RecipeGenerator' /* webpackPrefetch: true */));
const RecipeDetail = lazy(() => import('./pages/Recipe/RecipeDetail'));
const RecipeCreate = lazy(() => import('./pages/Recipe/RecipeCreate'));
const UserRecipes = lazy(() => import('./pages/Recipe/UserRecipes'));
const Error = lazy(() => import('./pages/Error'));
const AdminDashboard = lazy(() => import('./pages/Admin/AdminDashboard'));

const PageLoading = memo(() => (
  <div className="flex justify-center items-center min-h-[50vh]">
    <LoadingSpinner size="large" />
  </div>
));

interface ProtectedRouteProps {
  element: React.ReactNode;
  requiresAuth?: boolean;
  requiresAdmin?: boolean;
}

const ProtectedRoute = memo(({ 
  element, 
  requiresAuth = true, 
  requiresAdmin = false 
}: ProtectedRouteProps) => {
  const { isAuthenticated, isAdmin, isLoading, checkAuth } = useAuth();
  const location = useLocation();

  // Check auth when path changes
  if (!isLoading && location.pathname !== localStorage.getItem('lastPathChecked')) {
    checkAuth();
    localStorage.setItem('lastPathChecked', location.pathname);
  }

  // Store intended path for redirect after login
  if (requiresAuth && !isAuthenticated && location.pathname !== ROUTES.SIGN_IN) {
    localStorage.setItem('intendedPath', location.pathname);
  }

  if (isLoading) return <PageLoading />;

  // Route protection logic
  if (!requiresAuth && isAuthenticated) {
    return <Navigate to={ROUTES.HOME} replace />;
  }
  
  if (requiresAuth && !isAuthenticated) {
    return <Navigate to={ROUTES.SIGN_IN} state={{ from: location.pathname }} replace />;
  }
  
  if (requiresAuth && requiresAdmin && !isAdmin) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return <>{element}</>;
});

const App = memo(() => (
  <Layout>
    <Suspense fallback={<PageLoading />}>
      <Routes>
        {/* Public routes */}
        <Route path={ROUTES.ABOUT} element={<About />} />
        <Route path={ROUTES.HOME} element={<Home />} />
        
        {/* Auth routes */}
        <Route 
          path={ROUTES.SIGN_IN} 
          element={<ProtectedRoute element={<SignIn />} requiresAuth={false} />} 
        />
        <Route 
          path={ROUTES.SIGN_UP} 
          element={<ProtectedRoute element={<SignUp />} requiresAuth={false} />} 
        />
        <Route 
          path={ROUTES.REGISTRATION_SUCCESS} 
          element={<ProtectedRoute element={<RegistrationSuccess />} requiresAuth={false} />} 
        />
        
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
        
        {/* Admin routes */}
        <Route 
          path={ROUTES.ADMIN_DASHBOARD} 
          element={<ProtectedRoute element={<AdminDashboard />} requiresAdmin />} 
        />
        
        {/* Error route */}
        <Route path={ROUTES.ERROR_404} element={<Error />} />
      </Routes>
    </Suspense>
  </Layout>
));

export default App;
