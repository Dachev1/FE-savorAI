import React, { useState, useEffect } from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import favoriteService from '../../services/favoriteService';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context';

interface RecipeCardProps {
  recipe: {
    id: string;
    title?: string;
  };
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const isAuthenticated = Boolean(user);

  useEffect(() => {
    // Skip checking favorite status if not authenticated
    if (!isAuthenticated) return;
    
    const checkFavorite = async () => {
      try {
        const status = await favoriteService.checkFavorite(recipe.id);
        setIsFavorite(status);
      } catch (error) {
        console.error('Failed to check favorite status:', error);
        // Don't update state on error - keep previous value
      }
    };
    
    checkFavorite();
  }, [recipe.id, isAuthenticated]);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (!isAuthenticated) {
      // Redirect to login with return path
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const newStatus = await favoriteService.toggleFavorite(recipe.id);
      setIsFavorite(newStatus);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      // Show a user-friendly error message
      alert('Unable to update favorite status. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const ariaLabel = isFavorite ? `Remove ${recipe.title || 'recipe'} from favorites` : `Add ${recipe.title || 'recipe'} to favorites`;

  return (
    <button
      onClick={toggleFavorite}
      className="absolute top-3 right-3 p-2 bg-white/80 dark:bg-gray-800/80 rounded-full shadow hover:bg-white dark:hover:bg-gray-700 transition-colors"
      aria-label={ariaLabel}
      disabled={isLoading}
      type="button"
    >
      {isLoading ? (
        <div className="animate-pulse" aria-hidden="true">
          {isFavorite ? 
            <FaHeart className="text-red-500" /> : 
            <FaRegHeart className="text-gray-500" />
          }
        </div>
      ) : (
        isFavorite ? 
          <FaHeart className="text-red-500" aria-hidden="true" /> : 
          <FaRegHeart className="text-gray-500 hover:text-red-400" aria-hidden="true" />
      )}
      <span className="sr-only">{ariaLabel}</span>
    </button>
  );
};

export default React.memo(RecipeCard); 