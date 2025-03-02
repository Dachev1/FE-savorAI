import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import FlyingFoods from '../components/FlyingFoods';
import { MdFoodBank, MdOutlineRestaurantMenu, MdManageSearch } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';
import { useDarkMode } from '../context/DarkModeContext';

const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { isDarkMode } = useDarkMode();

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
    });
  }, []);

  return (
    <div className="w-full overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-24">
        {/* Background pattern */}
        <div aria-hidden="true" className="absolute inset-0 z-0 overflow-hidden">
          <FlyingFoods count={8} />
        </div>
        
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 
              className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-6"
              data-aos="fade-down"
              data-aos-delay="100"
            >
              <span className={`inline-block text-transparent bg-clip-text ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-blue-300 to-indigo-400' 
                  : 'bg-gradient-to-r from-blue-600 to-indigo-700'
              }`}>
                Cook Smart with
              </span>
              <br />
              <span className={`inline-block text-transparent bg-clip-text ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-amber-300 to-orange-400' 
                  : 'bg-gradient-to-r from-amber-500 to-orange-600'
              }`}>
                SavorAI
              </span>
            </h1>
            
            <p 
              className="max-w-2xl mx-auto mt-4 text-xl sm:text-2xl text-gray-700 dark:text-gray-300"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              Discover recipes based on ingredients you already have at home.
              Reduce waste and enjoy delicious meals with AI-powered suggestions.
            </p>
            
            <div 
              className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4"
              data-aos="fade-up" 
              data-aos-delay="300"
            >
              <Link 
                to={isAuthenticated ? "/recipes" : "/register"} 
                className="w-full sm:w-auto px-8 py-3 rounded-xl font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600 shadow-md hover:shadow-lg transition-all duration-300 text-center"
              >
                {isAuthenticated ? "Explore Recipes" : "Get Started Free"}
              </Link>
              
              <Link 
                to="/recipe/generator" 
                className="w-full sm:w-auto px-8 py-3 rounded-xl font-medium text-gray-700 dark:text-gray-300 border-2 border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 text-center"
              >
                Try Recipe Generator
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 
              className="text-3xl sm:text-4xl font-bold mb-4 text-gray-800 dark:text-gray-200"
              data-aos="fade-up"
            >
              Smart Cooking with SavorAI
            </h2>
            <p 
              className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto"
              data-aos="fade-up"
              data-aos-delay="100"
            >
              Our AI-powered platform makes cooking easier and more sustainable
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div 
              className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-lg"
              data-aos="fade-up"
              data-aos-delay="100"
            >
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                  <MdOutlineRestaurantMenu className="w-8 h-8" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-center">Personalized Recommendations</h3>
              <p className="text-gray-600 dark:text-gray-400 text-center">
                Get recipe suggestions tailored to your preferences and dietary requirements.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div 
              className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-lg"
              data-aos="fade-up"
              data-aos-delay="200"
            >
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                  <MdFoodBank className="w-8 h-8" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-center">Cook With What You Have</h3>
              <p className="text-gray-600 dark:text-gray-400 text-center">
                Input the ingredients you have on hand and discover delicious recipes you can make.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div 
              className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-lg"
              data-aos="fade-up"
              data-aos-delay="300"
            >
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                  <MdManageSearch className="w-8 h-8" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-center">Reduce Food Waste</h3>
              <p className="text-gray-600 dark:text-gray-400 text-center">
                Use ingredients before they expire and minimize food waste with smart recipes.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-blue-900/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 
            className="text-3xl sm:text-4xl font-bold mb-6 text-gray-800 dark:text-gray-200"
            data-aos="fade-up"
          >
            Ready to transform your cooking experience?
          </h2>
          <p 
            className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            Join SavorAI today and discover a smarter way to cook with ingredients you already have.
          </p>
          
          <div 
            data-aos="fade-up"
            data-aos-delay="200"
          >
            <Link 
              to={isAuthenticated ? "/recipes" : "/register"}
              className="inline-block px-8 py-3 rounded-xl font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600 shadow-md hover:shadow-lg transition-all duration-300"
            >
              {isAuthenticated ? "Browse Your Recipes" : "Get Started Free"}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 