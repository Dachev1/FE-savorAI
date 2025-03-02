// src/App.tsx
import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { LoadingSpinner } from './components/common';

// Lazy load page components for better performance
const Home = React.lazy(() => import('./pages/Home.tsx'));
const SignIn = React.lazy(() => import('./pages/Auth/SignIn.tsx'));
const SignUp = React.lazy(() => import('./pages/Auth/SignUp.tsx'));
const RegistrationSuccess = React.lazy(() => import('./pages/Auth/RegistrationSuccess.tsx'));
const About = React.lazy(() => import('./pages/About/About.tsx'));
const Contact = React.lazy(() => import('./pages/Contact.tsx'));
const LearnMore = React.lazy(() => import('./pages/LearnMore.tsx'));
const AllergenSetup = React.lazy(() => import('./pages/AllergenSetup.tsx'));
const RecipeCreate = React.lazy(() => import('./pages/Recipe/RecipeCreate.tsx'));
const RecipeDetail = React.lazy(() => import('./pages/Recipe/RecipeDetail.tsx'));
const RecipeGenerator = React.lazy(() => import('./pages/Recipe/RecipeGenerator.tsx'));
const Error = React.lazy(() => import('./pages/Error.tsx'));

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

// Loading fallback component
const LoadingFallback: React.FC = () => (
  <div className="flex justify-center items-center min-h-[50vh]">
    <LoadingSpinner size="large" />
  </div>
);

const App: React.FC = () => {  
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/login" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/register" element={<SignUp />} />
        <Route path="/registration-success" element={<RegistrationSuccess />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/learn-more" element={<LearnMore />} />
        <Route path="/recipes/:id" element={<RecipeDetail />} />
        <Route path="/recipe/generator" element={<RecipeGenerator />} />
        
        {/* Protected routes */}
        <Route path="/allergen-setup" element={
          <ProtectedRoute>
            <AllergenSetup />
          </ProtectedRoute>
        } />
        <Route path="/recipes/create" element={
          <ProtectedRoute>
            <RecipeCreate />
          </ProtectedRoute>
        } />
        <Route path="/recipes/edit/:id" element={
          <ProtectedRoute>
            <RecipeCreate />
          </ProtectedRoute>
        } />
        
        {/* 404 route */}
        <Route path="*" element={<Error />} />
      </Routes>
    </Suspense>
  );
};

export default App;
