import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout.tsx';
import LoadingSpinner from './components/common/LoadingSpinner';
import { useAuth } from './context/AuthContext';

// Lazy load page components
const Home = lazy(() => import('./pages/Home.tsx'));
const SignIn = lazy(() => import('./pages/Auth/SignIn.tsx'));
const SignUp = lazy(() => import('./pages/Auth/SignUp.tsx'));
const About = lazy(() => import('./pages/About.tsx'));
const Contact = lazy(() => import('./pages/Contact.tsx'));
const RecipeCreate = lazy(() => import('./pages/Recipe/RecipeCreate.tsx'));
const RecipeDetail = lazy(() => import('./pages/Recipe/RecipeDetail.tsx'));
const NotFound = lazy(() => import('./pages/NotFound.tsx'));

// Protected route component
const ProtectedRoute: React.FC<{ 
  children: React.ReactNode,
  redirectTo?: string 
}> = ({ 
  children, 
  redirectTo = '/signin' 
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <LoadingSpinner size="large" />
      </div>
    );
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to={redirectTo} replace />;
};

const App: React.FC = () => {
  return (
    <Layout>
      <Suspense fallback={
        <div className="flex justify-center items-center min-h-[50vh]">
          <LoadingSpinner size="large" />
        </div>
      }>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/recipes/:id" element={<RecipeDetail />} />
          
          {/* Protected routes */}
          <Route 
            path="/recipes/create" 
            element={
              <ProtectedRoute>
                <RecipeCreate />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/recipes/edit/:id" 
            element={
              <ProtectedRoute>
                <RecipeCreate />
              </ProtectedRoute>
            } 
          />
          
          {/* 404 route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Layout>
  );
};

export default App; 