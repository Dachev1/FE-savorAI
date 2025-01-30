import React, { useState } from 'react';
import axios from '../../api/axiosConfig';
import RecipeCard from '../../components/RecipeCard';

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

interface GeneratedMealResponse {
  mealName: string;
  ingredientsUsed: string[];
  recipeDetails: RecipeDetails;
  imageUrl: string;
}

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

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setRecipe(null);

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

      // Map the backend response to match the frontend interface
      const mappedRecipe: GeneratedMealResponse = {
        mealName: response.data.mealName,
        ingredientsUsed: response.data.ingredientsUsed,
        recipeDetails: response.data.recipeDetails,
        imageUrl: response.data.imageUrl,
      };

      setRecipe(mappedRecipe);
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Copy Recipe Details to Clipboard
  const copyToClipboard = () => {
    if (recipe?.recipeDetails) {
      navigator.clipboard
        .writeText(formatRecipeDetails(recipe.recipeDetails))
        .then(
          () => setCopySuccess('Recipe details copied to clipboard!'),
          () => setCopySuccess('Failed to copy recipe details.')
        );
      // Clear message after 3 seconds
      setTimeout(() => setCopySuccess(''), 3000);
    }
  };

  // Toggle Favorite State
  const toggleFavorite = () => {
    setIsFavorite((prev) => !prev);
  };

  // Format Recipe Details for Copying
  const formatRecipeDetails = (details: RecipeDetails): string => {
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
    `;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-light via-softGray to-accent flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-3xl bg-white/80 backdrop-blur-md rounded-3xl shadow-lg p-10 border border-gray-200">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-accent to-dark text-center mb-10 drop-shadow-md">
          Discover Your Recipe
        </h1>

        {/* Ingredient Input Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="ingredients"
              className="block mb-2 text-lg font-semibold text-dark"
            >
              Enter Ingredients (comma-separated):
            </label>
            <input
              id="ingredients"
              type="text"
              placeholder="e.g. chicken, rice, tomatoes"
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-5 py-3 text-dark
                         focus:outline-none focus:ring-4 focus:ring-accent
                         transition-all placeholder:text-gray-400 shadow-sm"
            />
          </div>

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
