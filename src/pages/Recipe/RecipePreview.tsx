import React, { useEffect, useState, useCallback, useMemo, memo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AOS from 'aos';
import { RecipeResponse } from '../../types/recipe';
import { LoadingSpinner, MacrosDisplay } from '../../components/common';
import { FaHeart, FaRegHeart, FaChartBar, FaClock, FaUtensils } from 'react-icons/fa';

interface RecipePreviewProps {
  recipe?: RecipeResponse;
}

// Create an interface for recipe details we extract for display
interface ExtractedRecipeDetails {
  title: string;
  description: string;
  cookTime: number;
  servings: number;
  ingredients: string[];
  instructions: string[];
  macros?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

const RecipePreview: React.FC<RecipePreviewProps> = memo(({ recipe: propRecipe }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<RecipeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(!propRecipe);
  const [error, setError] = useState<string | null>(null);
  const [showMacros, setShowMacros] = useState(false);
  const [liked, setLiked] = useState(false);

  // Initialize animations once
  useEffect(() => {
    AOS.init({ 
      duration: 800, 
      once: true,
      easing: 'ease-out-cubic',
      delay: 50 
    });
  }, []);
  
  // Fetch recipe data if not provided as prop
  useEffect(() => {
    // If recipe is provided as a prop, use it instead of fetching
    if (propRecipe) {
      setRecipe(propRecipe);
      setIsLoading(false);
      return;
    }

    // Only fetch if we have an ID and no propRecipe
    if (!id) {
      setError('Recipe ID is missing');
      setIsLoading(false);
      return;
    }

    const fetchRecipe = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`/v1/recipes/${id}`);
        setRecipe(response.data);
      } catch (err) {
        setError('Failed to load recipe. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipe();
  }, [id, propRecipe]);

  const toggleMacros = useCallback(() => {
    setShowMacros(prev => !prev);
  }, []);

  const toggleLike = useCallback(() => {
    setLiked(prev => !prev);
  }, []);

  // Memoize recipe details to prevent unnecessary recalculations
  const recipeDetails = useMemo((): ExtractedRecipeDetails | null => {
    if (!recipe) return null;

    // Extract details based on the RecipeResponse structure
    const instructions: string[] = [];
    let ingredients = recipe.ingredientsUsed || [];
    
    // Handle different formats of recipe details
    if (typeof recipe.recipeDetails === 'string') {
      instructions.push(...recipe.recipeDetails.split('\n').filter(line => line.trim().length > 0));
    } else if (recipe.recipeDetails && typeof recipe.recipeDetails === 'object') {
      if (Array.isArray(recipe.recipeDetails.instructions)) {
        instructions.push(...recipe.recipeDetails.instructions);
      }
      
      if (Array.isArray(recipe.recipeDetails.ingredientsList) && recipe.recipeDetails.ingredientsList.length > 0) {
        ingredients = recipe.recipeDetails.ingredientsList;
      }
    }
    
    // Format macros to ensure all properties are numbers
    const macros = recipe.macros ? {
      calories: recipe.macros.calories || 0,
      protein: recipe.macros.protein || 0,
      carbs: recipe.macros.carbs || 0,
      fat: recipe.macros.fat || 0
    } : undefined;

    return {
      title: recipe.mealName,
      description: typeof recipe.recipeDetails === 'string' ? '' : (recipe.recipeDetails?.servingSuggestions?.join(' ') || ''),
      cookTime: recipe.prepTimeMinutes || Math.max(15, Math.min(60, instructions.length * 5)),
      servings: 4, // Default servings if not available
      ingredients,
      instructions,
      macros
    };
  }, [recipe]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl text-red-600 mb-2">Error</h2>
        <p className="mb-4">{error}</p>
        <button 
          onClick={() => navigate(-1)} 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!recipeDetails) {
    return <div className="text-center py-8">Recipe not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden" 
           data-aos="fade-up">
        <div className="p-6">
          <header className="mb-4 flex justify-between items-start">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {recipeDetails.title}
            </h1>
            <button 
              onClick={toggleLike}
              className="text-red-500 hover:text-red-600 transition-colors"
              aria-label={liked ? "Unlike recipe" : "Like recipe"}
            >
              {liked ? <FaHeart size={24} /> : <FaRegHeart size={24} />}
            </button>
          </header>
          
          <div className="mb-6">
            <p className="text-gray-700 dark:text-gray-300">
              {recipeDetails.description}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4 mb-6 text-sm">
            <div className="flex items-center">
              <FaClock className="mr-2 text-blue-500" />
              <span className="dark:text-gray-300">{recipeDetails.cookTime} mins</span>
            </div>
            <div className="flex items-center">
              <FaUtensils className="mr-2 text-blue-500" />
              <span className="dark:text-gray-300">{recipeDetails.servings} servings</span>
            </div>
            <button 
              onClick={toggleMacros}
              className="flex items-center text-blue-500 hover:text-blue-600"
            >
              <FaChartBar className="mr-2" />
              <span>Nutrition Facts</span>
            </button>
          </div>
          
          {showMacros && recipeDetails.macros && (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg" data-aos="fade">
              <MacrosDisplay macros={recipeDetails.macros} />
            </div>
          )}
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Ingredients</h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
              {recipeDetails.ingredients.map((ingredient: string, index: number) => (
                <li key={index}>{ingredient}</li>
              ))}
            </ul>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Instructions</h2>
            <ol className="list-decimal pl-5 space-y-3 text-gray-700 dark:text-gray-300">
              {recipeDetails.instructions.map((instruction: string, index: number) => (
                <li key={index} className="pl-2">{instruction}</li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
});

RecipePreview.displayName = 'RecipePreview';

export default RecipePreview;
