import { authApi, recipeApi } from './apiService';
import { API_PATHS } from './serviceConfig';

/**
 * Centralized service API module that uses the correct API instance for each service
 * This helps avoid using the wrong port for different services
 */

// AUTH SERVICE APIs (port 8081)
export const authService = {
  /**
   * Sign in user with auto-retry for network issues
   */
  signIn: async (identifier: string, password: string, retries = 1) => {
    let attempts = 0;
    
    while (attempts <= retries) {
      try {
        return await authApi.post(API_PATHS.AUTH.SIGNIN, { identifier, password });
      } catch (error: any) {
        attempts++;
        
        // Only retry on network errors, not auth failures
        if (attempts > retries || 
            (error.response && ![503, 504].includes(error.response.status))) {
          throw error;
        }
        
        // Wait 1 second before retrying
        await new Promise(r => setTimeout(r, 1000));
      }
    }
  },
  
  signUp: (username: string, email: string, password: string) => 
    authApi.post(API_PATHS.AUTH.SIGNUP, { username, email, password }),
  
  logout: () => 
    authApi.post(API_PATHS.AUTH.LOGOUT),
  
  /**
   * Check user status with debounce to prevent too many requests
   */
  checkStatus: (() => {
    let lastCheck = 0;
    let lastIdentifier = '';
    let cachedResult: any = null;
    
    return (identifier: string) => {
      const now = Date.now();
      
      // Return cached result if checking same user within 5 minutes
      if (lastIdentifier === identifier && now - lastCheck < 5 * 60 * 1000 && cachedResult) {
        return Promise.resolve(cachedResult);
      }
      
      // Otherwise make a fresh request
      return authApi.get(`${API_PATHS.AUTH.CHECK_STATUS}?identifier=${encodeURIComponent(identifier)}`)
        .then(result => {
          lastCheck = now;
          lastIdentifier = identifier;
          cachedResult = result;
          return result;
        });
    };
  })(),
  
  getProfile: () => 
    authApi.get(API_PATHS.AUTH.PROFILE),
  
  // User management
  updateUsername: (currentPassword: string, newUsername: string) => 
    authApi.post(API_PATHS.USER.UPDATE_USERNAME, { currentPassword, newUsername }),
  
  updatePassword: (currentPassword: string, newPassword: string) => 
    authApi.post(API_PATHS.USER.UPDATE_PASSWORD, { currentPassword, newPassword }),
  
  getUserProfile: () => 
    authApi.get(API_PATHS.USER.PROFILE, {
      headers: {
        'Cache-Control': 'max-age=300' // 5 minutes caching
      }
    })
};

// RECIPE SERVICE APIs (port 8082)
export const recipeService = {
  // Recipe generation
  generateRecipe: (ingredients: string[]) => 
    recipeApi.post(API_PATHS.RECIPE.GENERATE, ingredients),
  
  // CRUD operations
  getAllRecipes: () => 
    recipeApi.get(API_PATHS.RECIPE.GET_ALL),
  
  getRecipeById: (id: string) => 
    recipeApi.get(`${API_PATHS.RECIPE.GET_ONE}${id}`),
  
  getMyRecipes: () => 
    recipeApi.get(`/v1/recipes/my-recipes`),
  
  createRecipe: async (formData: FormData) => {
    console.log('Creating new recipe');
    const directUrl = '/api/v1/recipes';
    console.log(`API endpoint for creation: ${directUrl}`);
    
    try {
      return await recipeApi.post(directUrl, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    } catch (error: any) {
      // If we get a 404, try the alternative URL format
      if (error.response && error.response.status === 404) {
        console.log('First URL attempt failed with 404, trying alternative URL format');
        const altUrl = '/v1/recipes';
        console.log(`Trying alternative API endpoint: ${altUrl}`);
        
        return recipeApi.post(altUrl, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      
      // If it's not a 404 or the second attempt fails, throw the error
      throw error;
    }
  },
  
  updateRecipe: async (id: string, formData: FormData) => {
    console.log(`Updating recipe with ID: ${id}`);
    
    // Try with direct URL first
    const directUrl = `/api/v1/recipes/${id}/multipart`;
    console.log(`Trying API endpoint: ${directUrl}`);
    
    try {
      return await recipeApi.put(directUrl, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    } catch (error: any) {
      // If we get a 404, try the alternative URL format
      if (error.response && error.response.status === 404) {
        console.log('First URL attempt failed with 404, trying alternative URL format');
        const altUrl = `/v1/recipes/${id}/multipart`;
        console.log(`Trying alternative API endpoint: ${altUrl}`);
        
        return recipeApi.put(altUrl, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      
      // If it's not a 404 or the second attempt fails, throw the error
      throw error;
    }
  },
  
  updateRecipeSimple: async (id: string, data: any) => {
    console.log(`Updating recipe with simple JSON data, ID: ${id}`);
    
    // Try with direct URL first
    const directUrl = `/api/v1/recipes/${id}`;
    console.log(`Trying API endpoint: ${directUrl}`);
    
    try {
      return await recipeApi.put(directUrl, data, {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error: any) {
      // If we get a 404, try the alternative URL format
      if (error.response && error.response.status === 404) {
        console.log('First URL attempt failed with 404, trying alternative URL format');
        const altUrl = `/v1/recipes/${id}`;
        console.log(`Trying alternative API endpoint: ${altUrl}`);
        
        return recipeApi.put(altUrl, data, {
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // If it's not a 404 or the second attempt fails, throw the error
      throw error;
    }
  },
  
  deleteRecipe: (id: string) => 
    recipeApi.delete(`${API_PATHS.RECIPE.DELETE}${id}`),
  
  // Favorites
  favoriteRecipe: (recipeId: string) => 
    recipeApi.post(`${API_PATHS.RECIPE.FAVORITE}/${recipeId}`),
  
  unfavoriteRecipe: (recipeId: string) => 
    recipeApi.delete(`${API_PATHS.RECIPE.FAVORITE}/${recipeId}`),
  
  checkFavorite: (recipeId: string) => 
    recipeApi.get(`${API_PATHS.RECIPE.FAVORITE}/check/${recipeId}`),
  
  getFavorites: () => 
    recipeApi.get(`${API_PATHS.RECIPE.FAVORITE}`)
}; 