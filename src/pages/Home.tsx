import React, { useEffect, memo, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useAuth, useDarkMode } from '../context';
import { FiZap, FiPlusCircle, FiBookOpen } from 'react-icons/fi';
import { FaRobot, FaHeart, FaUsers, FaClock, FaLeaf, FaUtensils, FaStar } from 'react-icons/fa';

// Memoized card components
const FeatureCard = memo<{ icon: React.ReactNode; title: string; description: string; delay: number }>(({ 
  icon, title, description, delay 
}) => (
  <div 
    className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 relative overflow-hidden border border-transparent hover:border-blue-200 dark:hover:border-blue-800"
    data-aos="fade-up"
    data-aos-delay={delay}
  >
    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-100 to-transparent dark:from-blue-900/20 dark:to-transparent rounded-bl-full -z-10"></div>
    <div className="flex justify-center mb-4 text-blue-600 dark:text-blue-400">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white text-center">{title}</h3>
    <p className="text-gray-600 dark:text-gray-400 text-center">{description}</p>
  </div>
));

const StepCard = memo<{ number: number; title: string; description: string; delay: number }>(({ 
  number, title, description, delay 
}) => (
  <div 
    className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 relative overflow-hidden border border-transparent hover:border-indigo-200 dark:hover:border-indigo-800"
    data-aos="fade-up"
    data-aos-delay={delay}
  >
    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center text-xl font-bold mb-4 mx-auto transform transition-all duration-300 hover:scale-110">
      {number}
    </div>
    <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white text-center">{title}</h3>
    <p className="text-gray-600 dark:text-gray-400 text-center">{description}</p>
  </div>
));

const BenefitCard = memo<{ icon: React.ReactNode; title: string; description: string; delay: number }>(({ 
  icon, title, description, delay 
}) => (
  <div 
    className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 relative overflow-hidden border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
    data-aos="fade-up"
    data-aos-delay={delay}
  >
    <div className="absolute -top-6 -right-6 w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-full -z-10"></div>
    <div className="absolute -bottom-6 -left-6 w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-full -z-10"></div>
    <div className="flex justify-center mb-4 text-blue-600 dark:text-blue-400">
      {icon}
    </div>
    <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white text-center">{title}</h3>
    <p className="text-sm text-gray-600 dark:text-gray-400 text-center">{description}</p>
  </div>
));

// Add display names for debugging
FeatureCard.displayName = 'FeatureCard';
StepCard.displayName = 'StepCard';
BenefitCard.displayName = 'BenefitCard';

// Memoized authenticated home component
const AuthenticatedHome = memo(() => {
  const { isDarkMode } = useDarkMode();
  
  return (
    <div className="w-full py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">
          <span className={`text-transparent bg-clip-text ${
            isDarkMode 
              ? 'bg-gradient-to-r from-blue-300 to-indigo-400' 
              : 'bg-gradient-to-r from-blue-600 to-indigo-700'
          }`}>
            Welcome to SavorAI
          </span>
        </h1>
        
        <div className="grid md:grid-cols-3 gap-6">
          {/* Generate Recipe Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="h-36 bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
              <FiZap className="text-white h-16 w-16" />
            </div>
            <div className="p-6">
              <h2 className="text-xl font-bold mb-3">Generate Recipe</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Let AI create the perfect recipe based on your available ingredients.
              </p>
              <Link 
                to="/recipe/generator" 
                className="w-full block text-center py-2 px-4 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800/40 transition-colors"
              >
                Generate Now
              </Link>
            </div>
          </div>
          
          {/* Create Recipe Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="h-36 bg-gradient-to-r from-amber-500 to-orange-600 flex items-center justify-center">
              <FiPlusCircle className="text-white h-16 w-16" />
            </div>
            <div className="p-6">
              <h2 className="text-xl font-bold mb-3">Create Recipe</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Share your own culinary creations with the community.
              </p>
              <Link 
                to="/recipe/create" 
                className="w-full block text-center py-2 px-4 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-800/40 transition-colors"
              >
                Create Recipe
              </Link>
            </div>
          </div>
          
          {/* Browse Recipes Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="h-36 bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center">
              <FiBookOpen className="text-white h-16 w-16" />
            </div>
            <div className="p-6">
              <h2 className="text-xl font-bold mb-3">Browse Recipes</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Explore recipes created by the community and find your next meal.
              </p>
              <Link 
                to="/recipes" 
                className="w-full block text-center py-2 px-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-800/40 transition-colors"
              >
                View Collection
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

// Memoized unauthenticated home component
const UnauthenticatedHome = memo(() => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    // Reset AOS animations when component mounts
    AOS.refresh();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 dark:bg-blue-900/30 rounded-full mix-blend-multiply dark:mix-blend-soft-light blur-xl opacity-70 dark:opacity-30 animate-blob"></div>
      <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 dark:bg-purple-900/30 rounded-full mix-blend-multiply dark:mix-blend-soft-light blur-xl opacity-70 dark:opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-20 left-1/3 w-72 h-72 bg-amber-200 dark:bg-amber-900/30 rounded-full mix-blend-multiply dark:mix-blend-soft-light blur-xl opacity-70 dark:opacity-30 animate-blob animation-delay-4000"></div>
      
      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className={`text-center mb-8 transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10'}`}>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-400 dark:to-indigo-300">
            Welcome to SavorAI
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Your AI-powered recipe companion
          </p>
        </div>

        {/* CTA Section */}
        <div className="text-center py-10 px-6 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-xl mb-24" data-aos="zoom-in">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to transform your cooking experience?</h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">Join SavorAI today and discover a world of delicious possibilities.</p>
          <Link to="/signup" className="inline-block px-8 py-3 bg-white text-blue-600 font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            Get Started for Free
          </Link>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          <FeatureCard
            icon={<FaRobot className="w-10 h-10" />}
            title="AI-Powered Recipes"
            description="Get personalized recipe recommendations based on your preferences and dietary requirements."
            delay={200}
          />
          <FeatureCard
            icon={<FaHeart className="w-10 h-10" />}
            title="Save Favorites"
            description="Create your personal collection of favorite recipes for quick access."
            delay={300}
          />
          <FeatureCard
            icon={<FaUsers className="w-10 h-10" />}
            title="Community Sharing"
            description="Share your recipes with the community and discover new favorites."
            delay={400}
          />
        </div>

        {/* How It Works Section */}
        <div className="text-center mb-24" data-aos="fade-up">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">How It Works</h2>
          <div className="w-24 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mx-auto mb-12"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-14 left-1/2 h-0.5 w-1/3 -translate-x-full bg-indigo-200 dark:bg-indigo-800"></div>
            <div className="hidden md:block absolute top-14 left-1/2 h-0.5 w-1/3 bg-indigo-200 dark:bg-indigo-800"></div>
            <StepCard
              number={1}
              title="Sign Up"
              description="Create your account to get started with personalized recipe recommendations."
              delay={500}
            />
            <StepCard
              number={2}
              title="Set Preferences"
              description="Tell us about your dietary preferences and restrictions."
              delay={600}
            />
            <StepCard
              number={3}
              title="Get Recipes"
              description="Receive AI-generated recipes tailored to your tastes."
              delay={700}
            />
          </div>
        </div>

        {/* Benefits Section */}
        <div className="text-center mb-16" data-aos="fade-up">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Why Choose SavorAI?</h2>
          <div className="w-24 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mx-auto mb-12"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <BenefitCard
              icon={<FaClock className="w-8 h-8" />}
              title="Save Time"
              description="Quick recipe generation based on available ingredients."
              delay={800}
            />
            <BenefitCard
              icon={<FaLeaf className="w-8 h-8" />}
              title="Healthy Options"
              description="Focus on nutritious and balanced meal suggestions."
              delay={900}
            />
            <BenefitCard
              icon={<FaUtensils className="w-8 h-8" />}
              title="Diverse Cuisine"
              description="Explore recipes from various cultural backgrounds."
              delay={1000}
            />
            <BenefitCard
              icon={<FaStar className="w-8 h-8" />}
              title="Personalized"
              description="Recipes tailored to your specific preferences."
              delay={1100}
            />
          </div>
        </div>
      </div>
    </div>
  );
});

// Add display names for debugging
AuthenticatedHome.displayName = 'AuthenticatedHome';
UnauthenticatedHome.displayName = 'UnauthenticatedHome';

// Main home component
const Home: React.FC = () => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const [authState, setAuthState] = useState({ isAuthenticated, user });
  const prevAuthStateRef = useRef({ isAuthenticated, user });
  const authChangeCountRef = useRef(0);
  
  // Update local auth state when global auth state changes, with optimization
  useEffect(() => {
    // Only update if auth state actually changed
    const userIdChanged = prevAuthStateRef.current.user?.id !== user?.id;
    const authStatusChanged = prevAuthStateRef.current.isAuthenticated !== isAuthenticated;
    
    if (userIdChanged || authStatusChanged) {
      // Update local state for component 
      setAuthState({ isAuthenticated, user });
      prevAuthStateRef.current = { isAuthenticated, user };
      
      // Rate-limit logging to prevent console spam
      if (import.meta.env.DEV && authChangeCountRef.current < 3) {
        console.log('Home - Auth state changed:', { 
          isAuthenticated, 
          user: user ? {...user, password: undefined} : null,
          changeCount: ++authChangeCountRef.current
        });
      }
    }
  }, [isAuthenticated, user]);
  
  // Handle global auth state change events
  useEffect(() => {
    const handleAuthChange = (event: Event) => {
      // Extract auth details from the event if available
      const customEvent = event as CustomEvent;
      const newAuthState = customEvent.detail?.authenticated;
      
      // Only update state if there's a real change from the event
      if (prevAuthStateRef.current.isAuthenticated !== newAuthState) {
        setAuthState(prev => ({ 
          ...prev, 
          isAuthenticated: newAuthState 
        }));
        prevAuthStateRef.current.isAuthenticated = newAuthState;
      }
    };
    
    window.addEventListener('auth-state-changed', handleAuthChange);
    return () => window.removeEventListener('auth-state-changed', handleAuthChange);
  }, []);
  
  // Reset change counter when component unmounts/remounts
  useEffect(() => {
    return () => {
      authChangeCountRef.current = 0;
    };
  }, []);
  
  useEffect(() => {
    // Initialize AOS animations
    AOS.init({
      duration: 800,
      once: true,
      mirror: false
    });
  }, []);
  
  // Show loading state while authentication is being checked
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  // Render the appropriate home page based on auth state
  return authState.isAuthenticated ? <AuthenticatedHome /> : <UnauthenticatedHome />;
};

Home.displayName = 'Home';

export default memo(Home); 