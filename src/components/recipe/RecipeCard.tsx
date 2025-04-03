import React, { useState, useEffect } from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import favoriteService from '../../services/favoriteService';
import { useNavigate, useLocation } from 'react-router-dom';

const RecipeCard: React.FC = () => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkFavorite = async () => {
      try {
        const status = await favoriteService.checkFavorite(recipe.id);
        setIsFavorite(status);
      } catch (error) {
        console.error('Failed to check favorite status:', error);
      }
    };
    
    checkFavorite();
  }, [recipe.id]);

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (!isAuthenticated) {
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={toggleFavorite}
      className="absolute top-3 right-3 p-2 bg-white/80 dark:bg-gray-800/80 rounded-full shadow hover:bg-white dark:hover:bg-gray-700 transition-colors"
      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      {isLoading ? (
        <div className="animate-pulse">
          {isFavorite ? 
            <FaHeart className="text-red-500" /> : 
            <FaRegHeart className="text-gray-500" />
          }
        </div>
      ) : (
        isFavorite ? 
          <FaHeart className="text-red-500" /> : 
          <FaRegHeart className="text-gray-500 hover:text-red-400" />
      )}
    </button>
  );
};

export default RecipeCard; 