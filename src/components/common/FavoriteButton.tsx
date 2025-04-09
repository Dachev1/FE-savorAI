import React, { useState, useEffect } from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import { favoriteService } from '../../services/favoriteService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

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
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Update state when initialState prop changes
  useEffect(() => {
    if (initialState !== undefined) {
      setIsFavorite(initialState);
    }
  }, [initialState]);

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
    
    // Update UI optimistically
    const newStatus = !isFavorite;
    setIsFavorite(newStatus);
    
    try {
      // Call API to update server state
      const result = await favoriteService.toggleFavorite(recipeId);
      
      // Force update state to match server result
      setIsFavorite(result);
      
      // Show toast notification
      if (result) {
        showToast('Recipe added to favorites!', 'favorite');
      } else {
        showToast('Recipe removed from favorites', 'success');
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      // Revert optimistic update if the API call fails
      setIsFavorite(!newStatus);
      showToast('Failed to update favorites', 'error');
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
        isFavorite ? 
          <FaHeart className="text-red-500 animate-heartbeat" style={{animation: isFavorite ? 'heartbeat 0.6s ease-in-out' : 'none'}} /> : 
          <FaRegHeart className="transition-colors duration-300" />
      )}
      
      {showText && <span>{isFavorite ? 'Saved' : 'Add to Favorites'}</span>}
    </button>
  );
};

export default FavoriteButton; 