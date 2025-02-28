import { lazy } from 'react';

const RecipeGenerator = lazy(() => import('./pages/recipe/RecipeGenerator'));
const RecipeCreate = lazy(() => import('./pages/recipe/RecipeCreate'));
const RecipePreview = lazy(() => import('./pages/recipe/RecipePreview'));
const SignIn = lazy(() => import('./pages/auth/SignIn'));
const SignUp = lazy(() => import('./pages/auth/SignUp'));
const RegistrationSuccess = lazy(() => import('./pages/auth/RegistrationSuccess'));
const LearnMore = lazy(() => import('./pages/LearnMore'));
const Contact = lazy(() => import('./pages/Contact'));
const About = lazy(() => import('./pages/About'));
const AllergenSetup = lazy(() => import('./pages/AllergenSetup'));
const Error = lazy(() => import('./pages/Error'));

export const routes = [
  { path: '/', component: RecipeGenerator },
  { path: '/recipes/create', component: RecipeCreate },
  { path: '/recipes/preview/:id', component: RecipePreview },
  { path: '/signin', component: SignIn },
  { path: '/signup', component: SignUp },
  { path: '/registration-success', component: RegistrationSuccess },
  { path: '/learn-more', component: LearnMore },
  { path: '/contact', component: Contact },
  { path: '/about', component: About },
  { path: '/allergen-setup', component: AllergenSetup },
  { path: '*', component: Error }
]; 