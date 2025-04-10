import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { recipeService } from '../../api/serviceApi';
import { useAuth } from '../../context';
import { FaPlus, FaSearch, FaEdit, FaEye, FaArrowUp, FaArrowDown, FaComment, FaUtensils, FaClock, FaFireAlt, FaDumbbell, FaCarrot, FaOilCan } from 'react-icons/fa';
import { LoadingSpinner } from '../../components/common';
import AOS from 'aos';
import 'aos/dist/aos.css';

// Enhanced recipe type with nutrition and metadata
interface Recipe {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  ingredientsUsed?: string[];
  ingredients?: string[];
  upvotes?: number;
  downvotes?: number;
  commentCount?: number;
  prepTimeMinutes?: number;
  totalTimeMinutes?: number;
  createdAt?: string;
  createdById?: string;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  macros?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
}

const addCacheBuster = (url: string | undefined | null): string | undefined => {
  if (!url) return undefined;
  // Add a timestamp to prevent browser caching
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}t=${Date.now()}`;
};

const UserRecipes: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Initialize animations
  useEffect(() => {
    AOS.init({ 
      duration: 700,
      once: true,
      easing: 'ease-out-cubic',
    });
    
    return () => {
      document.querySelectorAll('[data-aos]').forEach(el => {
        el.removeAttribute('data-aos');
      });
    };
  }, []);

  // Fetch user's recipes
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }
    
    fetchMyRecipes();
  }, [isAuthenticated, navigate]);

  const fetchMyRecipes = async () => {
    try {
      setLoading(true);
      const response = await recipeService.getMyRecipes();
      setRecipes(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load your recipes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Format cooking time
  const formatCookingTime = (minutes?: number) => {
    if (!minutes) return 'N/A';
    if (minutes < 60) return `${minutes} min`;
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hrs} hr ${mins} min` : `${hrs} hr`;
  };
  
  // Get difficulty label with proper casing
  const getDifficultyLabel = (difficulty?: string) => {
    if (!difficulty) return 'Medium';
    return difficulty.charAt(0) + difficulty.slice(1).toLowerCase();
  };

  // Filter recipes based on search term and category
  const filteredRecipes = useMemo(() => 
    recipes.filter(recipe => {
      const matchesSearch = 
        !searchTerm || 
        (recipe.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (recipe.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (recipe.ingredientsUsed || recipe.ingredients || []).some(i => 
          typeof i === 'string' && i.toLowerCase().includes(searchTerm.toLowerCase())
        );
      
      const matchesCategory = selectedCategory === 'all' || 
        (selectedCategory === 'easy' && recipe.difficulty === 'EASY') ||
        (selectedCategory === 'medium' && recipe.difficulty === 'MEDIUM') ||
        (selectedCategory === 'hard' && recipe.difficulty === 'HARD');
      
      return matchesSearch && matchesCategory;
    }), [recipes, searchTerm, selectedCategory]
  );

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.onerror = null; // Prevent infinite loop
    target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Page header - Apple-style clean header */}
        <div className="mb-12 text-center" data-aos="fade-down">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
            My Recipes
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-xl max-w-2xl mx-auto">
            Discover and manage your culinary creations
          </p>
        </div>
        
        {/* Action bar with search and new recipe button */}
        <div className="flex flex-col md:flex-row items-center gap-6 mb-12" data-aos="fade-up" data-aos-delay="100">
          {/* Search input with frosted glass effect */}
          <div className="relative flex-grow w-full">
            <input
              type="text"
              placeholder="Search recipes..."
              className="w-full p-4 pl-14 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400/30 dark:focus:ring-blue-600/30 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="absolute text-gray-400 left-5 top-1/2 transform -translate-y-1/2 text-lg" />
          </div>
          
          {/* Create recipe button */}
          <button
            onClick={() => navigate('/recipe/create')}
            className="whitespace-nowrap px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-2xl transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
            data-aos="fade-left" data-aos-delay="150"
          >
            <FaPlus className="inline-block mr-2" />
            Create Recipe
          </button>
        </div>
        
        {/* Category tabs - Apple-style */}
        <div className="flex items-center space-x-2 mb-8 pb-2 overflow-x-auto no-scrollbar" data-aos="fade-up" data-aos-delay="200">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-6 py-3 rounded-xl text-sm font-medium transition-all ${
              selectedCategory === 'all'
                ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-md'
                : 'bg-white/60 text-gray-700 dark:bg-gray-800/60 dark:text-gray-300 hover:bg-white hover:dark:bg-gray-800'
            }`}
          >
            All Recipes
          </button>
          <button
            onClick={() => setSelectedCategory('easy')}
            className={`px-6 py-3 rounded-xl text-sm font-medium transition-all ${
              selectedCategory === 'easy'
                ? 'bg-green-500 text-white shadow-md'
                : 'bg-white/60 text-gray-700 dark:bg-gray-800/60 dark:text-gray-300 hover:bg-white hover:dark:bg-gray-800'
            }`}
          >
            Easy
          </button>
          <button
            onClick={() => setSelectedCategory('medium')}
            className={`px-6 py-3 rounded-xl text-sm font-medium transition-all ${
              selectedCategory === 'medium'
                ? 'bg-amber-500 text-white shadow-md'
                : 'bg-white/60 text-gray-700 dark:bg-gray-800/60 dark:text-gray-300 hover:bg-white hover:dark:bg-gray-800'
            }`}
          >
            Medium
          </button>
          <button
            onClick={() => setSelectedCategory('hard')}
            className={`px-6 py-3 rounded-xl text-sm font-medium transition-all ${
              selectedCategory === 'hard'
                ? 'bg-red-500 text-white shadow-md'
                : 'bg-white/60 text-gray-700 dark:bg-gray-800/60 dark:text-gray-300 hover:bg-white hover:dark:bg-gray-800'
            }`}
          >
            Hard
          </button>
        </div>
        
        {/* Error state */}
        {error && (
          <div className="mb-10 p-5 bg-red-50/80 dark:bg-red-900/10 backdrop-blur-lg border border-red-100 dark:border-red-800/50 rounded-2xl text-red-700 dark:text-red-300 shadow-sm" data-aos="fade-up">
            <div className="flex items-center">
              <span className="mr-3 text-lg flex-shrink-0">⚠️</span>
              <p>{error}</p>
              <button 
                onClick={fetchMyRecipes} 
                className="ml-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
        
        {/* Recipe count */}
        {!error && filteredRecipes.length > 0 && (
          <div className="mb-6 text-sm font-medium text-gray-500 dark:text-gray-400 ml-1" data-aos="fade-up">
            {filteredRecipes.length} {filteredRecipes.length === 1 ? 'recipe' : 'recipes'}
          </div>
        )}
        
        {/* Empty state - Apple style */}
        {!error && filteredRecipes.length === 0 && (
          <div className="py-16 text-center bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-3xl shadow-sm border border-gray-100/50 dark:border-gray-700/50 mb-12" data-aos="fade-up">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-700 mb-6">
              {searchTerm ? (
                <FaSearch className="text-3xl text-gray-400" />
              ) : (
                <FaUtensils className="text-3xl text-gray-400" />
              )}
            </div>
            <h3 className="text-2xl font-medium text-gray-800 dark:text-white mb-3">
              {searchTerm ? 'No Matching Recipes' : 'No Recipes Yet'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
              {searchTerm 
                ? `No recipes found matching "${searchTerm}"`
                : 'Create your first recipe to start your collection'
              }
            </p>
            {!searchTerm ? (
              <button
                onClick={() => navigate('/recipe/create')}
                className="inline-flex items-center px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <FaPlus className="mr-2" />
                Create Recipe
              </button>
            ) : (
              <button 
                onClick={() => setSearchTerm('')} 
                className="text-blue-500 hover:text-blue-600 font-medium"
              >
                Clear Search
              </button>
            )}
          </div>
        )}
        
        {/* Recipe grid - Apple-style cards */}
        {!error && filteredRecipes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {filteredRecipes.map((recipe, index) => (
              <div
                key={recipe.id}
                data-aos="fade-up"
                data-aos-delay={index * 50}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden border border-gray-100/50 dark:border-gray-700/50 group"
                onClick={() => navigate(`/recipes/${recipe.id}`)}
              >
                {/* Recipe image with subtle overlay */}
                <div className="h-56 w-full relative overflow-hidden">
                  {recipe.imageUrl ? (
                    <img
                      src={addCacheBuster(recipe.imageUrl)}
                      alt={recipe.title || 'Recipe'}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                      loading="lazy"
                      onError={handleImageError}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700">
                      <FaUtensils className="text-4xl text-gray-300 dark:text-gray-600" />
                    </div>
                  )}
                  
                  {/* Subtle gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Difficulty pill */}
                  <div className="absolute top-4 left-4">
                    <span className={`inline-block px-4 py-1.5 text-xs font-medium bg-white/70 dark:bg-gray-900/70 backdrop-blur-md rounded-full ${
                      recipe.difficulty === 'EASY' ? 'text-green-600 dark:text-green-400' :
                      recipe.difficulty === 'MEDIUM' ? 'text-amber-600 dark:text-amber-400' :
                      'text-red-600 dark:text-red-400'
                    }`}>
                      {getDifficultyLabel(recipe.difficulty)}
                    </span>
                  </div>
                  
                  {/* Time information */}
                  {(recipe.prepTimeMinutes || recipe.totalTimeMinutes) && (
                    <div className="absolute top-4 right-4">
                      <span className="inline-block px-4 py-1.5 text-xs font-medium bg-white/70 dark:bg-gray-900/70 backdrop-blur-md rounded-full text-gray-700 dark:text-gray-300">
                        <FaClock className="inline-block mr-1" />
                        {formatCookingTime(recipe.prepTimeMinutes || recipe.totalTimeMinutes)}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Recipe content */}
                <div className="p-6">
                  <h2 className="font-semibold text-xl text-gray-800 dark:text-white mb-3 tracking-tight">
                    {recipe.title}
                  </h2>
                  
                  {recipe.description && (
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-5 line-clamp-2">
                      {recipe.description}
                    </p>
                  )}
                  
                  {/* Action buttons */}
                  <div className="flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-gray-700/50">
                    <div className="flex items-center space-x-3 text-gray-600 dark:text-gray-300">
                      <div className="flex items-center">
                        <FaArrowUp className="mr-1 text-green-500" />
                        <span>{recipe.upvotes || 0}</span>
                      </div>
                      <div className="flex items-center">
                        <FaComment className="mr-1 text-blue-500" />
                        <span>{recipe.commentCount || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Quick actions that appear on hover */}
                <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/recipes/${recipe.id}`);
                    }}
                    className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md p-2.5 rounded-full text-blue-500 hover:text-blue-600 dark:text-blue-400 hover:bg-white dark:hover:bg-gray-900 transition-colors shadow-sm"
                    aria-label={`View ${recipe.title} recipe`}
                  >
                    <FaEye />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/recipe/create/${recipe.id}`);
                    }}
                    className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md p-2.5 rounded-full text-green-500 hover:text-green-600 dark:text-green-400 hover:bg-white dark:hover:bg-gray-900 transition-colors shadow-sm"
                    aria-label={`Edit ${recipe.title} recipe`}
                  >
                    <FaEdit />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserRecipes; 