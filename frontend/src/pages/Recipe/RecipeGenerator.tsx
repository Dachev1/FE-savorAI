import React, { useState, useCallback, useEffect, useRef } from 'react';
import axios from '../../api/axiosConfig';
import RecipeCard from '../../components/RecipeCard';
import IngredientsInput from '../../components/GeneratorIngredientsInput';

// -----------------------------------------------
// Types & Interfaces
// -----------------------------------------------

interface NutritionalInformation {
  calories: number;
  protein: string;
  carbohydrates: string;
  fat: string;
}

interface RecipeDetails {
  ingredientsList: string[];
  equipmentNeeded: string[];
  instructions: string[];
  servingSuggestions: string[];
  nutritionalInformation: NutritionalInformation;
}

interface RecipeResponse {
  mealName: string;
  ingredientsUsed: string[];
  recipeDetails: RecipeDetails;
  imageUrl: string;
}

type GeneratedMealResponse = RecipeResponse;

// -----------------------------------------------
// Main Component: RecipeGenerator
// -----------------------------------------------

const RecipeGenerator: React.FC = () => {
  // State Management
  const [ingredients, setIngredients] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recipe, setRecipe] = useState<GeneratedMealResponse | null>(null);
  const [copySuccess, setCopySuccess] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);

  // To store timeout ID for cleanup (browser returns number)
  const copyTimeoutRef = useRef<number | null>(null);

  // Cleanup any pending timeout when the component unmounts
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current !== null) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  // Format Recipe Details for Copying
  const formatRecipeDetails = useCallback((details: RecipeDetails): string => {
    return `
Ingredients:
${details.ingredientsList.join('\n')}

Equipment Needed:
${details.equipmentNeeded.join('\n')}

Instructions:
${details.instructions.join('\n')}

Serving Suggestions:
${details.servingSuggestions.join('\n')}

Nutritional Information:
Calories: ${details.nutritionalInformation.calories}
Protein: ${details.nutritionalInformation.protein}
Carbohydrates: ${details.nutritionalInformation.carbohydrates}
Fat: ${details.nutritionalInformation.fat}
    `.trim();
  }, []);

  // Copy Recipe Details to Clipboard
  const copyToClipboard = useCallback(() => {
    if (recipe?.recipeDetails) {
      navigator.clipboard.writeText(formatRecipeDetails(recipe.recipeDetails))
        .then(
          () => setCopySuccess('Recipe details copied to clipboard!'),
          () => setCopySuccess('Failed to copy recipe details.')
        );
      // Clear message after 3 seconds and store timeout ID for cleanup
      copyTimeoutRef.current = window.setTimeout(() => setCopySuccess(''), 3000);
    }
  }, [recipe, formatRecipeDetails]);

  // Toggle Favorite State
  const toggleFavorite = useCallback(() => {
    setIsFavorite((prev) => !prev);
  }, []);

  // Handle Form Submission
  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setRecipe(null);

    // Parse and validate input ingredients
    const ingredientsArray = ingredients
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    if (ingredientsArray.length === 0) {
      setError('Please enter at least one ingredient.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post<RecipeResponse>(
        '/recipes/generate-meal',
        { ingredients: ingredientsArray }
      );

      // Map the backend response to match the frontend interface (if needed)
      const mappedRecipe: GeneratedMealResponse = {
        mealName: response.data.mealName,
        ingredientsUsed: response.data.ingredientsUsed,
        recipeDetails: response.data.recipeDetails,
        imageUrl: response.data.imageUrl,
      };

      setRecipe(mappedRecipe);
    } catch (err: unknown) {
      console.error('Error generating recipe:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [ingredients]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-light via-softGray to-accent flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-3xl bg-white/80 backdrop-blur-md rounded-3xl shadow-lg p-10 border border-gray-200">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-accent to-dark text-center mb-10 drop-shadow-md">
          Discover Your Recipe
        </h1>

        {/* Ingredient Input Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <IngredientsInput 
            ingredients={ingredients}
            onChange={setIngredients}
          />

          <button
            type="submit"
            disabled={!ingredients.trim() || loading}
            className="w-full py-4 rounded-full bg-gradient-to-r from-accent to-dark
                       text-white font-bold text-xl shadow-md
                       transition-transform duration-300 hover:scale-105
                       focus:outline-none focus:ring-4 focus:ring-dark
                       disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? 'Generating...' : 'Generate Recipe'}
          </button>
        </form>

        {/* Error Message */}
        {error && (
          <p className="text-red-500 font-semibold text-center mt-6">
            {error}
          </p>
        )}

        {/* Recipe Display */}
        {recipe && (
          <RecipeCard
            recipe={recipe}
            isFavorite={isFavorite}
            copySuccess={copySuccess}
            onCopy={copyToClipboard}
            onToggleFavorite={toggleFavorite}
          />
        )}
      </div>
    </div>
  );
};

export default RecipeGenerator;
