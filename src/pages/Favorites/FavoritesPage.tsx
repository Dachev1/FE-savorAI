import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { recipeServiceAxios } from '../../api/axiosConfig';
import { LoadingSpinner } from '../../components/common';
import { 
  FaHeart, FaHeartBroken, FaSearch, FaThumbsUp, 
  FaThumbsDown, FaComment, FaClock 
} from 'react-icons/fa';
import AOS from 'aos';
import 'aos/dist/aos.css';

// Define a simplified DTO for favorite recipes
interface FavoriteRecipeDTO {
  id: string;
  title: string;
  imageUrl: string | null;
  ingredients: string[];
}

interface Recipe {
  id: string;
  mealName?: string;
  title?: string;
  imageUrl?: string;
  ingredientsUsed?: string[];
  upvotes?: number;
  downvotes?: number;
  commentCount?: number;
  prepTimeMinutes?: number;
  macros?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
  rawData?: any; // For reference only
}

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [favoriteInProgress, setFavoriteInProgress] = useState<string | null>(null);
  const navigate = useNavigate();

  // Initialize animations
  useEffect(() => {
    AOS.init({ 
      duration: 700,
      once: true,
      easing: 'ease-out-cubic',
    });
  }, []);

  // Fetch favorites data
  useEffect(() => {
    const controller = new AbortController();
    
    const fetchFavorites = async () => {
      try {
        setIsLoading(true);
        const response = await recipeServiceAxios.get('/api/v1/favorites/all', {
          signal: controller.signal
        });
        console.log('Fetched favorites:', response.data);
        
        if (Array.isArray(response.data) && response.data.length > 0) {
          // Transform the API response to a simplified recipe DTO
          const processedFavorites = response.data.map(favorite => {
            // Extract only essential information
            const recipeData = favorite.recipe || {};
            
            // Create a simplified recipe object
            return {
              id: favorite.recipeId || recipeData.id,
              title: recipeData.title || '',
              imageUrl: recipeData.imageUrl || null,
              ingredientsUsed: Array.isArray(recipeData.ingredients) ? recipeData.ingredients : []
            };
          });

          console.log('Simplified favorites data:', processedFavorites);
          setFavorites(processedFavorites);
          setError(null);
        } else {
          console.warn('Received empty or invalid favorites data:', response.data);
          setFavorites([]);
        }
      } catch (err: unknown) {
        // Don't treat cancelled requests as errors - they're expected behavior
        if (typeof err === 'object' && err !== null && 
            ('isCancel' in err || 'isCancelled' in err || 
             (err as any).name === 'AbortError' || 
             (err as any).code === 'ECONNABORTED')) {
          // Ignore cancellation - not a real error
          console.log('Request was cancelled');
        } else {
          console.error('Failed to fetch favorites:', err);
          setError('Unable to load favorite recipes');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavorites();
    
    // Cleanup function to abort fetch on unmount
    return () => {
      controller.abort();
    };
  }, []);

  // Memoize filtered favorites to prevent unnecessary recalculations
  const filteredFavorites = useMemo(() => 
    favorites.filter(recipe => 
      !searchTerm || 
      (recipe.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (recipe.ingredientsUsed || []).some(i => i.toLowerCase().includes(searchTerm.toLowerCase()))
    ), 
    [favorites, searchTerm]
  );

  // Memoize the remove favorite handler
  const removeFavorite = useCallback(async (recipeId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault(); // Ensure the event doesn't bubble up
    
    if (favoriteInProgress === recipeId) return;
    setFavoriteInProgress(recipeId);
    
    try {
      // Optimistically update UI immediately
      setFavorites(prevFavorites => prevFavorites.filter(recipe => recipe.id !== recipeId));
      
      // Call API to remove from favorites
      await recipeServiceAxios.delete(`/api/v1/favorites/${recipeId}`);
    } catch (error) {
      console.error('Failed to remove from favorites:', error);
      
      // Restore the removed favorite on error by reloading all favorites
      try {
        const response = await recipeServiceAxios.get('/api/v1/favorites/all');
        
        if (Array.isArray(response.data)) {
          // Transform the API response to a simplified recipe DTO
          const processedFavorites = response.data.map(favorite => {
            // Extract only essential information
            const recipeData = favorite.recipe || {};
            
            // Create a simplified recipe object
            return {
              id: favorite.recipeId || recipeData.id,
              title: recipeData.title || '',
              imageUrl: recipeData.imageUrl || null,
              ingredientsUsed: Array.isArray(recipeData.ingredients) ? recipeData.ingredients : []
            };
          });

          setFavorites(processedFavorites);
        }
      } catch (retryError) {
        console.error('Failed to reload favorites:', retryError);
        // Worst case scenario - show error
        setError('Failed to sync favorites. Please refresh the page.');
      }
    } finally {
      setFavoriteInProgress(null);
    }
  }, [favoriteInProgress]);

  // Handle recipe navigation
  const navigateToRecipe = useCallback((recipeId: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!recipeId) {
      console.error("Recipe ID is missing for navigation");
      return;
    }
    
    // Make sure we're using a clean string ID value
    const cleanId = String(recipeId).trim();
    
    if (!cleanId) {
      console.error("Clean recipe ID is empty after trimming");
      return;
    }
    
    console.log("Navigating to recipe details with ID:", cleanId);
    
    // Ensure we're using the correct ID format and path
    try {
      // Use the correct path format for recipe details
      navigate(`/recipes/${cleanId}`);
    } catch (error) {
      console.error("Navigation error:", error);
    }
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-indigo-900/20 p-4 sm:p-6 lg:p-8 flex justify-center items-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-indigo-900/20 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-red-500 to-pink-600 p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mt-12 -mr-12 z-0"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full -mb-10 -ml-10 z-0"></div>
            <div className="relative z-10">
              <h1 className="text-2xl md:text-3xl font-bold text-white">My Favorite Recipes</h1>
              <p className="text-pink-100 mt-2">Your saved recipes for easy access</p>
            </div>
          </div>
          
          {/* Search bar */}
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <div className="relative max-w-md mx-auto">
              <input
                type="text"
                placeholder="Search favorites..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 pl-12 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm text-gray-800 dark:text-white"
              />
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            </div>
          </div>
          
          <div className="p-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 mb-6 rounded-lg">
                <p className="font-medium">{error}</p>
              </div>
            )}
            
            {favorites.length === 0 ? (
              <div className="text-center py-16 max-w-md mx-auto" data-aos="fade-up">
                <div className="mb-4">
                  <FaHeartBroken className="text-6xl text-gray-400 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No Favorites Yet</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
                  You haven't added any recipes to your favorites yet.
                </p>
                <button 
                  onClick={() => navigate('/recipes/community')}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
                >
                  Browse Community Recipes
                </button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredFavorites.map((recipe, index) => {
                  const recipeKey = recipe.id || `recipe-${index}`;
                  return (
                    <div 
                      key={recipeKey} 
                      className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg cursor-pointer transform hover:-translate-y-1 transition-all overflow-hidden flex flex-col h-80"
                      onClick={(e) => {
                        e.preventDefault();
                        console.log("Recipe card clicked:", recipeKey);
                        if (recipe.id) {
                          console.log("Card clicked, recipe data:", {
                            id: recipe.id,
                            title: recipe.title,
                            hasImage: recipe.imageUrl ? true : false
                          });
                          navigateToRecipe(recipe.id, e);
                        } else {
                          console.error("Recipe card has no ID");
                        }
                      }}
                      data-aos="fade-up"
                      data-aos-delay={Math.min(index * 50, 300)}
                    >
                      {recipe.imageUrl ? (
                        <div className="h-44 relative overflow-hidden flex-shrink-0">
                          <img 
                            src={recipe.imageUrl} 
                            alt={recipe.title || 'Recipe'} 
                            className="w-full h-full object-cover transition-transform hover:scale-110 duration-500"
                            loading="lazy"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.onerror = null;
                              target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop';
                            }}
                          />
                          <button 
                            className="absolute top-2 right-2 p-2 bg-white/80 dark:bg-gray-800/80 rounded-full shadow hover:bg-white dark:hover:bg-gray-700 transition-colors"
                            onClick={(e) => removeFavorite(recipe.id, e)}
                            aria-label="Remove from favorites"
                            disabled={favoriteInProgress === recipe.id}
                          >
                            <FaHeart className={`text-red-500 ${favoriteInProgress === recipe.id ? 'opacity-50' : ''}`} />
                          </button>
                        </div>
                      ) : (
                        <div className="h-44 bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900/20 dark:to-pink-900/20 flex items-center justify-center relative flex-shrink-0">
                          <span className="text-5xl">🍲</span>
                          <button 
                            className="absolute top-2 right-2 p-2 bg-white/80 dark:bg-gray-800/80 rounded-full shadow hover:bg-white dark:hover:bg-gray-700 transition-colors"
                            onClick={(e) => removeFavorite(recipe.id, e)}
                            aria-label="Remove from favorites"
                            disabled={favoriteInProgress === recipe.id}
                          >
                            <FaHeart className={`text-red-500 ${favoriteInProgress === recipe.id ? 'opacity-50' : ''}`} />
                          </button>
                        </div>
                      )}
                      
                      <div className="p-5 flex flex-col flex-grow justify-between">
                        <h3 className="font-semibold text-lg text-gray-800 dark:text-white mb-2 text-center line-clamp-2 h-14 overflow-hidden">
                          {recipe.title || 'Untitled Recipe'}
                        </h3>
                        
                        <button 
                          className="w-full mt-auto py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm flex items-center justify-center"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log("View Details button clicked:", recipeKey);
                            if (recipe.id) {
                              console.log("Button clicked, navigating with ID:", recipe.id);
                              console.log("Recipe data summary:", {
                                id: recipe.id,
                                title: recipe.title,
                                hasImage: recipe.imageUrl ? true : false
                              });
                              navigateToRecipe(recipe.id, e);
                            } else {
                              console.error("No recipe ID available for navigation");
                            }
                          }}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FavoritesPage; 