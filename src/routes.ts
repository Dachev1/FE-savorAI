import { lazy } from 'react';

// Lazily loaded components with proper naming
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About/About'));
const SignIn = lazy(() => import('./pages/Auth/SignIn'));
const SignUp = lazy(() => import('./pages/Auth/SignUp'));
const RegistrationSuccess = lazy(() => import('./pages/Auth/RegistrationSuccess'));
const RecipeGenerator = lazy(() => import('./pages/Recipe/RecipeGenerator'));
const RecipeDetail = lazy(() => import('./pages/Recipe/RecipeDetail'));
const RecipeCreate = lazy(() => import('./pages/Recipe/RecipeCreate'));
const UserRecipes = lazy(() => import('./pages/Recipe/UserRecipes'));
const AdminDashboard = lazy(() => import('./pages/Admin/AdminDashboard'));
const Error = lazy(() => import('./pages/Error'));

// Constants for route paths
export const ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  SIGN_IN: '/signin',
  SIGN_UP: '/signup',
  REGISTRATION_SUCCESS: '/registration-success',
  RECIPE_GENERATOR: '/recipe/generator',
  RECIPE_DETAIL: '/recipe/:id',
  RECIPE_CREATE: '/recipe/create',
  USER_RECIPES: '/recipe/my-recipes',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ERROR_404: '*',
};

// Export route definitions
export const routes = [
  { path: ROUTES.HOME, component: Home },
  { path: ROUTES.ABOUT, component: About },
  { path: ROUTES.SIGN_IN, component: SignIn },
  { path: ROUTES.SIGN_UP, component: SignUp },
  { path: ROUTES.REGISTRATION_SUCCESS, component: RegistrationSuccess },
  { path: ROUTES.RECIPE_GENERATOR, component: RecipeGenerator },
  { path: ROUTES.RECIPE_DETAIL, component: RecipeDetail },
  { path: ROUTES.RECIPE_CREATE, component: RecipeCreate },
  { path: ROUTES.USER_RECIPES, component: UserRecipes },
  { path: ROUTES.ADMIN_DASHBOARD, component: AdminDashboard },
  { path: ROUTES.ERROR_404, component: Error }
]; 