import { lazy } from 'react';

const RecipeGenerator = lazy(() => import('./pages/Recipe/RecipeGenerator'));
const RecipeCreate = lazy(() => import('./pages/Recipe/RecipeCreate'));
const RecipePreview = lazy(() => import('./pages/Recipe/RecipePreview'));
const SignIn = lazy(() => import('./pages/Auth/SignIn'));
const SignUp = lazy(() => import('./pages/Auth/SignUp'));
const RegistrationSuccess = lazy(() => import('./pages/Auth/RegistrationSuccess'));
const LearnMore = lazy(() => import('./pages/LearnMore'));
const Contact = lazy(() => import('./pages/Contact'));
const About = lazy(() => import('./pages/About'));
const AllergenSetup = lazy(() => import('./pages/AllergenSetup'));
const Error = lazy(() => import('./pages/Error'));

export const routes = [
  { path: '/', component: RecipeGenerator },
  { path: '/recipes/create', component: RecipeCreate },
  { path: '/recipes/preview/:id', component: RecipePreview },
  { path: '/login', component: SignIn },
  { path: '/register', component: SignUp },
  { path: '/registration-success', component: RegistrationSuccess },
  { path: '/learn-more', component: LearnMore },
  { path: '/contact', component: Contact },
  { path: '/about', component: About },
  { path: '/allergen-setup', component: AllergenSetup },
  { path: '*', component: Error }
]; 