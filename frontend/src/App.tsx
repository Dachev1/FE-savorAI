// src/App.tsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SignIn from './pages/SignInSignUp/SignIn';
import SignUp from './pages/SignInSignUp/SignUp';
import LearnMore from './pages/LearnMore';
import Contact from './pages/Contact';
import About from './pages/About';
import RecipeGenerator from './pages/Recipe/RecipeGenerator';
import RecipeCreate from './pages/Recipe/RecipeCreate';
import Error from './pages/Error';
import RegistrationSuccess from './pages/SignInSignUp/RegistrationSuccess';
import AllergenSetup from './pages/AllergenSetup'
import RecipePreview from './pages/Recipe/RecipePreview';

const App: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<RecipeGenerator />} />
          <Route path="/recipes/create" element={<RecipeCreate />} />
          <Route path="/recipes/preview/:id" element={<RecipePreview />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/registration-success" element={<RegistrationSuccess />} />
          <Route path="/learn-more" element={<LearnMore />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/allergen-setup" element={<AllergenSetup />} />
          <Route path="*" element={<Error />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default App;
