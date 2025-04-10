import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context';
import { LoadingSpinner } from '../../components/common';
import { FaComment, FaFilter } from 'react-icons/fa';
import AOS from 'aos';
import 'aos/dist/aos.css';
import VoteButtons from '../../components/recipe/VoteButtons';
import RecipeAPI from '../../api/recipeApi';

// Recipe interface with voting functionality
interface Recipe {
  id: string;
  title: string;
  mealName?: string;
  imageUrl?: string;
  authorId?: string;
  authorName?: string;
  username?: string;
  displayName?: string;
  upvotes?: number;
  downvotes?: number;
  commentCount?: number;
  userVote?: 'UPVOTE' | 'DOWNVOTE' | null;
  createdAt?: string;
}

// Sorting options type
type SortOption = 'newest' | 'popular' | 'comments';

const RecipeFeed: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const loaderRef = useRef<HTMLDivElement>(null);

  // Initialize animations
  useEffect(() => {
    AOS.init({ 
      duration: 700,
      once: true,
      easing: 'ease-out-cubic',
      disable: 'mobile'
    });
  }, []);

  // Reset pagination when sort option changes
  useEffect(() => {
    setPage(0);
    setRecipes([]);
    fetchInitialRecipes();
  }, [sortBy]);

  // Setup intersection observer for infinite scrolling
  useEffect(() => {
    if (!hasMore || loadingMore) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          setPage(prevPage => prevPage + 1);
        }
      },
      { threshold: 0.5 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loadingMore]);

  // Fetch more recipes when page changes (skip initial page load)
  useEffect(() => {
    if (page > 0) {
      fetchMoreRecipes();
    }
  }, [page]);

  const fetchInitialRecipes = async () => {
    try {
      setLoading(true);
      const data = await RecipeAPI.getRecipeFeed(0, 10, sortBy);
      
      // Normalize data to ensure authorId and username are set
      const normalizedRecipes = (data.content || []).map((recipe: any) => {
        const normalized = { ...recipe };
        
        // Ensure authorId is set (from createdById if needed)
        if (!normalized.authorId && normalized.createdById) {
          normalized.authorId = normalized.createdById;
        }
        
        // Filter out "Unknown User" values
        if (normalized.username === "Unknown User") {
          normalized.username = null;
        }
        
        // Set display name to username or fallback to user ID
        if (!normalized.username) {
          normalized.displayName = normalized.authorId ? `User: ${normalized.authorId.substring(0, 8)}` : "Unknown";
        } else {
          normalized.displayName = normalized.username;
        }
        
        return normalized;
      });
      
      setRecipes(normalizedRecipes);
      setHasMore(!data.last);
      setError(null);
    } catch (err) {
      console.error('Error fetching recipes:', err);
      setError('Failed to load recipe feed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMoreRecipes = async () => {
    if (!hasMore || loadingMore) return;
    
    try {
      setLoadingMore(true);
      const data = await RecipeAPI.getRecipeFeed(page, 10, sortBy);
      
      // Apply the same normalization to newly loaded recipes
      const normalizedRecipes = (data.content || []).map((recipe: any) => {
        const normalized = { ...recipe };
        
        // Ensure authorId is set (from createdById if needed)
        if (!normalized.authorId && normalized.createdById) {
          normalized.authorId = normalized.createdById;
        }
        
        // Filter out "Unknown User" values
        if (normalized.username === "Unknown User") {
          normalized.username = null;
        }
        
        // Set display name to username or fallback to user ID
        if (!normalized.username) {
          normalized.displayName = normalized.authorId ? `User: ${normalized.authorId.substring(0, 8)}` : "Unknown";
        } else {
          normalized.displayName = normalized.username;
        }
        
        return normalized;
      });
      
      setRecipes(prevRecipes => [...prevRecipes, ...normalizedRecipes]);
      setHasMore(!data.last);
    } catch (err) {
      console.error('Error fetching more recipes:', err);
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSortChange = (option: SortOption) => {
    setSortBy(option);
  };

  const handleVoteChange = useCallback((recipeId: string, updatedVote: { upvotes: number, downvotes: number, userVote: 'UPVOTE' | 'DOWNVOTE' | null }) => {
    setRecipes(prevRecipes => 
      prevRecipes.map(recipe => 
        recipe.id === recipeId 
          ? { ...recipe, ...updatedVote } 
          : recipe
      )
    );
  }, []);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  };

  const goToRecipeDetail = useCallback((recipeId: string) => {
    navigate(`/recipes/${recipeId}`);
  }, [navigate]);

  const goToComments = useCallback((recipeId: string) => {
    navigate(`/recipes/${recipeId}`, { state: { openComments: true } });
  }, [navigate]);

  const debugRecipe = async (recipeId: string) => {
    try {
      const debugData = await RecipeAPI.getRecipeDebug(recipeId);
      
      // Update this recipe in the list with the data from debug endpoint
      setRecipes(prevRecipes => 
        prevRecipes.map(recipe => 
          recipe.id === recipeId 
            ? { 
                ...recipe, 
                username: debugData.username
              } 
            : recipe
        )
      );
    } catch (error) {
      console.error('Error refreshing recipe data:', error);
    }
  };

  // Helper function to determine empty state message based on sort option
  const getEmptyStateMessage = () => {
    if (sortBy === 'newest') return 'Be the first to share a delicious recipe!';
    if (sortBy === 'popular') return 'No recipes have been upvoted yet. Try a different filter!';
    return 'No recipes have comments yet. Try a different filter!';
  };

  const renderEmptyState = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-10 text-center">
      <svg className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
      <h3 className="text-2xl font-medium text-gray-700 dark:text-gray-300 mb-3">No recipes found</h3>
      <p className="text-gray-500 dark:text-gray-400 text-lg mb-6">
        {getEmptyStateMessage()}
      </p>
      {sortBy !== 'newest' && (
        <button 
          onClick={() => handleSortChange('newest')}
          className="px-6 py-3 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          View newest recipes
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mt-10 -mr-10 z-0"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -mb-8 -ml-8 z-0"></div>
            <div className="relative z-10">
              <h1 className="text-3xl md:text-4xl font-extrabold text-white">Recipe Feed</h1>
              <p className="text-blue-100 mt-3 text-lg">Discover delicious recipes created by our community</p>
            </div>
          </div>
        </div>

        {/* Sort Options */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-6 flex flex-wrap items-center gap-2">
          <div className="flex items-center mr-3 text-gray-700 dark:text-gray-300">
            <FaFilter className="mr-2" />
            <span className="font-medium">Sort by:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {(['newest', 'popular', 'comments'] as const).map(option => (
              <button 
                key={option}
                onClick={() => handleSortChange(option)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  sortBy === option 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {option === 'newest' ? 'Newest' : 
                 option === 'popular' ? 'Most Upvoted' : 'Most Commented'}
              </button>
            ))}
          </div>
        </div>

        {/* Recipe Feed */}
        <div className="grid gap-8">
          {loading && page === 0 ? (
            <div className="py-20 flex flex-col justify-center items-center">
              <LoadingSpinner size="large" />
              <p className="mt-4 text-gray-600 dark:text-gray-400 animate-pulse">Loading delicious recipes...</p>
            </div>
          ) : error ? (
            <div className="bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-6 rounded-xl shadow-md">
              <div className="flex items-center justify-center">
                <svg className="w-8 h-8 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-center font-medium">{error}</p>
              </div>
              <div className="mt-4 text-center">
                <button 
                  onClick={fetchInitialRecipes}
                  className="px-4 py-2 bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200 rounded-lg hover:bg-red-300 dark:hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : recipes.length === 0 ? (
            renderEmptyState()
          ) : (
            <>
              {recipes.map((recipe, index) => (
                <div 
                  key={recipe.id}
                  data-aos="fade-up" 
                  data-aos-delay={Math.min(index, 5) * 50} 
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Image */}
                    {recipe.imageUrl && (
                      <div 
                        className="md:w-2/5 h-64 md:h-auto bg-gray-200 dark:bg-gray-700 relative overflow-hidden cursor-pointer"
                        onClick={() => goToRecipeDetail(recipe.id)}
                      >
                        <img 
                          src={recipe.imageUrl} 
                          alt={recipe.title || recipe.mealName || 'Recipe image'} 
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      </div>
                    )}
                    
                    {/* Content */}
                    <div className="p-6 md:w-3/5 flex flex-col justify-between">
                      {/* Title */}
                      <div>
                        <h2 
                          className="font-bold text-xl md:text-2xl text-gray-800 dark:text-white mb-3 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          onClick={() => goToRecipeDetail(recipe.id)}
                        >
                          {recipe.title || recipe.mealName || 'Untitled Recipe'}
                        </h2>

                        {/* Author display - with ability to refresh name data */}
                        <div className="flex items-center mb-4">
                          <div 
                            className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold text-sm mr-3 cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                            onClick={() => debugRecipe(recipe.id)}
                            title="Click to refresh author info"
                          >
                            {recipe.authorId 
                              ? recipe.authorId.substring(0, 2).toUpperCase() 
                              : 'ID'}
                          </div>
                          <div className="flex flex-col">
                            <span 
                              className="font-medium text-gray-800 dark:text-gray-200 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                              onClick={() => debugRecipe(recipe.id)}
                              title="Click to refresh author info"
                            >
                              {recipe.displayName || (recipe.authorId ? `User: ${recipe.authorId.substring(0, 8)}` : 'Unknown')}
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {formatDate(recipe.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Interactions */}
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                        <VoteButtons 
                          recipeId={recipe.id}
                          authorId={recipe.authorId || ''}
                          upvotes={recipe.upvotes}
                          downvotes={recipe.downvotes}
                          userVote={recipe.userVote}
                          onVoteChange={(updatedVote) => handleVoteChange(recipe.id, updatedVote)}
                          size="medium"
                        />
                        
                        <div className="flex gap-2">
                          <button 
                            onClick={() => goToComments(recipe.id)}
                            className="flex items-center gap-2 py-2 px-4 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                          >
                            <FaComment className="text-blue-500 dark:text-blue-400" />
                            <span>{recipe.commentCount || 0} Comments</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Loading indicator */}
              {hasMore && (
                <div 
                  ref={loaderRef} 
                  className="py-8 flex justify-center"
                >
                  {loadingMore ? (
                    <LoadingSpinner size="medium" />
                  ) : (
                    <div className="h-12 w-full"></div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecipeFeed; 