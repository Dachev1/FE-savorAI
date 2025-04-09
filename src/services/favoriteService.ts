import axiosInstance from '../api/axiosConfig';
import { RecipeResponse } from '../types/recipe';

/**
 * Helper function to safely parse numeric values from strings
 */
function safeParseInt(value: string | undefined): number {
  if (!value) return 0;
  // Remove non-numeric characters (like 'g' for grams)
  const numericValue = value.replace(/[^\d.-]/g, '');
  const parsed = parseInt(numericValue, 10);
  return isNaN(parsed) ? 0 : parsed;
}

interface ApiError {
  isCancel?: boolean;
  isCancelled?: boolean;
  message?: string;
}

/**
 * Service for handling favorite recipe operations
 */
export const favoriteService = {
  /**
   * Get all favorite recipes for the current user
   */
  getFavorites: async () => {
    try {
      const response = await axiosInstance.get('/api/v1/favorites/all');
      return response.data;
    } catch (error: unknown) {
      // Only log real errors, not cancelled requests
      const apiError = error as ApiError;
      if (!apiError.isCancel && !apiError.isCancelled) {
        console.error('Error fetching favorites:', error);
      }
      throw error;
    }
  },
  
  /**
   * Toggle favorite status for a recipe
   * @param recipeId The ID of the recipe to toggle
   * @returns The new favorite status (true if added, false if removed)
   */
  toggleFavorite: async (recipeId: string): Promise<boolean> => {
    if (!recipeId) throw new Error('Recipe ID is required to toggle favorite status');
    
    try {
      // Check current status first 
      const isCurrentlyFavorite = await favoriteService.checkFavorite(recipeId);
      
      if (isCurrentlyFavorite) {
        // If it's already a favorite, use DELETE to remove it
        await axiosInstance.delete(`/api/v1/favorites/${recipeId}`);
        return false; // Now removed from favorites
      } else {
        // If it's not a favorite, use POST to add it
        await axiosInstance.post(`/api/v1/favorites/${recipeId}`);
        return true; // Now added to favorites
      }
    } catch (error: unknown) {
      // Error checking favorite status
      const apiError = error as ApiError;
      if (!apiError.isCancel && !apiError.isCancelled) {
        console.error('Error toggling favorite:', error);
      }
      throw error;
    }
  },
  
  /**
   * Check if a recipe is in the user's favorites
   * @param recipeId The ID of the recipe to check
   * @returns Boolean indicating if the recipe is a favorite
   */
  checkFavorite: async (recipeId: string) => {
    if (!recipeId) return false;
    
    try {
      const response = await axiosInstance.get(`/api/v1/favorites/check/${recipeId}`);
      return response.data.isFavorite;
    } catch (error: unknown) {
      // Only log real errors, not cancelled requests
      const apiError = error as ApiError;
      if (!apiError.isCancel && !apiError.isCancelled) {
        console.error('Error checking favorite status:', error);
      }
      return false; // Default to not favorite on error
    }
  },
  
  /**
   * Save a newly generated recipe and mark it as favorite
   * @param recipe The recipe to save
   * @returns The ID of the saved recipe
   */
  saveGeneratedRecipe: async (recipe: RecipeResponse) => {
    if (!recipe) throw new Error('Recipe is required');
    
    try {
      // Extract instructions based on recipeDetails type
      const instructions = typeof recipe.recipeDetails === 'string' 
        ? recipe.recipeDetails 
        : recipe.recipeDetails.instructions.join('\n');
      
      // Extract serving suggestions
      const servingSuggestions = typeof recipe.recipeDetails === 'string'
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
      
      // Convert ingredients array to comma-separated string
      const ingredientsString = recipe.ingredientsUsed.join(',');
      
      // Save the recipe
      const saveResponse = await axiosInstance.post('/api/v1/recipes/save', {
        title: recipe.mealName,
        ingredients: ingredientsString.split(',').filter(item => item.trim()), // Clean up any empty entries
        instructions,
        servingSuggestions,
        imageUrl: recipe.imageUrl,
        macros,
        isAiGenerated: true,
        difficulty: "EASY",
        totalTimeMinutes: 30
      });
      
      // Mark as favorite
      const savedRecipeId = saveResponse.data.id;
      await axiosInstance.post(`/api/v1/favorites/${savedRecipeId}`);
      
      return savedRecipeId;
    } catch (error: unknown) {
      // Only log real errors, not cancelled requests
      const apiError = error as ApiError;
      if (!apiError.isCancel && !apiError.isCancelled) {
        console.error('Error saving generated recipe:', error);
      }
      throw error;
    }
  }
};

export default favoriteService; 