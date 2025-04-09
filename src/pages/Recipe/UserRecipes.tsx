import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axiosConfig';
import { FaPlus, FaSearch, FaEdit, FaEye, FaThumbsUp, FaThumbsDown, FaComment } from 'react-icons/fa';
import { LoadingSpinner } from '../../components/common';
import AOS from 'aos';
import 'aos/dist/aos.css';

// Enhanced recipe type with vote and comment counts
interface Recipe {
  id: string;
  mealName: string;
  title?: string;
  description?: string;
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
}

const UserRecipes: React.FC = () => {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Initialize animations
  useEffect(() => {
    AOS.init({ 
      duration: 700,
      once: true,
      easing: 'ease-out-cubic',
    });
  }, []);

  // Fetch user's recipes
  useEffect(() => {
    fetchMyRecipes();
  }, []);

  const fetchMyRecipes = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/v1/recipes/user');
      setRecipes(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching recipes:', err);
      setError('Failed to load your recipes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter recipes based on search term
  const filteredRecipes = recipes.filter(recipe => 
    !searchTerm || 
    (recipe.mealName || recipe.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (recipe.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (recipe.ingredientsUsed || []).some(i => i.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-indigo-900/20 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mt-12 -mr-12 z-0"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full -mb-10 -ml-10 z-0"></div>
            <div className="relative z-10 flex justify-between items-center">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">My Recipes</h1>
                <p className="text-blue-100 mt-2">Your personal collection of created recipes</p>
              </div>
              <button
                onClick={() => navigate('/recipe/create')}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg flex items-center transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                <FaPlus className="mr-2" /> Create Recipe
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <div className="relative max-w-md mx-auto">
              <input
                type="text"
                placeholder="Search your recipes..."
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
                  onClick={fetchMyRecipes} 
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
                    <div className="text-gray-400 text-5xl mb-4">👨‍🍳</div>
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No Recipes Yet</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                      You haven't created any recipes yet. Get started by creating your first recipe!
                    </p>
                    <button 
                      onClick={() => navigate('/recipe/create')} 
                      className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
                    >
                      <FaPlus className="inline mr-2" /> Create Recipe
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRecipes.map((recipe, index) => (
                  <div 
                    key={recipe.id} 
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden transform hover:-translate-y-1 cursor-pointer"
                    onClick={() => navigate(`/recipes/${recipe.id}`)}
                    data-aos="fade-up"
                    data-aos-delay={index * 50}
                  >
                    {recipe.imageUrl ? (
                      <div className="h-44 relative overflow-hidden">
                        <img 
                          src={recipe.imageUrl} 
                          alt={recipe.mealName || recipe.title || 'Recipe'} 
                          className="w-full h-full object-cover transition-transform hover:scale-110 duration-500"
                        />
                      </div>
                    ) : (
                      <div className="h-44 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 flex items-center justify-center">
                        <span className="text-4xl">🍽️</span>
                      </div>
                    )}
                    
                    <div className="p-5">
                      <h2 className="font-bold text-lg text-gray-800 dark:text-white mb-3">
                        {recipe.mealName || recipe.title}
                      </h2>
                      
                      {/* Stats row */}
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4 space-x-4">
                        <div className="flex items-center">
                          <FaThumbsUp className="mr-1 text-green-500" />
                          <span>{recipe.upvotes || 0}</span>
                        </div>
                        <div className="flex items-center">
                          <FaThumbsDown className="mr-1 text-red-500" />
                          <span>{recipe.downvotes || 0}</span>
                        </div>
                        <div className="flex items-center">
                          <FaComment className="mr-1 text-blue-500" />
                          <span>{recipe.commentCount || 0}</span>
                        </div>
                      </div>
                      
                      {/* Action buttons */}
                      <div className="flex gap-2 mt-auto">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/recipes/${recipe.id}`);
                          }}
                          className="flex-1 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
                        >
                          <FaEye className="mr-2" /> View
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/recipe/create/${recipe.id}`);
                          }}
                          className="flex-1 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center"
                        >
                          <FaEdit className="mr-2" /> Edit
                        </button>
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

export default UserRecipes; 