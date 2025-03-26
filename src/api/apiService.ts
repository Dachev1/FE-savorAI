import axios from './axiosConfig';
import { RecipeResponse as Recipe, IRecipeFormData as RecipeForm } from '../types';
import { User, RegisterData, LoginData, AuthResponse } from '../types/auth';

// Auth API with optimized memoization
export const authAPI = {
  // Memory cache for profile data
  _profileCache: null as { data: User, timestamp: number } | null,
  
  login: async (data: LoginData) => {
    try {
      console.log('Making login request to /user/login');
      
      // Ensure we have a valid identifier from either data.identifier or data.email
      const userIdentifier = data.identifier || data.email;
      console.log(`Attempting login with identifier: ${userIdentifier}`);
      
      // Validate the identifier
      if (!userIdentifier) {
        throw new Error('Username or email cannot be empty');
      }
      
      // Prepare request data with proper identifier field
      const loginData = {
        identifier: userIdentifier,
        password: data.password
      };
      
      const response = await axios.post('/user/login', loginData, {
        // Add timeout for login operation
        timeout: 10000
      });
      
      console.log('Login successful');
      
      // Clear profile cache to ensure fresh data after login
      authAPI._profileCache = null;
      
      // Debug the response structure to see what's missing
      console.log('Login response structure:', {
        hasData: !!response.data,
        dataKeys: response.data ? Object.keys(response.data) : [],
        hasToken: response.data?.token ? true : false,
        hasUser: response.data?.user ? true : false
      });
      
      // More flexible validation that logs what's missing
      if (!response.data) {
        console.error('Invalid login response: missing data');
        throw new Error('Empty response from server');
      }
      
      // Adapt to the server's actual response structure
      let token = response.data.token;
      let user = response.data.user;
      
      // If user is embedded differently in the response
      if (!user && response.data.userData) {
        user = response.data.userData;
      } else if (!user && typeof response.data === 'object') {
        // Try to extract user data from the response object
        const possibleUser = { ...response.data };
        if (possibleUser.token) delete possibleUser.token;
        if (possibleUser.username || possibleUser.email || possibleUser.role) {
          user = possibleUser;
        }
      }
      
      // If token is not directly in response.data but elsewhere
      if (!token && response.headers?.authorization) {
        token = response.headers.authorization;
      }
      
      // Now check with more detailed errors
      if (!token) {
        console.error('Invalid login response: missing token');
        throw new Error('Authentication token missing from server response');
      }
      
      if (!user) {
        console.error('Invalid login response: missing user data');
        throw new Error('User data missing from server response');
      }
      
      return { token, user } as AuthResponse;
    } catch (error: unknown) {
      // Don't log the full error object which might contain sensitive data
      console.error('Login request failed:', error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  },
  
  register: async (data: RegisterData) => {
    const response = await axios.post('/user/register', data);
    return response.data;
  },
  
  logout: async (providedToken?: string) => {
    try {
      // Use the provided token if available, otherwise get from localStorage
      const token = providedToken || localStorage.getItem('authToken');
      
      if (!token) {
        console.log('No token found for logout request');
        return { success: true, message: 'Logged out locally' };
      }
      
      // Extract bare token if it includes 'Bearer ' prefix
      const actualToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      
      // Log token format (first few characters only for security)
      console.log(`Logout token format: ${token.substring(0, 10)}...`);
      
      // Create a specific config with the authorization header
      const config = {
        headers: {
          'Authorization': actualToken,
          'Content-Type': 'application/json'
        }
      };
      
      // Log the actual config being used
      console.log('Logout request config:', {
        url: '/user/logout',
        headers: {
          Authorization: actualToken.substring(0, 15) + '...',
          'Content-Type': 'application/json'
        }
      });
      
      // Make the request with the explicit header config
      console.log('Sending logout request with token');
      const response = await axios.post('/user/logout', {}, config);
      console.log('Logout successful, server response:', response.status);
      return response.data;
    } catch (error) {
      console.log('Logout API error handled gracefully:', error);
      // Return an empty successful response even if the server returns an error
      return { success: true, message: 'Logged out locally' };
    }
  },
  
  getProfile: async () => {
    try {
      // Check in-memory cache first (valid for 30 seconds)
      const now = Date.now();
      if (authAPI._profileCache && (now - authAPI._profileCache.timestamp < 30000)) {
        console.log('Using in-memory cached user profile data');
        return authAPI._profileCache.data;
      }
      
      // Then check localStorage cache
      const cachedData = localStorage.getItem('cachedUserProfile');
      if (cachedData && cachedData !== 'undefined') {
        try {
          const { data, timestamp } = JSON.parse(cachedData);
          const isValid = now - timestamp < 30000; // 30 seconds cache
          
          if (isValid && data && data.username) {
            console.log('Using localStorage cached user profile data');
            // Update in-memory cache
            authAPI._profileCache = { data, timestamp };
            return data as User;
          }
        } catch (e) {
          // Handle corrupted localStorage data
          localStorage.removeItem('cachedUserProfile');
        }
      }
      
      // Get currently stored user details to optimize request
      let username = '';
      try {
        const userJson = localStorage.getItem('user');
        if (userJson && userJson !== 'undefined') {
          const userData = JSON.parse(userJson);
          if (userData && userData.username) {
            username = userData.username;
          }
        }
      } catch (e) {
        // Ignore parsing errors
      }
      
      // Fetch fresh data with timeout protection
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10-second timeout
      
      try {
        // Include username in URL to optimize backend lookup if available
        // Note: Backend might use either email or username for lookup
        const params: Record<string, string> = {};
        
        if (username) {
          params.identifier = username; // Use identifier parameter instead of username
        }
        
        const response = await axios.get('/user/current-user', { 
          signal: controller.signal,
          params
        });
        
        if (!response.data) {
          throw new Error('Invalid response: missing user data');
        }
        
        // Cache the response in memory
        authAPI._profileCache = {
          data: response.data,
          timestamp: now
        };
        
        // Cache in localStorage as backup
        localStorage.setItem('cachedUserProfile', JSON.stringify({
          data: response.data,
          timestamp: now
        }));
        
        return response.data as User;
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (error) {
      // Handle timeout errors more gracefully
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('Profile fetch timeout');
        throw new Error('Unable to fetch user profile. Request timed out.');
      }
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },

  verifyEmail: async (token: string) => {
    const response = await axios.get(`/verification/verify/${token}`);
    return response.data;
  },

  checkVerificationStatus: async (email: string) => {
    const response = await axios.get(`/verification/status?email=${encodeURIComponent(email)}`);
    return response.data;
  }
};

// Admin API
export const adminAPI = {
  getAllUsers: async () => {
    try {
      const response = await axios.get('/admin/users');
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  updateUserRole: async (userId: string, role: string) => {
    try {
      const response = await axios.put(`/admin/users/${userId}/role`, { role });
      return response.data;
    } catch (error) {
      console.error(`Error updating role for user ${userId}:`, error);
      throw error;
    }
  }
};

// Recipe API with optimized caching
export const recipeAPI = {
  // Cache for recipes
  _recipeCache: new Map(),
  
  // Cache duration in milliseconds (2 minutes)
  _cacheDuration: 120000,
  
  _isCacheValid: function(timestamp: number) {
    return Date.now() - timestamp < this._cacheDuration;
  },

  getAllRecipes: async (params?: { 
    tags?: string[],
    query?: string,
    page?: number,
    limit?: number
  }) => {
    // Generate cache key based on parameters
    const cacheKey = `recipes_${JSON.stringify(params || {})}`;
    
    // Check if cache exists and is valid
    const cachedItem = recipeAPI._recipeCache.get(cacheKey);
    if (cachedItem && recipeAPI._isCacheValid(cachedItem.timestamp)) {
      console.log('Using cached recipes data');
      return cachedItem.data;
    }
    
    // Fetch fresh data
    const response = await axios.get('/recipe', { params });
    
    // Update cache
    recipeAPI._recipeCache.set(cacheKey, {
      data: response.data,
      timestamp: Date.now()
    });
    
    return response.data;
  },
  
  getRecipeById: async (id: string) => {
    // Check cache first
    const cacheKey = `recipe_${id}`;
    const cachedItem = recipeAPI._recipeCache.get(cacheKey);
    
    if (cachedItem && recipeAPI._isCacheValid(cachedItem.timestamp)) {
      console.log(`Using cached data for recipe ${id}`);
      return cachedItem.data as Recipe;
    }
    
    const response = await axios.get(`/recipe/${id}`);
    
    // Update cache
    recipeAPI._recipeCache.set(cacheKey, {
      data: response.data,
      timestamp: Date.now()
    });
    
    return response.data as Recipe;
  },
  
  createRecipe: async (data: RecipeForm) => {
    const response = await axios.post('/recipe', data);
    // Invalidate recipes list cache
    recipeAPI._recipeCache.delete('recipes_{}');
    return response.data;
  },
  
  updateRecipe: async (id: string, data: RecipeForm) => {
    const response = await axios.put(`/recipe/${id}`, data);
    // Invalidate related caches
    recipeAPI._recipeCache.delete(`recipe_${id}`);
    recipeAPI._recipeCache.delete('recipes_{}');
    return response.data;
  },
  
  deleteRecipe: async (id: string) => {
    const response = await axios.delete(`/recipe/${id}`);
    // Invalidate related caches
    recipeAPI._recipeCache.delete(`recipe_${id}`);
    recipeAPI._recipeCache.delete('recipes_{}');
    return response.data;
  },
  
  generateRecipe: async (preferences: any) => {
    const response = await axios.post('/recipe/generate', preferences);
    return response.data;
  },
  
  clearCache: () => {
    recipeAPI._recipeCache.clear();
    console.log('Recipe cache cleared');
  },

  // Debounce function for search operations
  _debounce: (fn: Function, delay: number) => {
    let timer: number | null = null;
    return (...args: any[]) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        fn(...args);
        timer = null;
      }, delay) as unknown as number;
    };
  },

  // Preload common recipes to improve UX
  preloadCommonRecipes: async () => {
    // Only preload if no cache exists
    if (!recipeAPI._recipeCache.has('recipes_{}')) {
      console.log('Preloading common recipes for faster UX');
      try {
        // Use low priority fetch to avoid competing with more important requests
        setTimeout(async () => {
          await recipeAPI.getAllRecipes();
        }, 2000);
      } catch (e) {
        // Silently fail - this is just a preload
      }
    }
  }
};

export default {
  auth: authAPI,
  admin: adminAPI,
  recipes: recipeAPI
}; 