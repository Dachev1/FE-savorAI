import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from '../../api/axiosConfig';
import { recipeServiceAxios } from '../../api/axiosConfig';
import { useAuth } from '../../context';
import { LoadingSpinner } from '../../components/common';
import { FaRobot, FaClock, FaArrowLeft, FaFireAlt, FaDumbbell, FaCarrot, FaOilCan } from 'react-icons/fa';
import AOS from 'aos';
import 'aos/dist/aos.css';

// Maintain consistent Recipe interface with RecipeDetail
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
  tags: string[];
  createdAt: string;
  totalTimeMinutes?: number;
}

// Get difficulty color for consistent styling
const getDifficultyColor = (difficulty: string = 'MEDIUM'): string => {
  switch(difficulty.toUpperCase()) {
    case 'EASY': return 'bg-green-500/80';
    case 'MEDIUM': return 'bg-yellow-500/80';
    case 'HARD': return 'bg-red-500/80';
    default: return 'bg-blue-500/80';
  }
};

// Format difficulty text to be user-friendly
const formatDifficulty = (difficulty: string = 'MEDIUM'): string => {
  return difficulty.charAt(0) + difficulty.slice(1).toLowerCase();
};

// Check if recipe has nutrition info
const hasNutritionInfo = (recipe: Recipe): boolean => 
  recipe.macros && Object.values(recipe.macros).some(value => value > 0);

const RecipePreview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveClicked, setSaveClicked] = useState(false);
  
  // Initialize animations only once
  useEffect(() => {
    AOS.init({
      once: true,
      duration: 800,
      easing: 'ease-in-out'
    });
  }, []);

  useEffect(() => {
    const fetchRecipe = async () => {
      if (!id) {
        setError('No recipe ID provided.');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const response = await recipeServiceAxios.get(`/api/v1/recipes/${id}`);
        
        // Normalize recipe data to handle missing properties
        const normalizedRecipe = {
          ...response.data,
          tags: response.data.tags || [],
          description: response.data.description || response.data.servingSuggestions || '',
          servingSuggestions: response.data.servingSuggestions || '',
          authorName: response.data.authorName || 'Unknown',
          prepTime: response.data.prepTime || (response.data.totalTimeMinutes ? Math.floor(response.data.totalTimeMinutes / 2) : 15),
          cookTime: response.data.cookTime || (response.data.totalTimeMinutes ? Math.floor(response.data.totalTimeMinutes / 2) : 15),
          servings: response.data.servings || 1,
          isAiGenerated: response.data.isAiGenerated || false,
          totalTimeMinutes: response.data.totalTimeMinutes || (response.data.prepTime || 0) + (response.data.cookTime || 0),
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
            setError(`Recipe with ID ${id} not found. It may have been deleted.`);
          } else if (axiosErr.response?.status === 403) {
            setError('You do not have permission to view this recipe.');
          } else if (axiosErr.response?.status) {
            setError(`Failed to load recipe (Error ${axiosErr.response.status}). Please try again later.`);
          } else {
            setError('Failed to load recipe details. Please try again later.');
          }
        } else {
          setError('Failed to load recipe details. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id]);

  const handleSaveRecipe = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent event bubbling
    
    if (!user) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    
    try {
      setSaveClicked(true);
      await recipeServiceAxios.post(`/api/v1/favorites/recipes/${id}`);
      
      // Navigate to recipe detail on successful save
      navigate(`/recipes/${id}`);
    } catch (err) {
      console.error('Error saving recipe:', err);
      setSaveClicked(false);
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { status: number, data?: { message?: string } } };
        if (axiosErr.response?.status === 403) {
          alert('You need to be logged in to save recipes.');
        } else if (axiosErr.response?.data?.message) {
          alert(`Failed to save recipe: ${axiosErr.response.data.message}`);
        } else {
          alert('Failed to save recipe. Please try again.');
        }
      } else {
        alert('Failed to save recipe. Please try again.');
      }
    }
  };

  // Use memoization to extract recipe elements to prevent unnecessary recalculations
  const recipeDetails = useMemo(() => {
    if (!recipe) return null;
    
    const ingredients = recipe.ingredients || [];
    const instructions = recipe.instructions || [];
    const totalTime = recipe.totalTimeMinutes || ((recipe.prepTime || 0) + (recipe.cookTime || 0));
    
    return { ingredients, instructions, totalTime };
  }, [recipe]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error || !recipe || !recipeDetails) {
    return (
      <div className="min-h-[50vh] flex flex-col justify-center items-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-6">{error || 'Recipe not found'}</p>
        <Link
          to="/"
          className="px-6 py-2 bg-accent hover:bg-blue-600 text-white rounded-lg transition-colors duration-300"
        >
          Return Home
        </Link>
      </div>
    );
  }

  const { ingredients, instructions, totalTime } = recipeDetails;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-gray-50 dark:from-purple-950 dark:to-gray-900 pb-16">
      {/* Hero header */}
      <div className="relative h-[50vh] w-full">
        {recipe.imageUrl ? (
          <>
            <img 
              src={recipe.imageUrl} 
              alt={recipe.title} 
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null; // Prevent infinite loop
                target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-purple-900/70 via-purple-900/40 to-transparent"></div>
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-purple-500 to-indigo-600"></div>
        )}
        
        <Link 
          to="/" 
          className="absolute top-4 left-4 z-10 flex items-center gap-2 px-4 py-2 bg-black/30 backdrop-blur-sm rounded-full text-white hover:bg-black/50 transition"
          aria-label="Back to home"
        >
          <FaArrowLeft aria-hidden="true" /> Back to Home
        </Link>
        
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div className="container mx-auto max-w-5xl">
            <h1 data-aos="fade-up" className="text-4xl md:text-5xl font-bold mb-3 drop-shadow-lg">
              {recipe.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4" data-aos="fade-up" data-aos-delay="100">
              {recipe.isAiGenerated && (
                <span className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/80 backdrop-blur-sm rounded-full text-white">
                  <FaRobot aria-hidden="true" />
                  <span>AI Generated</span>
                </span>
              )}
              
              <span className="flex items-center gap-2 px-3 py-1.5 bg-black/30 backdrop-blur-sm rounded-full text-white">
                <FaClock aria-hidden="true" />
                <span>{totalTime} min</span>
              </span>
              
              {recipe.difficulty && (
                <span className={`flex items-center gap-2 px-3 py-1.5 ${getDifficultyColor(recipe.difficulty)} backdrop-blur-sm rounded-full text-white`}>
                  <span>{formatDifficulty(recipe.difficulty)}</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <main className="container mx-auto max-w-5xl px-4 -mt-16">
        <article 
          className="bg-white/95 dark:bg-gray-800/95 shadow-2xl ring-1 ring-purple-100 dark:ring-purple-900 rounded-2xl overflow-hidden"
          role="article"
          aria-label={`Preview of recipe: ${recipe.title}`}
        >
          <div className="p-8">
            {recipe.description && (
              <div className="mb-10" data-aos="fade-up">
                <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed">
                  {recipe.description}
                </p>
              </div>
            )}
            
            {/* Nutrition section */}
            {hasNutritionInfo(recipe) && (
              <div 
                className="mb-12 p-8 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-xl"
                data-aos="fade-up"
              >
                <h2 className="text-3xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-purple-600 dark:from-violet-400 dark:to-purple-400">
                  Nutrition Information
                </h2>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center transform hover:scale-105 transition-all duration-300 border border-purple-100 dark:border-purple-800">
                    <div className="flex justify-center mb-3">
                      <FaFireAlt className="text-3xl text-rose-500" aria-hidden="true" />
                    </div>
                    <p className="text-lg uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1 font-medium">Calories</p>
                    <p className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-500 to-pink-500">
                      {recipe.macros.calories}
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center transform hover:scale-105 transition-all duration-300 border border-purple-100 dark:border-purple-800">
                    <div className="flex justify-center mb-3">
                      <FaDumbbell className="text-3xl text-blue-500" aria-hidden="true" />
                    </div>
                    <p className="text-lg uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1 font-medium">Protein</p>
                    <p className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-500">
                      {recipe.macros.protein}g
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center transform hover:scale-105 transition-all duration-300 border border-purple-100 dark:border-purple-800">
                    <div className="flex justify-center mb-3">
                      <FaCarrot className="text-3xl text-amber-500" aria-hidden="true" />
                    </div>
                    <p className="text-lg uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1 font-medium">Carbs</p>
                    <p className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-yellow-500">
                      {recipe.macros.carbs}g
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center transform hover:scale-105 transition-all duration-300 border border-purple-100 dark:border-purple-800">
                    <div className="flex justify-center mb-3">
                      <FaOilCan className="text-3xl text-green-500" aria-hidden="true" />
                    </div>
                    <p className="text-lg uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1 font-medium">Fat</p>
                    <p className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-emerald-500">
                      {recipe.macros.fat}g
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="md:flex gap-8 mb-12">
              {/* Ingredients */}
              <section 
                className="md:w-1/2 mb-8 md:mb-0"
                data-aos="fade-right" 
                data-aos-delay="100"
              >
                <h2 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 border-b-2 border-indigo-100 dark:border-indigo-800 pb-2">
                  Ingredients
                </h2>
                
                {ingredients.length > 0 ? (
                  <ul className="space-y-3">
                    {ingredients.map((ingredient, index) => (
                      <li 
                        key={index} 
                        className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors border border-transparent hover:border-purple-200 dark:hover:border-purple-800"
                      >
                        <div className="h-8 w-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0 shadow-md">
                          <span className="text-white font-medium">{index + 1}</span>
                        </div>
                        <span className="text-gray-700 dark:text-gray-200">{ingredient}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 italic">No ingredients listed for this recipe.</p>
                )}
              </section>
              
              {/* Instructions Preview */}
              <section 
                className="md:w-1/2"
                data-aos="fade-left" 
                data-aos-delay="200"
              >
                <h2 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 border-b-2 border-blue-100 dark:border-blue-800 pb-2">
                  Instructions Preview
                </h2>
                
                {instructions.length > 0 ? (
                  <ol className="space-y-6">
                    {instructions.slice(0, 3).map((step, index) => (
                      <li 
                        key={index} 
                        className="relative pl-14 group"
                      >
                        <div className="absolute left-0 top-0 h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg transform transition-transform duration-300 group-hover:scale-110">
                          {index + 1}
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border-l-4 border-blue-500 transform transition-all duration-300 group-hover:shadow-lg group-hover:border-l-6">
                          <p className="text-gray-700 dark:text-gray-200 line-clamp-2">
                            {step}
                          </p>
                        </div>
                      </li>
                    ))}
                    
                    {instructions.length > 3 && (
                      <div className="text-center pt-4 opacity-80">
                        <p className="text-gray-600 dark:text-gray-400 font-medium">
                          +{instructions.length - 3} more steps
                        </p>
                      </div>
                    )}
                  </ol>
                ) : (
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
                    <p className="text-gray-500 italic">
                      No instructions available for this recipe.
                    </p>
                  </div>
                )}
              </section>
            </div>
            
            {/* Save and View buttons */}
            <div 
              className="mt-12 flex flex-col sm:flex-row gap-4 justify-center"
              data-aos="fade-up" 
              data-aos-delay="300"
            >
              <button
                onClick={handleSaveRecipe}
                disabled={saveClicked}
                className="px-8 py-3 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white rounded-xl font-medium text-lg shadow-lg transform hover:scale-105 transition-all duration-300 flex-1 sm:flex-initial disabled:opacity-70 disabled:cursor-not-allowed"
                aria-label="Save this recipe"
              >
                Save this Recipe
              </button>
              
              <Link
                to={`/recipes/${recipe.id}`}
                className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-medium text-lg shadow-lg transform hover:scale-105 transition-all duration-300 flex-1 sm:flex-initial text-center"
                aria-label="View full recipe"
              >
                View Full Recipe
              </Link>
            </div>
          </div>
        </article>
      </main>
    </div>
  );
};

export default RecipePreview;
