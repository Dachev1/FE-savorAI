import axios from '../api/axiosConfig';
import { RecipeResponse } from '../types/recipe';

// Helper function to safely parse numeric values from strings
function safeParseInt(value: string | undefined): number {
  if (!value) return 0;
  // Remove non-numeric characters (like 'g' for grams)
  const numericValue = value.replace(/[^\d.-]/g, '');
  const parsed = parseInt(numericValue, 10);
  return isNaN(parsed) ? 0 : parsed;
}

export const favoriteService = {
  getFavorites: async () => {
    const response = await axios.get('/v1/favorites');
    return response.data;
  },
  
  toggleFavorite: async (recipeId: string) => {
    if (!recipeId) throw new Error('Recipe ID is required to toggle favorite status');
    
    const response = await axios.post(`/v1/favorites/${recipeId}`);
    return response.data.isFavorite;
  },
  
  checkFavorite: async (recipeId: string) => {
    if (!recipeId) return false;
    
    try {
      const response = await axios.get(`/v1/favorites/check/${recipeId}`);
      return response.data.isFavorite;
    } catch (error) {
      console.error('Error checking favorite status:', error);
      return false; // Default to not favorite on error
    }
  },
  
  saveGeneratedRecipe: async (recipe: RecipeResponse) => {
    if (!recipe) throw new Error('Recipe is required');
    
    // Extract instructions based on recipeDetails type
    const instructions = typeof recipe.recipeDetails === 'string' 
      ? recipe.recipeDetails 
      : recipe.recipeDetails.instructions.join('\n');
    
    // Extract description/serving suggestions
    const description = typeof recipe.recipeDetails === 'string' 
      ? 'Enjoy your meal!' 
      : recipe.recipeDetails.servingSuggestions.join(' ');
    
    // Prepare macros with safe parsing
    const macros = {
      calories: typeof recipe.recipeDetails === 'string' ? 0 : 
        safeParseInt(recipe.recipeDetails.nutritionalInformation.calories),
      proteinGrams: typeof recipe.recipeDetails === 'string' ? 0 : 
        safeParseInt(recipe.recipeDetails.nutritionalInformation.protein),
      carbsGrams: typeof recipe.recipeDetails === 'string' ? 0 : 
        safeParseInt(recipe.recipeDetails.nutritionalInformation.carbohydrates),
      fatGrams: typeof recipe.recipeDetails === 'string' ? 0 : 
        safeParseInt(recipe.recipeDetails.nutritionalInformation.fat)
    };
    
    // Save the recipe
    const saveResponse = await axios.post('/v1/recipes/save', {
      title: recipe.mealName,
      ingredients: recipe.ingredientsUsed,
      instructions,
      description,
      imageUrl: recipe.imageUrl,
      macros
    });
    
    // Mark as favorite
    const savedRecipeId = saveResponse.data.id;
    await axios.post(`/v1/favorites/${savedRecipeId}`);
    
    return savedRecipeId;
  }
};

export default favoriteService; 