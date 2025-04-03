import React, { useState, useEffect } from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import favoriteService from '../../services/favoriteService';
import { useAuth } from '../../hooks/useAuth'; // Adjust to your auth hook

interface FavoriteButtonProps {
  recipeId: string;
  initialState?: boolean;
  showText?: boolean;
  className?: string;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({ 
  recipeId, 
  initialState,
  showText = false,
  className = ''
}) => {
  const [isFavorite, setIsFavorite] = useState(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecked, setIsChecked] = useState(!!initialState);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isChecked && isAuthenticated) {
      const checkFavorite = async () => {
        try {
          const status = await favoriteService.checkFavorite(recipeId);
          setIsFavorite(status);
          setIsChecked(true);
        } catch (error) {
          console.error('Failed to check favorite status:', error);
        }
      };
      
      checkFavorite();
    }
  }, [recipeId, isChecked, isAuthenticated]);

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
      const newStatus = await favoriteService.toggleFavorite(recipeId);
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
      disabled={isLoading}
      className={`flex items-center gap-2 rounded-lg transition-all duration-200 ${
        isFavorite 
          ? 'text-red-500 hover:text-red-600' 
          : 'text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400'
      } ${className}`}
      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      {isLoading ? (
        <div className="animate-pulse">
          {isFavorite ? <FaHeart /> : <FaRegHeart />}
        </div>
      ) : (
        isFavorite ? <FaHeart /> : <FaRegHeart />
      )}
      
      {showText && <span>{isFavorite ? 'Saved' : 'Add to Favorites'}</span>}
    </button>
  );
};

export default FavoriteButton; 