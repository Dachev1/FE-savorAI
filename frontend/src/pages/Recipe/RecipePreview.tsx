import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from '../../api/axiosConfig.tsx';
import MacrosDisplay from '../../components/common/MacrosDisplay';
import { RecipeResponse } from '../../types/recipe';
import HeaderSection from '../../components/HeaderSection';
import { FaArrowLeft, FaEdit, FaChartBar, FaClock, FaUtensils, FaHeart, FaShareAlt, FaListUl, FaPrint } from 'react-icons/fa';
import Modal from '../../components/common/Modal/Modal';
import AOS from 'aos';
import 'aos/dist/aos.css';

interface RecipePreviewProps {
  recipe?: RecipeResponse | any;
}

const RecipePreview: React.FC<RecipePreviewProps> = ({ recipe: propRecipe }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<RecipeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(!propRecipe);
  const [error, setError] = useState<string | null>(null);
  const [showMacros, setShowMacros] = useState(false);
  const [liked, setLiked] = useState(false);

  console.log("RecipePreview rendering with propRecipe:", propRecipe);

  useEffect(() => {
    // Initialize animations
    AOS.init({ 
      duration: 800, 
      once: true,
      easing: 'ease-out-cubic',
      delay: 50 
    });
    
    // If recipe is provided as a prop, use it instead of fetching
    if (propRecipe) {
      console.log("Setting recipe state from prop:", propRecipe);
      setRecipe(propRecipe);
      setIsLoading(false);
      return;
    }

    const fetchRecipe = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`/v1/recipes/${id}`);
        console.log("Fetched recipe data:", response.data);
        setRecipe(response.data);
      } catch (err) {
        console.error('Error fetching recipe:', err);
        setError('Failed to load recipe. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchRecipe();
    } else {
      console.warn("No id parameter and no propRecipe provided");
    }
  }, [id, propRecipe]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/30">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <FaUtensils className="text-blue-500 h-6 w-6 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/30">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-6 py-5 shadow-lg max-w-lg">
          <h3 className="text-xl font-bold mb-2">Error</h3>
          <p className="text-sm dark:text-red-300/90">{error}</p>
          <button 
            onClick={() => navigate('/recipes')}
            className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-200 font-medium"
          >
            <FaArrowLeft className="mr-2" /> Return to recipes
          </button>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/30">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300 px-6 py-5 shadow-lg max-w-lg">
          <h3 className="text-xl font-bold mb-2">Recipe Not Found</h3>
          <p className="text-sm dark:text-yellow-300/90">The requested recipe could not be found.</p>
          <button 
            onClick={() => navigate('/recipes')}
            className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-200 font-medium"
          >
            <FaArrowLeft className="mr-2" /> Browse recipes
          </button>
        </div>
      </div>
    );
  }

  // Handle different formats of recipeDetails
  let formattedInstructions = '';
  let formattedIngredients: string[] = [];
  let nutritionalInfo = null;

  if (recipe) {
    // Set the base values
    formattedIngredients = recipe.ingredientsUsed || [];
    nutritionalInfo = recipe.macros || null;

    // Handle string format
    if (typeof recipe.recipeDetails === 'string') {
      formattedInstructions = recipe.recipeDetails;
    } 
    // Handle object format
    else if (recipe.recipeDetails && typeof recipe.recipeDetails === 'object') {
      const details = recipe.recipeDetails;
      
      // Handle instructions
      if (Array.isArray(details.instructions)) {
        formattedInstructions = details.instructions.join('\n');
      }
      
      // Handle ingredients
      if (Array.isArray(details.ingredientsList) && details.ingredientsList.length > 0) {
        formattedIngredients = details.ingredientsList;
      }
      
      // Handle nutritional information
      if (details.nutritionalInformation) {
        const ni = details.nutritionalInformation;
        const calories = parseInt(ni.calories) || 0;
        const protein = parseInt(ni.protein) || 0;
        const carbs = parseInt(ni.carbohydrates) || 0;
        const fat = parseInt(ni.fat) || 0;
        
        // Only set nutritional info if at least one value is non-zero
        if (calories > 0 || protein > 0 || carbs > 0 || fat > 0) {
          nutritionalInfo = {
            calories,
            protein,
            carbs,
            fat
          };
        }
      }
    }

    console.log("Processed recipe data:", {
      instructions: formattedInstructions,
      ingredients: formattedIngredients,
      nutritionalInfo: nutritionalInfo
    });
  }

  // For preview mode (from RecipeCreate), we don't need the action buttons
  const isPreviewMode = Boolean(propRecipe);

  // Format instructions as an array for numbered display
  const instructionsArray = formattedInstructions
    ? formattedInstructions.split('\n').filter(line => line.trim().length > 0)
    : [];

  // Use the actual prepTimeMinutes from the recipe if available, otherwise estimate it
  const showPrepTime = (recipe as any)?.showPrepTime !== false;
  const estimatedPrepTime = showPrepTime ? (recipe.prepTimeMinutes || Math.max(15, Math.min(60, instructionsArray.length * 5))) : null;

  return (
    <div className={isPreviewMode ? "" : "min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-indigo-900/20 py-8"}>
      <div className={isPreviewMode ? "" : "max-w-4xl mx-auto bg-white dark:bg-gray-800 shadow-2xl rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 transition-all transform"}>
        {!isPreviewMode && (
          <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800" data-aos="fade-down">
            <button
              onClick={() => navigate('/recipes')}
              className="group flex items-center text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-300 transition-colors"
            >
              <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Recipes
            </button>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setLiked(!liked)} 
                className={`flex items-center justify-center gap-1 px-3 py-1.5 rounded-full text-sm transition-all ${
                  liked ? 'bg-red-100 text-red-500 dark:bg-red-900/40 dark:text-red-300' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                <FaHeart className={liked ? 'text-red-500 dark:text-red-300' : ''} />
                <span>{liked ? 'Saved' : 'Save'}</span>
              </button>
              
              <button 
                className="flex items-center justify-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <FaShareAlt />
                <span>Share</span>
              </button>
              
              <button 
                className="flex items-center justify-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <FaPrint />
                <span>Print</span>
              </button>
            </div>
          </div>
        )}
        
        {/* Recipe content */}
        <div className="p-6 bg-white dark:bg-gray-800">
          {/* Recipe Image and Title */}
          {recipe.imageUrl && (
            <div className="relative rounded-xl overflow-hidden h-80 mb-8 shadow-lg" data-aos="fade-up">
              <img 
                src={recipe.imageUrl} 
                alt={recipe.mealName} 
                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent"></div>
              
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex items-center gap-2 mb-3">
                  {estimatedPrepTime !== null && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200">
                      <FaClock className="mr-1" /> {estimatedPrepTime} mins
                    </span>
                  )}
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/60 dark:text-green-200">
                    {formattedIngredients.length} ingredients
                  </span>
                </div>
                
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 drop-shadow-lg">
                  {recipe.mealName}
                </h1>
              </div>
            </div>
          )}
          
          {/* If no image, show the title separately */}
          {!recipe.imageUrl && (
            <div className="mb-8 text-center" data-aos="fade-up">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-2">
                {recipe.mealName}
              </h1>
              <div className="w-24 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 mx-auto my-4 rounded-full"></div>
              
              <div className="flex items-center justify-center gap-3 my-4">
                {estimatedPrepTime !== null && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-200">
                    <FaClock className="mr-1" /> {estimatedPrepTime} mins
                  </span>
                )}
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/60 dark:text-green-200">
                  {formattedIngredients.length} ingredients
                </span>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-8">
            {/* Ingredients Section */}
            <div className="md:col-span-4" data-aos="fade-up" data-aos-delay="100">
              <div className="bg-blue-50 dark:bg-gray-700/50 rounded-xl p-6 h-full hover:shadow-md transition-shadow border border-blue-100 dark:border-blue-800/30">
                <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white flex items-center border-b border-blue-100 dark:border-blue-800/30 pb-3">
                  <FaUtensils className="mr-3 text-blue-500 dark:text-blue-400" /> Ingredients
                </h2>
                <ul className="space-y-3">
                  {formattedIngredients.map((ingredient, index) => (
                    <li key={index} className="flex items-start">
                      <span className="inline-block w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400 mt-2.5 mr-3 flex-shrink-0"></span>
                      <span className="text-gray-700 dark:text-gray-200">{ingredient}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* Instructions Section */}
            <div className="md:col-span-8" data-aos="fade-up" data-aos-delay="150">
              <div className="bg-amber-50 dark:bg-gray-700/50 rounded-xl p-6 h-full hover:shadow-md transition-shadow border border-amber-100 dark:border-amber-800/30">
                <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white flex items-center border-b border-amber-100 dark:border-amber-800/30 pb-3">
                  <FaListUl className="mr-3 text-amber-500 dark:text-amber-400" /> Instructions
                </h2>
                <ol className="space-y-4">
                  {instructionsArray.map((instruction, index) => (
                    <li key={index} className="flex">
                      <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-amber-200 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 mr-3 font-semibold text-sm">
                        {index + 1}
                      </span>
                      <p className="text-gray-700 dark:text-gray-200 pt-1">{instruction}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
          
          {/* Nutritional Information Display */}
          {nutritionalInfo && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700/50 dark:to-indigo-900/30 rounded-xl p-6 mb-8 hover:shadow-lg transition-shadow border border-blue-100 dark:border-blue-800/30" data-aos="fade-up" data-aos-delay="200">
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white flex items-center border-b border-blue-100 dark:border-blue-800/30 pb-3">
                <FaChartBar className="mr-3 text-blue-500 dark:text-blue-400" /> Nutritional Information
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                <div className="text-center p-4 bg-white dark:bg-gray-700 rounded-lg shadow hover:shadow-md transition-shadow transform hover:-translate-y-1 duration-300">
                  <span className="block text-gray-500 dark:text-gray-300 text-sm mb-1">Calories</span>
                  <span className="block text-2xl font-bold text-blue-600 dark:text-blue-300">{nutritionalInfo?.calories || 0}</span>
                </div>
                <div className="text-center p-4 bg-white dark:bg-gray-700 rounded-lg shadow hover:shadow-md transition-shadow transform hover:-translate-y-1 duration-300">
                  <span className="block text-gray-500 dark:text-gray-300 text-sm mb-1">Protein</span>
                  <span className="block text-2xl font-bold text-green-600 dark:text-green-300">{nutritionalInfo?.protein || 0}g</span>
                </div>
                <div className="text-center p-4 bg-white dark:bg-gray-700 rounded-lg shadow hover:shadow-md transition-shadow transform hover:-translate-y-1 duration-300">
                  <span className="block text-gray-500 dark:text-gray-300 text-sm mb-1">Carbs</span>
                  <span className="block text-2xl font-bold text-amber-600 dark:text-amber-300">{nutritionalInfo?.carbs || 0}g</span>
                </div>
                <div className="text-center p-4 bg-white dark:bg-gray-700 rounded-lg shadow hover:shadow-md transition-shadow transform hover:-translate-y-1 duration-300">
                  <span className="block text-gray-500 dark:text-gray-300 text-sm mb-1">Fat</span>
                  <span className="block text-2xl font-bold text-red-600 dark:text-red-300">{nutritionalInfo?.fat || 0}g</span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Action buttons - only show when not in preview mode */}
        {!isPreviewMode && (
          <div className="bg-gray-50 dark:bg-gray-700/80 border-t border-gray-100 dark:border-gray-700 px-6 py-4 flex flex-wrap gap-4 justify-between items-center" data-aos="fade-up" data-aos-delay="250">
            <button
              onClick={() => navigate('/recipes')}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg transition-colors shadow-sm hover:shadow border border-gray-200 dark:border-gray-600"
            >
              <FaArrowLeft className="text-gray-500 dark:text-gray-400" /> Return to All Recipes
            </button>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowMacros(true)}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                <FaChartBar /> Show Macros
              </button>
              
              <button
                onClick={() => navigate(`/recipes/edit/${id}`)}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-lg transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                <FaEdit /> Edit Recipe
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Macros Modal */}
      {showMacros && nutritionalInfo && (
        <Modal
          isOpen={showMacros}
          onClose={() => setShowMacros(false)}
        >
          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
            <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              <FaChartBar className="inline-block mr-2 text-blue-500 dark:text-blue-400" /> Nutritional Information
            </h3>
            <MacrosDisplay 
              macros={{
                calories: nutritionalInfo?.calories || 0,
                protein: nutritionalInfo?.protein || 0,
                carbs: nutritionalInfo?.carbs || 0,
                fat: nutritionalInfo?.fat || 0
              }} 
            />
          </div>
        </Modal>
      )}
    </div>
  );
};

export default RecipePreview;
