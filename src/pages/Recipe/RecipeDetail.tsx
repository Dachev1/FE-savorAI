import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import axios from '../../api/axiosConfig';
import { useAuth } from '../../context';
import { LoadingSpinner } from '../../components/common';
import { 
  FaRobot, FaClock, FaUtensils, FaArrowLeft, FaHeart, FaStar, 
  FaFireAlt, FaDumbbell, FaCarrot, FaOilCan, FaShare, FaBookmark,
  FaEdit, FaTrash, FaPrint, FaCheck, FaChevronLeft, FaChartLine
} from 'react-icons/fa';
import RecipeComments from '../../components/recipe/RecipeComments';
import { motion, AnimatePresence } from 'framer-motion';

interface Recipe {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  ingredients: string[];
  instructions: string[];
  prepTime: number;
  cookTime: number;
  servings: number;
  authorId: string;
  authorName: string;
  macros: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  isAiGenerated?: boolean;
  servingSuggestions?: string;
  difficulty?: string;
  isFavorite?: boolean;
  tags: string[];
  createdAt: string;
  totalTimeMinutes?: number;
}

// Get difficulty color based on level - memoized for performance
const getDifficultyColor = (difficulty: string = 'MEDIUM'): string => {
  switch(difficulty.toUpperCase()) {
    case 'EASY': return 'bg-green-500/90';
    case 'MEDIUM': return 'bg-amber-500/90';
    case 'HARD': return 'bg-red-500/90';
    default: return 'bg-blue-500/90';
  }
};

// Format difficulty text to be user-friendly
const formatDifficulty = (difficulty: string = 'MEDIUM'): string => {
  return difficulty.charAt(0) + difficulty.slice(1).toLowerCase();
};

// Check if recipe has nutrition info
const hasNutritionInfo = (recipe: Recipe) => 
  recipe.macros && (
    recipe.macros.calories > 0 || 
    recipe.macros.protein > 0 || 
    recipe.macros.carbs > 0 || 
    recipe.macros.fat > 0
  );

const RecipeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>('ingredients');
  const [checkedSteps, setCheckedSteps] = useState<number[]>([]);
  
  // Track scroll position
  const [scrollPosition, setScrollPosition] = useState(0);
  const headerRef = useRef<HTMLDivElement>(null);
  
  // Check if we're coming from favorites page
  const isFromFavorites = location.state?.fromFavorites || location.pathname.includes('favorites');

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Memoized fetch recipe function to prevent unnecessary re-renders
  const fetchRecipe = useCallback(async () => {
    if (!id) {
      setError('No recipe ID provided.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Use different endpoint for favorites view
      const endpoint = isFromFavorites 
        ? `/api/v1/favorites/recipes/${id}` 
        : `/api/v1/recipes/${id}`;
        
      const response = await axios.get(endpoint);
      
      // Normalize recipe data to handle missing properties
      const normalizedRecipe = {
        ...response.data,
        tags: response.data.tags || [],
        description: response.data.description || response.data.servingSuggestions || '',
        servingSuggestions: response.data.servingSuggestions || '',
        authorName: response.data.authorName || 'Unknown',
        prepTime: response.data.prepTime || (response.data.totalTimeMinutes ? Math.floor(response.data.totalTimeMinutes / 2) : 0),
        cookTime: response.data.cookTime || (response.data.totalTimeMinutes ? Math.floor(response.data.totalTimeMinutes / 2) : 0),
        servings: response.data.servings || 1,
        isAiGenerated: response.data.isAiGenerated || false,
        isFavorite: isFromFavorites ? true : (response.data.isFavorite || false),
        totalTimeMinutes: response.data.totalTimeMinutes || ((response.data.prepTime || 0) + (response.data.cookTime || 0)),
        difficulty: response.data.difficulty || 'MEDIUM',
        instructions: Array.isArray(response.data.instructions) 
          ? response.data.instructions 
          : typeof response.data.instructions === 'string'
            ? response.data.instructions.split('\n').filter((line: string) => line.trim())
            : [],
        macros: {
          calories: response.data.macros?.calories || 0,
          protein: response.data.macros?.protein || response.data.macros?.proteinGrams || 0,
          carbs: response.data.macros?.carbs || response.data.macros?.carbsGrams || 0,
          fat: response.data.macros?.fat || response.data.macros?.fatGrams || 0
        }
      };
      
      setRecipe(normalizedRecipe);
      setError(null);
    } catch (err: unknown) {
      console.error('Error fetching recipe:', err);
      
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { status: number } };
        if (axiosErr.response?.status === 404) {
          setError(`Recipe not found. It may have been deleted.`);
        } else if (axiosErr.response?.status === 403) {
          setError('You do not have permission to view this recipe.');
        } else {
          setError('Failed to load recipe details. Please try again later.');
        }
      } else {
        setError('Failed to load recipe details. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  }, [id, isFromFavorites]);

  useEffect(() => {
    fetchRecipe();
  }, [fetchRecipe]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this recipe?')) {
      return;
    }

    try {
      await axios.delete(`/api/v1/recipes/${id}`);
      navigate('/');
    } catch (err) {
      console.error('Error deleting recipe:', err);
      alert('Failed to delete recipe. Please try again.');
    }
  };

  // Toggle step completion
  const toggleStepCompletion = (idx: number) => {
    if (checkedSteps.includes(idx)) {
      setCheckedSteps(checkedSteps.filter(step => step !== idx));
    } else {
      setCheckedSteps([...checkedSteps, idx]);
    }
  };

  // Handle print functionality
  const handlePrint = () => {
    window.print();
  };

  // Determine if user is the author
  const isAuthor = useMemo(() => 
    user && recipe && user.id === recipe.authorId, 
    [user, recipe]
  );

  // Calculate total time
  const totalTime = useMemo(() => 
    recipe ? (recipe.totalTimeMinutes || ((recipe.prepTime || 0) + (recipe.cookTime || 0))) : 0,
    [recipe]
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="large" className="text-blue-500" />
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center items-center px-4 py-16">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center bg-red-100 dark:bg-red-900/20 text-red-500 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">Recipe Not Found</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8 text-center">{error || "We couldn't find the recipe you're looking for."}</p>
          <Link
            to={isFromFavorites ? "/favorites" : "/"}
            className="block w-full text-center px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl transition-colors duration-300"
          >
            <FaArrowLeft className="inline-block mr-2" />
            {isFromFavorites ? "Back to Favorites" : "Return Home"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen print:bg-white print:dark:bg-white">
      {/* Floating header that appears on scroll */}
      <motion.header 
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 shadow-sm"
        initial={{ opacity: 0, y: -20 }}
        animate={{ 
          opacity: scrollPosition > 250 ? 1 : 0,
          y: scrollPosition > 250 ? 0 : -20
        }}
        transition={{ duration: 0.3 }}
      >
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <button 
              onClick={() => navigate(-1)}
              className="mr-3 p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Go back"
            >
              <FaChevronLeft />
            </button>
            <h3 className="font-medium text-gray-900 dark:text-white truncate max-w-xs">
              {recipe.title}
            </h3>
          </div>
          {isAuthor && (
            <button
              onClick={() => navigate(`/recipe/create/${recipe.id}`)}
              className="p-2 text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Edit recipe"
            >
              <FaEdit />
            </button>
          )}
        </div>
      </motion.header>

      {/* Hero section */}
      <section ref={headerRef} className="relative w-full h-[60vh] print:h-40">
        {recipe.imageUrl ? (
          <>
            <img 
              src={recipe.imageUrl} 
              alt={recipe.title} 
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-500 to-indigo-600"></div>
        )}
        
        {/* Navigation button */}
        <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center print:hidden">
          <button 
            onClick={() => navigate(-1)} 
            className="w-10 h-10 flex items-center justify-center bg-white/20 backdrop-blur-xl rounded-full text-white hover:bg-white/40 transition-all duration-300"
            aria-label="Go back"
          >
            <FaChevronLeft aria-hidden="true" />
          </button>
          
          {isAuthor && (
            <button
              onClick={() => navigate(`/recipe/create/${recipe.id}`)}
              className="w-10 h-10 flex items-center justify-center bg-white/20 backdrop-blur-xl rounded-full text-white hover:bg-white/40 transition-all duration-300"
              aria-label="Edit recipe"
            >
              <FaEdit aria-hidden="true" />
            </button>
          )}
        </div>
      </section>
      
      {/* Main content */}
      <div className="relative -mt-24 bg-white dark:bg-gray-800 rounded-t-3xl shadow-lg print:shadow-none print:mt-0 print:rounded-none">
        <div className="max-w-3xl mx-auto px-6 py-12 print:py-4">
          {/* Recipe title */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight">
            {recipe.title}
          </h1>

          {/* Recipe author */}
          <div className="flex items-center mb-6">
            <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold text-sm mr-3">
              {recipe.authorId ? recipe.authorId.substring(0, 2).toUpperCase() : 'ID'}
            </div>
            <div className="flex flex-col">
              <span className="text-gray-700 dark:text-gray-300">
                Created by <span className="font-medium">{recipe.authorName}</span>
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                ID: {recipe.authorId || 'Unknown'}
              </span>
            </div>
          </div>
          
          {/* Recipe metadata */}
          <div className="flex flex-wrap items-center gap-3 mb-10 print:mb-2">
            {recipe.isAiGenerated && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium">
                <FaRobot size={12} aria-hidden="true" />
                <span>AI Generated</span>
              </span>
            )}
            
            {totalTime > 0 && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                <FaClock size={12} aria-hidden="true" />
                <span>{totalTime} min</span>
              </span>
            )}
            
            <span className={`flex items-center gap-1.5 px-3 py-1.5 ${getDifficultyColor(recipe.difficulty)} text-white rounded-full text-sm font-medium`}>
              <FaUtensils size={12} aria-hidden="true" />
              <span>{formatDifficulty(recipe.difficulty)}</span>
            </span>
            
            {recipe.tags && recipe.tags.length > 0 && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium">
                <FaStar size={12} aria-hidden="true" />
                <span>{recipe.tags[0]}</span>
              </span>
            )}
          </div>
          
          {/* Recipe description */}
          {recipe.description && (
            <div className="mb-10 print:mb-6">
              <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                {recipe.description}
              </p>
            </div>
          )}
          
          {/* Nutrition info */}
          {hasNutritionInfo(recipe) && (
            <div className="mb-10 print:mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Nutrition Information
              </h2>
              <div className="grid grid-cols-4 gap-4">
                <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white dark:bg-gray-700 shadow-sm">
                  <FaFireAlt className="text-red-500 mb-2" aria-hidden="true" />
                  <span className="font-bold text-xl text-gray-900 dark:text-white">{recipe.macros.calories}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">calories</span>
                </div>
                
                <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white dark:bg-gray-700 shadow-sm">
                  <FaDumbbell className="text-blue-500 mb-2" aria-hidden="true" />
                  <span className="font-bold text-xl text-gray-900 dark:text-white">{recipe.macros.protein}g</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">protein</span>
                </div>
                
                <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white dark:bg-gray-700 shadow-sm">
                  <FaCarrot className="text-orange-500 mb-2" aria-hidden="true" />
                  <span className="font-bold text-xl text-gray-900 dark:text-white">{recipe.macros.carbs}g</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">carbs</span>
                </div>
                
                <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white dark:bg-gray-700 shadow-sm">
                  <FaOilCan className="text-green-500 mb-2" aria-hidden="true" />
                  <span className="font-bold text-xl text-gray-900 dark:text-white">{recipe.macros.fat}g</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">fat</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Recipe content tabs */}
          <div className="mb-6 border-b border-gray-200 dark:border-gray-700 print:hidden">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveSection('ingredients')}
                className={`pb-4 font-medium transition-colors ${
                  activeSection === 'ingredients'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
                }`}
              >
                Ingredients
              </button>
              <button
                onClick={() => setActiveSection('instructions')}
                className={`pb-4 font-medium transition-colors ${
                  activeSection === 'instructions'
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
                }`}
              >
                Instructions
              </button>
            </div>
          </div>
          
          {/* Print view: show both sections */}
          <div className="hidden print:block print:mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Ingredients</h2>
            <ul className="space-y-2">
              {recipe.ingredients.map((ingredient, idx) => (
                <li key={idx} className="text-gray-700 flex items-start">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 mr-3 flex-shrink-0"></span>
                  <span>{ingredient}</span>
                </li>
              ))}
            </ul>
            
            <h2 className="text-xl font-semibold text-gray-900 mb-4 mt-8">Instructions</h2>
            <ol className="space-y-6">
              {recipe.instructions.map((instruction, idx) => (
                <li key={idx} className="flex">
                  <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold mr-4">
                    {idx + 1}
                  </span>
                  <div className="text-gray-700">{instruction}</div>
                </li>
              ))}
            </ol>
          </div>
          
          {/* Ingredients section */}
          <div className={`${activeSection === 'ingredients' ? 'block' : 'hidden'} print:hidden`}>            
            <div className="flex justify-between items-center mt-4 mb-3">
              <h2 className="text-2xl font-semibold">Ingredients</h2>
            </div>
            
            <ul className="space-y-2 mt-6">
              {recipe.ingredients.map((ingredient, idx) => (
                <motion.li 
                  key={idx} 
                  className="text-gray-700 dark:text-gray-300 flex items-start py-3 px-4 bg-white dark:bg-gray-700/30 rounded-xl mb-2 shadow-sm"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.03 }}
                >
                  <span className="inline-block w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400 mt-2 mr-3 flex-shrink-0"></span>
                  <span>{ingredient}</span>
                </motion.li>
              ))}
            </ul>
          </div>
          
          {/* Instructions section */}
          <div className={`${activeSection === 'instructions' ? 'block' : 'hidden'} print:hidden`}>
            <ol className="space-y-4">
              {recipe.instructions.map((instruction, idx) => (
                <motion.li 
                  key={idx} 
                  className={`flex p-4 rounded-xl ${
                    checkedSteps.includes(idx)
                      ? 'bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-800/30'
                      : 'bg-white dark:bg-gray-700/30 shadow-sm'
                  }`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                >
                  <button 
                    onClick={() => toggleStepCompletion(idx)}
                    className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full mr-4 ${
                      checkedSteps.includes(idx)
                        ? 'bg-green-100 dark:bg-green-800/50 text-green-700 dark:text-green-300'
                        : 'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {checkedSteps.includes(idx) ? <FaCheck size={12} /> : idx + 1}
                  </button>
                  <div className={`text-gray-700 dark:text-gray-300 ${
                    checkedSteps.includes(idx) ? 'line-through text-gray-500 dark:text-gray-500' : ''
                  }`}>{instruction}</div>
                </motion.li>
              ))}
            </ol>
          </div>
          
          {/* Serving suggestions */}
          {recipe.servingSuggestions && (
            <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800/50 print:bg-blue-50 print:border print:border-blue-100">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-blue-300 mb-3 flex items-center">
                <FaBookmark className="text-blue-500 mr-2" />
                Chef's Tip
              </h2>
              <p className="text-gray-700 dark:text-gray-300">
                {recipe.servingSuggestions}
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Comments section - only show on desktop and not in print view */}
      <div className="bg-gray-50 dark:bg-gray-900 py-12 px-6 print:hidden">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
            Comments
          </h2>
          <RecipeComments recipeId={recipe.id} isRecipeOwner={isAuthor || false} />
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail; 