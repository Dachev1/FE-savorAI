import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axiosConfig';
import { useAuth } from '../../context';
import { LoadingSpinner } from '../../components/common';
import { 
  FaSearch, FaThumbsUp, FaThumbsDown, FaComment, 
  FaHeart, FaRegHeart, FaUserCircle, FaClock
} from 'react-icons/fa';
import AOS from 'aos';
import 'aos/dist/aos.css';

// Recipe interface with voting and favorite functionality
interface Recipe {
  id: string;
  mealName: string;
  imageUrl?: string;
  ingredientsUsed: string[];
  authorId?: string;
  authorName?: string;
  upvotes?: number;
  downvotes?: number;
  commentCount?: number;
  isFavorite?: boolean;
  hasVoted?: boolean;
  userVote?: 'up' | 'down' | null;
  prepTimeMinutes?: number;
  createdAt?: string;
}

const AllRecipes: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [votingInProgress, setVotingInProgress] = useState<string | null>(null);
  const [favoriteInProgress, setFavoriteInProgress] = useState<string | null>(null);

  // Initialize animations
  useEffect(() => {
    AOS.init({ 
      duration: 700,
      once: true,
      easing: 'ease-out-cubic',
      disable: 'mobile'
    });
  }, []);

  // Fetch all community recipes
  useEffect(() => {
    fetchAllRecipes();
  }, []);

  const fetchAllRecipes = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/v1/recipes/community');
      setRecipes(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching recipes:', err);
      setError('Failed to load community recipes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Toggle favorite status
  const toggleFavorite = useCallback(async (recipeId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault(); // Ensure the event doesn't bubble up
    
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }

    if (favoriteInProgress === recipeId) return;
    setFavoriteInProgress(recipeId);

    try {
      // Update UI immediately before API call completes
      const currentFavoriteStatus = recipes.find(r => r.id === recipeId)?.isFavorite || false;
      const newFavoriteStatus = !currentFavoriteStatus;
      
      // Update UI optimistically
      setRecipes(prevRecipes => 
        prevRecipes.map(recipe => 
          recipe.id === recipeId 
            ? { ...recipe, isFavorite: newFavoriteStatus } 
            : recipe
        )
      );
      
      // Call the appropriate API endpoint based on the action
      if (newFavoriteStatus) {
        await axios.post(`/api/v1/favorites/${recipeId}`);
      } else {
        await axios.delete(`/api/v1/favorites/${recipeId}`);
      }
    } catch (error) {
      console.error('Error toggling favorite status:', error);
      // Revert UI on error
      setRecipes(prevRecipes => 
        prevRecipes.map(recipe => 
          recipe.id === recipeId 
            ? { ...recipe, isFavorite: !recipe.isFavorite } 
            : recipe
        )
      );
    } finally {
      setFavoriteInProgress(null);
    }
  }, [isAuthenticated, navigate, favoriteInProgress, recipes]);

  // Handle voting
  const handleVote = useCallback(async (recipeId: string, voteType: 'up' | 'down', event: React.MouseEvent) => {
    event.stopPropagation();
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }

    // Check if this is the user's own recipe
    const recipe = recipes.find(r => r.id === recipeId);
    if (recipe?.authorId === user?.id) {
      // Prevent voting on user's own recipes
      return;
    }

    if (votingInProgress === recipeId) return;
    setVotingInProgress(recipeId);

    try {
      const response = await axios.post(`/v1/recipes/${recipeId}/vote`, { voteType });
      const updatedRecipe = response.data;
      
      // Update the recipes state with the new vote counts
      setRecipes(prevRecipes => 
        prevRecipes.map(recipe => 
          recipe.id === recipeId 
            ? { 
                ...recipe, 
                upvotes: updatedRecipe.upvotes, 
                downvotes: updatedRecipe.downvotes,
                userVote: updatedRecipe.userVote 
              } 
            : recipe
        )
      );
    } catch (error) {
      console.error('Error voting:', error);
    } finally {
      setVotingInProgress(null);
    }
  }, [isAuthenticated, navigate, recipes, user, votingInProgress]);

  // Filter recipes based on search term
  const filteredRecipes = recipes.filter(recipe => 
    !searchTerm || 
    recipe.mealName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (recipe.authorName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipe.ingredientsUsed.some(i => i.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  };

  // Navigate to recipe detail
  const goToRecipeDetail = useCallback((recipeId: string) => {
    navigate(`/recipes/${recipeId}`);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-indigo-900/20 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mt-12 -mr-12 z-0"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full -mb-10 -ml-10 z-0"></div>
            <div className="relative z-10">
              <h1 className="text-2xl md:text-3xl font-bold text-white">Community Recipes</h1>
              <p className="text-blue-100 mt-2">Discover delicious recipes shared by our community</p>
            </div>
          </div>

          {/* Search bar */}
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <div className="relative max-w-md mx-auto">
              <input
                type="text"
                placeholder="Search recipes, ingredients, or users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 pl-12 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm text-gray-800 dark:text-white"
              />
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            </div>
          </div>

          {/* Content section */}
          <div className="p-6">
            {/* Loading state */}
            {loading ? (
              <div className="flex justify-center items-center py-16">
                <LoadingSpinner size="large" />
              </div>
            ) : error ? (
              <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-5 rounded-lg mx-auto max-w-xl">
                <p className="font-medium mb-2">Error Loading Recipes</p>
                <p className="mb-4 text-sm">{error}</p>
                <button 
                  onClick={fetchAllRecipes} 
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  Try Again
                </button>
              </div>
            ) : filteredRecipes.length === 0 ? (
              <div className="text-center py-16 max-w-md mx-auto">
                {searchTerm ? (
                  <div>
                    <div className="text-gray-400 text-5xl mb-4">🔍</div>
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No Matching Recipes</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      No recipes found matching "{searchTerm}"
                    </p>
                    <button 
                      onClick={() => setSearchTerm('')} 
                      className="text-blue-600 hover:text-blue-700"
                    >
                      Clear search
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="text-gray-400 text-5xl mb-4">🍽️</div>
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No Recipes Yet</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                      Be the first to share a recipe with our community!
                    </p>
                    <button 
                      onClick={() => navigate('/recipe/create')} 
                      className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
                    >
                      Create a Recipe
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {filteredRecipes.map((recipe, index) => (
                  <div 
                    key={recipe.id} 
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden transform hover:-translate-y-1"
                    data-aos="fade-up"
                    data-aos-delay={index * 50}
                  >
                    <div className="flex flex-col md:flex-row">
                      {/* Recipe image */}
                      {recipe.imageUrl ? (
                        <div 
                          className="md:w-1/3 h-64 md:h-auto cursor-pointer relative overflow-hidden"
                          onClick={() => goToRecipeDetail(recipe.id)}
                        >
                          <img 
                            src={recipe.imageUrl} 
                            alt={recipe.mealName} 
                            className="w-full h-full object-cover transition-transform hover:scale-110 duration-500"
                          />
                        </div>
                      ) : (
                        <div 
                          className="md:w-1/3 h-64 md:h-auto bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 flex items-center justify-center cursor-pointer"
                          onClick={() => goToRecipeDetail(recipe.id)}
                        >
                          <span className="text-6xl">🍽️</span>
                        </div>
                      )}
                      
                      {/* Recipe content */}
                      <div className="p-6 md:w-2/3 flex flex-col justify-between">
                        {/* Recipe header */}
                        <div>
                          <div className="flex justify-between items-start mb-3">
                            <h2 
                              className="text-xl font-bold text-gray-800 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                              onClick={() => goToRecipeDetail(recipe.id)}
                            >
                              {recipe.mealName}
                            </h2>
                            <button 
                              onClick={(e) => toggleFavorite(recipe.id, e)}
                              className={`text-2xl ${favoriteInProgress === recipe.id ? 'opacity-50' : ''}`}
                              disabled={favoriteInProgress === recipe.id}
                              aria-label={recipe.isFavorite ? "Remove from favorites" : "Add to favorites"}
                            >
                              {recipe.isFavorite ? 
                                <FaHeart className="text-red-500 hover:text-red-600 transition-colors" /> : 
                                <FaRegHeart className="text-gray-400 hover:text-red-500 transition-colors" />
                              }
                            </button>
                          </div>
                          
                          {/* Author and date */}
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                            <FaUserCircle className="mr-1" />
                            <span className="mr-3">{recipe.authorName || 'Anonymous'}</span>
                            {recipe.createdAt && (
                              <>
                                <span className="mx-2">•</span>
                                <span>{formatDate(recipe.createdAt)}</span>
                              </>
                            )}
                            {recipe.prepTimeMinutes && (
                              <>
                                <span className="mx-2">•</span>
                                <FaClock className="mr-1" />
                                <span>{recipe.prepTimeMinutes} min</span>
                              </>
                            )}
                          </div>
                          
                          {/* Ingredients preview */}
                          <div className="mb-4">
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              <span className="font-medium">Ingredients: </span>
                              {recipe.ingredientsUsed?.slice(0, 5).join(', ')}
                              {recipe.ingredientsUsed?.length > 5 ? ' and more...' : ''}
                            </p>
                          </div>
                        </div>
                        
                        {/* Recipe actions */}
                        <div className="flex items-center justify-between mt-4">
                          {/* Voting and comments */}
                          <div className="flex items-center space-x-4">
                            {/* Upvote */}
                            <button 
                              onClick={(e) => handleVote(recipe.id, 'up', e)}
                              disabled={votingInProgress === recipe.id || recipe.authorId === user?.id}
                              className={`flex items-center space-x-1 px-2 py-1 rounded-lg transition-colors ${
                                recipe.authorId === user?.id ? 'cursor-not-allowed opacity-50' :
                                recipe.userVote === 'up' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 
                                'hover:bg-gray-100 dark:hover:bg-gray-700'
                              }`}
                            >
                              <FaThumbsUp className={recipe.userVote === 'up' ? 'text-green-500' : ''} />
                              <span>{recipe.upvotes || 0}</span>
                            </button>
                            
                            {/* Downvote */}
                            <button 
                              onClick={(e) => handleVote(recipe.id, 'down', e)}
                              disabled={votingInProgress === recipe.id || recipe.authorId === user?.id}
                              className={`flex items-center space-x-1 px-2 py-1 rounded-lg transition-colors ${
                                recipe.authorId === user?.id ? 'cursor-not-allowed opacity-50' :
                                recipe.userVote === 'down' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 
                                'hover:bg-gray-100 dark:hover:bg-gray-700'
                              }`}
                            >
                              <FaThumbsDown className={recipe.userVote === 'down' ? 'text-red-500' : ''} />
                              <span>{recipe.downvotes || 0}</span>
                            </button>
                            
                            {/* Comments */}
                            <button 
                              onClick={() => goToRecipeDetail(recipe.id)}
                              className="flex items-center space-x-1 px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                              <FaComment className="text-blue-500" />
                              <span>{recipe.commentCount || 0}</span>
                            </button>
                          </div>
                          
                          {/* View recipe */}
                          <button 
                            onClick={() => goToRecipeDetail(recipe.id)}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm"
                          >
                            View Recipe
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllRecipes; 