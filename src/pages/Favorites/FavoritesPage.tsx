import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axiosConfig';
import { FaHeart, FaHeartBroken } from 'react-icons/fa';

// Add interface for recipe
interface Recipe {
  id: string;
  mealName?: string;
  title?: string;
  ingredientsUsed?: string[];
}

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('/v1/favorites');
        setFavorites(response.data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch favorites:', err);
        setError('Unable to load favorite recipes');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-indigo-900/20 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-red-500 to-pink-600 p-8 relative overflow-hidden">
            <div className="relative z-10 text-white">
              <h1 className="text-2xl md:text-3xl font-bold">My Favorite Recipes</h1>
              <p className="text-pink-100 mt-2">Your saved recipes for easy access</p>
            </div>
          </div>
          
          <div className="p-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 mb-6 rounded-lg">
                <p>{error}</p>
              </div>
            )}
            
            {favorites.length === 0 ? (
              <div className="text-center py-12">
                <div className="mb-4">
                  <FaHeartBroken className="text-4xl text-gray-400 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No Favorites Yet</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
                  You haven't added any recipes to your favorites yet.
                </p>
                <button 
                  onClick={() => navigate('/recipes')}
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg"
                >
                  Browse Recipes
                </button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {favorites.map(recipe => (
                  <div 
                    key={recipe.id} 
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg cursor-pointer"
                    onClick={() => navigate(`/recipes/${recipe.id}`)}
                  >
                    <div className="p-4">
                      <h3 className="font-semibold text-lg text-gray-800 dark:text-white mb-2">
                        {recipe.mealName || recipe.title}
                      </h3>
                      {recipe.ingredientsUsed && (
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                          {recipe.ingredientsUsed.slice(0, 3).join(', ')}
                          {recipe.ingredientsUsed.length > 3 ? ' and more...' : ''}
                        </p>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-blue-500">View Recipe</span>
                        <FaHeart className="text-red-500" />
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

export default FavoritesPage; 