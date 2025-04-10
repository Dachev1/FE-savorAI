import axiosInstance from '../api/axiosConfig';
import { RecipeResponse } from '../types/recipe';
import { isAxiosError } from 'axios';

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
    if (!recipeId) {
      console.error('[DEBUG-SERVICE] toggleFavorite: No recipeId provided');
      throw new Error('Recipe ID is required');
    }
    
    try {
      console.log('[DEBUG-SERVICE] toggleFavorite: Toggling favorite for recipeId:', recipeId);
      
      // Check current status first 
      const isCurrentlyFavorite = await favoriteService.checkFavorite(recipeId);
      console.log('[DEBUG-SERVICE] toggleFavorite: Current status:', isCurrentlyFavorite);
      
      let result: boolean;
      
      if (isCurrentlyFavorite) {
        console.log('[DEBUG-SERVICE] toggleFavorite: Removing from favorites');
        // If it's already a favorite, use DELETE to remove it
        await axiosInstance.delete(`/api/v1/favorites/${recipeId}`);
        result = false;
      } else {
        console.log('[DEBUG-SERVICE] toggleFavorite: Adding to favorites');
        // If it's not a favorite, use POST to add it
        const response = await axiosInstance.post(`/api/v1/favorites/${recipeId}`);
        console.log('[DEBUG-SERVICE] toggleFavorite: Add response:', response.data);
        result = true;
      }
      
      console.log('[DEBUG-SERVICE] toggleFavorite: Final result:', result);
      return result;
    } catch (error) {
      console.error('[DEBUG-SERVICE] toggleFavorite: Error:', error);
      
      // Handle database errors specifically
      if (isAxiosError(error) && error.response?.status === 500) {
        const errorMessage = error.response?.data?.message || '';
        console.error('[DEBUG-SERVICE] toggleFavorite: Server error message:', errorMessage);
        
        if (errorMessage.includes('Unknown database')) {
          throw new Error('Database connection error');
        }
      }
      throw error;
    }
  },
  
  /**
   * Check if a recipe is in the user's favorites
   * @param recipeId The ID of the recipe to check
   * @returns Boolean indicating if the recipe is a favorite
   */
  checkFavorite: async (recipeId: string): Promise<boolean> => {
    if (!recipeId) {
      console.log('[DEBUG-SERVICE] checkFavorite: No recipeId provided, returning false');
      return false;
    }
    
    try {
      console.log('[DEBUG-SERVICE] checkFavorite: Checking status for recipeId:', recipeId);
      const response = await axiosInstance.get(`/api/v1/favorites/check/${recipeId}`);
      console.log('[DEBUG-SERVICE] checkFavorite: Raw API response:', response.data);
      
      // Force boolean conversion to handle undefined/null responses
      const result = response.data?.isFavorite === true;
      console.log('[DEBUG-SERVICE] checkFavorite: Converted response to boolean:', result);
      return result;
    } catch (error) {
      console.error('[DEBUG-SERVICE] checkFavorite: Error:', error);
      return false; // Return false on error
    }
  },
  
  /**
   * Save a newly generated recipe and mark it as favorite
   * @param recipe The recipe to save
   * @returns The ID of the saved recipe
   */
  saveGeneratedRecipe: async (recipe: RecipeResponse) => {
    if (!recipe) {
      console.error('[DEBUG-SERVICE] saveGeneratedRecipe: No recipe provided');
      throw new Error('Recipe is required');
    }
    
    try {
      console.log('[DEBUG-SERVICE] saveGeneratedRecipe: Processing recipe for save:', {
        name: recipe.mealName,
        hasId: !!recipe.id,
        ingredientsCount: recipe.ingredientsUsed?.length || 0
      });
      
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
      
      // Ensure we have cooking time and difficulty
      const cookingTime = recipe.cookingTimeMinutes || 30;
      const difficulty = recipe.difficulty || 'EASY';
      
      console.log('[DEBUG-SERVICE] saveGeneratedRecipe: Sending save request to API');
      // Save the recipe
      const saveResponse = await axiosInstance.post('/api/v1/recipes/save', {
        title: recipe.mealName,
        ingredients: ingredientsString.split(',').filter(item => item.trim()),
        instructions,
        servingSuggestions,
        imageUrl: recipe.imageUrl,
        macros,
        isAiGenerated: true,
        difficulty: difficulty,
        totalTimeMinutes: cookingTime
      });
      
      console.log('[DEBUG-SERVICE] saveGeneratedRecipe: Recipe saved successfully, response:', saveResponse.data);
      
      // Mark as favorite
      const savedRecipeId = saveResponse.data.id;
      
      if (!savedRecipeId) {
        console.error('[DEBUG-SERVICE] saveGeneratedRecipe: No recipe ID in save response');
        throw new Error('Server did not return recipe ID');
      }
      
      console.log('[DEBUG-SERVICE] saveGeneratedRecipe: Marking recipe as favorite:', savedRecipeId);
      await axiosInstance.post(`/api/v1/favorites/${savedRecipeId}`);
      console.log('[DEBUG-SERVICE] saveGeneratedRecipe: Recipe marked as favorite');
      
      return savedRecipeId;
    } catch (error) {
      console.error('[DEBUG-SERVICE] saveGeneratedRecipe: Error:', error);
      
      if (isAxiosError(error)) {
        console.error('[DEBUG-SERVICE] saveGeneratedRecipe: Axios error status:', error.response?.status);
        console.error('[DEBUG-SERVICE] saveGeneratedRecipe: Axios error data:', error.response?.data);
        
        if (error.response?.status === 500) {
          const errorMessage = error.response?.data?.message || '';
          console.error('[DEBUG-SERVICE] saveGeneratedRecipe: Error message:', errorMessage);
          
          if (errorMessage.includes('Unknown database')) {
            throw new Error('Database connection error');
          }
        }
      }
      
      throw error;
    }
  }
};

export default favoriteService; 