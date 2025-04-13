import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axiosConfig';
import { recipeServiceAxios } from '../../api/axiosConfig';
import { useAuth } from '../../context';
import { LoadingSpinner } from '../../components/common';
import { 
  FaPlus, FaSearch, FaEdit, FaEye, FaTrash, 
  FaThumbsUp, FaComment, FaExclamationCircle,
  FaClock, FaChevronRight
} from 'react-icons/fa';
import AOS from 'aos';
import 'aos/dist/aos.css';

// Recipe interface with essential properties
interface Recipe {
  id: string;
  title: string;
  imageUrl?: string;
  ingredients: string[];
  createdById?: string;
  upvotes?: number;
  commentCount?: number;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  totalTimeMinutes?: number;
}

const MyRecipes: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  // State variables
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingRecipeId, setDeletingRecipeId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Initialize AOS animations
  useEffect(() => {
    AOS.init({
      duration: 800,
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
  const fetchMyRecipes = useCallback(async () => {
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }
    
    setLoading(true);
    try {
      const response = await recipeServiceAxios.get('/v1/recipes/my-recipes');
      setRecipes(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching my recipes:', err);
      setError('Failed to load your recipes. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, navigate]);
  
  useEffect(() => {
    fetchMyRecipes();
  }, [fetchMyRecipes]);
  
  // Handle recipe deletion
  const handleDeleteRecipe = async (recipeId: string) => {
    if (window.confirm('Are you sure you want to delete this recipe? This action cannot be undone.')) {
      setDeletingRecipeId(recipeId);
      try {
        await axios.delete(`/v1/recipes/${recipeId}`);
        setRecipes(recipes.filter(recipe => recipe.id !== recipeId));
      } catch (err) {
        console.error('Error deleting recipe:', err);
        setError('Failed to delete recipe. Please try again later.');
      } finally {
        setDeletingRecipeId(null);
      }
    }
  };
  
  // Navigation handlers
  const goToRecipeDetail = useCallback((recipeId: string) => {
    navigate(`/recipe/${recipeId}`);
  }, [navigate]);
  
  const goToEditRecipe = useCallback((recipeId: string) => {
    navigate(`/recipe/create/${recipeId}`);
  }, [navigate]);
  
  // Filter recipes based on search term and category
  const filteredRecipes = useMemo(() => 
    recipes.filter(recipe => {
      const matchesSearch = 
        !searchTerm || 
        recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.ingredients.some(i => i.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || 
        (selectedCategory === 'easy' && recipe.difficulty === 'EASY') ||
        (selectedCategory === 'medium' && recipe.difficulty === 'MEDIUM') ||
        (selectedCategory === 'hard' && recipe.difficulty === 'HARD');
      
      return matchesSearch && matchesCategory;
    }),
    [recipes, searchTerm, selectedCategory]
  );
  
  // Get difficulty label
  const getDifficultyLabel = useCallback((difficulty?: string) => {
    switch (difficulty) {
      case 'EASY': return 'Easy';
      case 'MEDIUM': return 'Medium';
      case 'HARD': return 'Hard';
      default: return 'Medium';
    }
  }, []);
  
  // Format cooking time
  const formatCookingTime = useCallback((minutes?: number) => {
    if (!minutes) return 'N/A';
    if (minutes < 60) return `${minutes} min`;
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
  }, []);
  
  return (
    <div className="max-w-7xl mx-auto px-6 py-12 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Page header - Apple-style with large title */}
      <div className="mb-12 text-center">
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight" 
            data-aos="fade-down">
          My Recipes
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-xl max-w-2xl mx-auto"
           data-aos="fade-up" data-aos-delay="100">
          Your personal collection of culinary creations
        </p>
      </div>
      
      {/* Action bar with search and new recipe button - Apple-style with clean layout */}
      <div className="flex flex-col md:flex-row items-center gap-6 mb-12" data-aos="fade-up" data-aos-delay="200">
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
        
        {/* Create recipe button - Apple-style with subtle gradient */}
        <button
          onClick={() => navigate('/recipe/create')}
          className="whitespace-nowrap px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium rounded-2xl transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
          data-aos="fade-left" data-aos-delay="300"
        >
          <FaPlus className="inline-block mr-2" />
          Create Recipe
        </button>
      </div>
      
      {/* Category tabs - Apple-style horizontal scroll */}
      <div className="flex items-center space-x-2 mb-8 pb-2 overflow-x-auto no-scrollbar" data-aos="fade-up" data-aos-delay="400">
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
      
      {/* Error message - Apple-style notification */}
      {error && (
        <div className="mb-10 p-5 bg-red-50/80 dark:bg-red-900/10 backdrop-blur-lg border border-red-100 dark:border-red-800/50 rounded-2xl text-red-700 dark:text-red-300 shadow-sm"
             data-aos="fade-up">
          <div className="flex items-center">
            <FaExclamationCircle className="text-red-500 mr-3 text-lg flex-shrink-0" />
            <span>{error}</span>
          </div>
        </div>
      )}
      
      {/* Loading spinner */}
      {loading ? (
        <div className="py-16 flex justify-center">
          <LoadingSpinner size="large" />
        </div>
      ) : (
        <>
          {/* Recipe count - Apple-style subtle label */}
          <div className="mb-6 text-sm font-medium text-gray-500 dark:text-gray-400 ml-1" data-aos="fade-up">
            {filteredRecipes.length} {filteredRecipes.length === 1 ? 'recipe' : 'recipes'}
          </div>
          
          {/* Recipes grid - Apple-style cards */}
          {filteredRecipes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {filteredRecipes.map((recipe, index) => (
                <div
                  key={recipe.id}
                  data-aos="fade-up"
                  data-aos-delay={index * 50}
                  className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden border border-gray-100/50 dark:border-gray-700/50 group"
                  onClick={() => goToRecipeDetail(recipe.id)}
                >
                  {/* Recipe image with modern hover effect */}
                  <div className="h-56 w-full relative overflow-hidden">
                    {recipe.imageUrl ? (
                      <img
                        src={recipe.imageUrl}
                        alt={recipe.title}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700">
                        <span className="text-gray-400 dark:text-gray-500">No image</span>
                      </div>
                    )}
                    
                    {/* Frosted difficulty pill */}
                    <div className="absolute top-4 left-4">
                      <span className={`inline-block px-4 py-1.5 text-xs font-medium bg-white/70 dark:bg-gray-900/70 backdrop-blur-md rounded-full ${
                        recipe.difficulty === 'EASY' ? 'text-green-600 dark:text-green-400' :
                        recipe.difficulty === 'MEDIUM' ? 'text-amber-600 dark:text-amber-400' :
                        'text-red-600 dark:text-red-400'
                      }`}>
                        {getDifficultyLabel(recipe.difficulty)}
                      </span>
                    </div>
                    
                    {/* Action buttons - minimalistic floating controls */}
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          goToEditRecipe(recipe.id);
                        }}
                        className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md p-2.5 rounded-full text-blue-500 hover:text-blue-600 dark:text-blue-400 hover:bg-white dark:hover:bg-gray-900 transition-colors shadow-sm"
                        aria-label="Edit recipe"
                      >
                        <FaEdit />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteRecipe(recipe.id);
                        }}
                        className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md p-2.5 rounded-full text-red-500 hover:text-red-600 dark:text-red-400 hover:bg-white dark:hover:bg-gray-900 transition-colors shadow-sm"
                        aria-label="Delete recipe"
                        disabled={deletingRecipeId === recipe.id}
                      >
                        {deletingRecipeId === recipe.id ? (
                          <LoadingSpinner size="small" />
                        ) : (
                          <FaTrash />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  {/* Recipe content with clean typography */}
                  <div className="p-6 flex-grow flex flex-col">
                    <h2 className="font-semibold text-xl text-gray-800 dark:text-white mb-3 tracking-tight">
                      {recipe.title}
                    </h2>
                    
                    {/* Stats row - Minimalist Apple-style stats */}
                    <div className="mt-auto">
                      <div className="flex items-center justify-between text-sm pt-4 border-t border-gray-100 dark:border-gray-700/50">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center text-gray-600 dark:text-gray-300">
                            <FaThumbsUp className="mr-1.5 text-green-500" />
                            <span>{recipe.upvotes || 0}</span>
                          </div>
                          <div className="flex items-center text-gray-600 dark:text-gray-300">
                            <FaComment className="mr-1.5 text-blue-500" />
                            <span>{recipe.commentCount || 0}</span>
                          </div>
                        </div>
                        <div className="flex items-center text-gray-600 dark:text-gray-300">
                          <FaClock className="mr-1.5 text-indigo-500" />
                          <span className="font-medium">{formatCookingTime(recipe.totalTimeMinutes)}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Apple-style view indicator */}
                    <div className="mt-4 text-right">
                      <span className="text-blue-500 dark:text-blue-400 text-sm font-medium flex items-center justify-end">
                        View Recipe <FaChevronRight className="ml-1 text-xs" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center bg-white/60 dark:bg-gray-800/60 backdrop-blur-lg rounded-3xl shadow-sm border border-gray-100/50 dark:border-gray-700/50" data-aos="fade-up">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-700 mb-6">
                <FaSearch className="text-3xl text-gray-400" />
              </div>
              <h3 className="text-2xl font-medium text-gray-800 dark:text-white mb-3">No recipes found</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
                {searchTerm ? 'Try a different search term or category' : 'Create your first recipe to get started with your culinary journey'}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => navigate('/recipe/create')}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium rounded-xl transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <FaPlus className="mr-2" />
                  Create Recipe
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyRecipes; 