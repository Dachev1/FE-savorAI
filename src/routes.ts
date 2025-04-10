import { lazy } from 'react';
import FavoritesPage from './pages/Favorites/FavoritesPage';
import { FAVORITES } from './constants/routes';

// Lazily loaded components with proper naming
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
const MyRecipes = lazy(() => import('./pages/Recipe/MyRecipes'));
const RecipeFeed = lazy(() => import('./pages/Recipe/RecipeFeed'));
const AdminDashboard = lazy(() => import('./pages/Admin/AdminDashboard'));
const AccountSettings = lazy(() => import('./pages/Profile/AccountSettings'));
const Error = lazy(() => import('./pages/Error'));

// Routes constants for the application
export const ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  CONTACT: '/contact',
  CONTACT_SUCCESS: '/contact-success',
  SIGN_IN: '/signin',
  SIGN_UP: '/signup',
  SIGNUP_SUCCESS: '/signup-success',
  RECIPE_GENERATOR: '/recipe/generator',
  RECIPE_DETAIL: '/recipes/:id',
  RECIPE_CREATE: '/recipe/create',
  RECIPE_EDIT: '/recipe/create/:id',
  RECIPE_EDIT_LEGACY: '/recipes/edit/:id',
  USER_RECIPES: '/recipe/my-recipes',
  RECIPE_FEED: '/recipes/feed',
  ADMIN_DASHBOARD: '/admin',
  ACCOUNT_SETTINGS: '/profile',
  ERROR_404: '*',
  FAVORITES: '/favorites',
};

// Export route definitions
export const routes = [
  { path: ROUTES.HOME, component: Home },
  { path: ROUTES.ABOUT, component: About },
  { path: ROUTES.CONTACT, component: Contact },
  { path: ROUTES.CONTACT_SUCCESS, component: ContactSuccess },
  { path: ROUTES.SIGN_IN, component: SignIn },
  { path: ROUTES.SIGN_UP, component: SignUp },
  { path: ROUTES.SIGNUP_SUCCESS, component: SignupSuccess },
  { path: ROUTES.RECIPE_GENERATOR, component: RecipeGenerator },
  { path: ROUTES.RECIPE_DETAIL, component: RecipeDetail },
  { path: ROUTES.RECIPE_CREATE, component: RecipeCreate },
  { path: ROUTES.RECIPE_EDIT, component: RecipeCreate },
  { path: ROUTES.RECIPE_EDIT_LEGACY, component: RecipeCreate },
  { path: ROUTES.USER_RECIPES, component: MyRecipes, authRequired: true },
  { path: ROUTES.RECIPE_FEED, component: RecipeFeed, authRequired: true },
  { path: ROUTES.ADMIN_DASHBOARD, component: AdminDashboard },
  { path: ROUTES.ACCOUNT_SETTINGS, component: AccountSettings },
  { path: ROUTES.ERROR_404, component: Error },
  { path: FAVORITES, component: FavoritesPage, authRequired: true },
];

export default routes; 