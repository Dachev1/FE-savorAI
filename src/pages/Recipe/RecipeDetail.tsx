import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context';
import { LoadingSpinner, MacrosDisplay } from '../../components/common';
import CommentList from '../../components/comments/CommentList';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import favoriteService from '../../services/favoriteService';

interface Recipe {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  ingredients: string[];
  instructions: string[];
  prepTime: number;
  cookTime: number;
  servings: number;
  authorId: string;
  authorName: string;
  macros: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  tags: string[];
  createdAt: string;
  commentCount?: number;
}

const RecipeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/recipes/${id}`);
        setRecipe(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to load recipe details. Please try again later.');
        console.error('Error fetching recipe:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRecipe();
    }
  }, [id]);

  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!user || !recipe?.id) return;
      
      try {
        const status = await favoriteService.checkFavorite(recipe.id);
        setIsFavorite(status);
      } catch (error) {
        console.error('Failed to check favorite status:', error);
      }
    };
    
    checkFavoriteStatus();
  }, [recipe?.id, user]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this recipe?')) {
      return;
    }

    try {
      await axios.delete(`/api/recipes/${id}`);
      navigate('/');
    } catch (err) {
      console.error('Error deleting recipe:', err);
      alert('Failed to delete recipe. Please try again.');
    }
  };

  const toggleFavorite = async () => {
    if (!user || !recipe?.id) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    
    if (isLoading) return;
    
    setIsLoading(true);
    
    // Update UI optimistically
    const newStatus = !isFavorite;
    setIsFavorite(newStatus);
    
    try {
      // Call API to update server state
      await favoriteService.toggleFavorite(recipe.id);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      // Revert optimistic update if the API call fails
      setIsFavorite(!newStatus);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="min-h-[50vh] flex flex-col justify-center items-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
        <p className="text-gray-700 dark:text-gray-300 mb-6">{error || 'Recipe not found'}</p>
        <Link
          to="/"
          className="px-6 py-2 bg-accent hover:bg-blue-600 text-white rounded-lg transition-colors duration-300"
        >
          Return Home
        </Link>
      </div>
    );
  }

  const isAuthor = user && user.id === recipe.authorId;
  const totalTime = recipe.prepTime + recipe.cookTime;

  return (
    <div className="container mx-auto px-4 py-8">
      <article className="max-w-4xl mx-auto">
        {/* Recipe header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-dark dark:text-light">{recipe.title}</h1>
          <div className="flex flex-wrap gap-2 mb-4">
            {recipe.tags.map((tag, index) => (
              <span 
                key={index}
                className="px-3 py-1 bg-softGray dark:bg-gray-700 rounded-full text-sm text-secondary dark:text-gray-300"
              >
                {tag}
              </span>
            ))}
          </div>
          <p className="text-secondary dark:text-gray-300 mb-4">{recipe.description}</p>
          <div className="flex items-center text-sm text-secondary dark:text-gray-400">
            <span>By {recipe.authorName}</span>
            <span className="mx-2">•</span>
            <span>{new Date(recipe.createdAt).toLocaleDateString()}</span>
          </div>
          <button
            onClick={toggleFavorite}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/90 dark:bg-gray-800/90 shadow hover:bg-white dark:hover:bg-gray-700 transition-colors"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="animate-pulse">
                {isFavorite ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
              </div>
            ) : (
              isFavorite ? <FaHeart className="text-red-500" /> : <FaRegHeart />
            )}
            <span>{isFavorite ? 'Saved to Favorites' : 'Add to Favorites'}</span>
          </button>
        </div>

        {/* Actions bar */}
        {isAuthor && (
          <div className="flex gap-3 mb-6">
            <Link
              to={`/recipes/edit/${recipe.id}`}
              className="px-4 py-2 bg-accent hover:bg-blue-600 text-white rounded-lg transition-colors duration-300"
            >
              Edit Recipe
            </Link>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-300"
            >
              Delete
            </button>
          </div>
        )}

        {/* Recipe image */}
        {recipe.imageUrl && (
          <div className="mb-8 rounded-lg overflow-hidden shadow-soft">
            <img 
              src={recipe.imageUrl} 
              alt={recipe.title} 
              className="w-full h-auto object-cover"
            />
          </div>
        )}

        {/* Recipe info cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-softGray dark:bg-gray-800 p-4 rounded-lg text-center">
            <p className="text-sm text-secondary dark:text-gray-400">Prep Time</p>
            <p className="text-lg font-semibold text-dark dark:text-light">{recipe.prepTime} min</p>
          </div>
          <div className="bg-softGray dark:bg-gray-800 p-4 rounded-lg text-center">
            <p className="text-sm text-secondary dark:text-gray-400">Cook Time</p>
            <p className="text-lg font-semibold text-dark dark:text-light">{recipe.cookTime} min</p>
          </div>
          <div className="bg-softGray dark:bg-gray-800 p-4 rounded-lg text-center">
            <p className="text-sm text-secondary dark:text-gray-400">Total Time</p>
            <p className="text-lg font-semibold text-dark dark:text-light">{totalTime} min</p>
          </div>
          <div className="bg-softGray dark:bg-gray-800 p-4 rounded-lg text-center">
            <p className="text-sm text-secondary dark:text-gray-400">Servings</p>
            <p className="text-lg font-semibold text-dark dark:text-light">{recipe.servings}</p>
          </div>
        </div>

        {/* Nutrition info */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-dark dark:text-light">Nutrition Information</h2>
          <MacrosDisplay macros={recipe.macros} />
        </div>

        {/* Ingredients */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-dark dark:text-light">Ingredients</h2>
          <ul className="list-disc pl-5 space-y-2">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index} className="text-secondary dark:text-gray-300">
                {ingredient}
              </li>
            ))}
          </ul>
        </div>

        {/* Instructions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-dark dark:text-light">Instructions</h2>
          <ol className="list-decimal pl-5 space-y-4">
            {recipe.instructions.map((step, index) => (
              <li key={index} className="text-secondary dark:text-gray-300">
                {step}
              </li>
            ))}
          </ol>
        </div>

        {/* Comments section */}
        {id && <CommentList recipeId={id} />}
      </article>
    </div>
  );
};

export default RecipeDetail; 