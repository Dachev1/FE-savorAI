import React, { useState, useEffect, useRef } from 'react';
import Modal from '../common/Modal/Modal';
import { FaRegCopy, FaHeart, FaRegHeart, FaUtensils, FaList, FaClipboardList, FaInfoCircle, FaChevronRight, FaRobot, FaStar, FaMagic } from 'react-icons/fa';
import { RecipeResponse, RecipeDetails } from '../../types/recipe';

interface AIGeneratedMealCardProps {
  recipe: RecipeResponse;
  isFavorite: boolean;
  onCopy: () => void;
  onToggleFavorite: () => Promise<boolean>;
}

// Separate component for favorite button to handle its own state
const FavoriteButton = ({ 
  isFavorite, 
  onToggleFavorite, 
  isInModal = false 
}: { 
  isFavorite: boolean;
  onToggleFavorite: () => Promise<boolean>;
  isInModal?: boolean;
}) => {
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [internalState, setInternalState] = useState<boolean>(false);
  
  // Only used for debugging
  const buttonId = useRef(`fb-${Math.random().toString(36).substring(2, 8)}`).current;
  
  // Debug state changes
  useEffect(() => {
    console.log(`[DEBUG-FAV ${buttonId}] Initial props isFavorite:`, isFavorite, typeof isFavorite);
  }, []);
  
  // Update internal state when prop changes
  useEffect(() => {
    console.log(`[DEBUG-FAV ${buttonId}] Props changed - isFavorite:`, isFavorite, typeof isFavorite, "isModal:", isInModal);
    const boolValue = isFavorite === true;
    console.log(`[DEBUG-FAV ${buttonId}] Converting to boolean: ${boolValue}`);
    setInternalState(boolValue);
    if (isFavorite !== undefined) setHasError(false);
  }, [isFavorite, buttonId, isInModal]);
  
  // Debug internal state changes
  useEffect(() => {
    console.log(`[DEBUG-FAV ${buttonId}] Internal state updated:`, internalState);
  }, [internalState, buttonId]);
  
  const btnClasses = `${isInModal ? 'px-8 py-4' : 'px-4 py-3'} rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ${
    hasError 
      ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500' 
      : internalState 
        ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30' 
        : 'bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
  }`;
  
  const iconClasses = isInModal ? "mr-3 text-xl" : "";
  const textClasses = isInModal ? "text-lg font-semibold" : "";
  
  // Handle click with immediate visual feedback
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (isTogglingFavorite || hasError) {
      console.log(`[DEBUG-FAV ${buttonId}] Click blocked - isTogglingFavorite:`, isTogglingFavorite, "hasError:", hasError);
      return;
    }
    
    console.log(`[DEBUG-FAV ${buttonId}] Click - toggling from:`, internalState, "to:", !internalState);
    setIsTogglingFavorite(true);
    setHasError(false);
    
    // Update UI immediately for better UX
    setInternalState(!internalState);
    
    // Call parent handler
    onToggleFavorite()
      .then((result) => {
        console.log(`[DEBUG-FAV ${buttonId}] API returned:`, result, typeof result);
        // Ensure boolean result and match server response
        const boolResult = result === true;
        console.log(`[DEBUG-FAV ${buttonId}] Converted API result to boolean:`, boolResult);
        setInternalState(boolResult);
      })
      .catch((error) => {
        console.error(`[DEBUG-FAV ${buttonId}] Error:`, error);
        // Revert to original state on error
        setInternalState(internalState);
        setHasError(true);
      })
      .finally(() => {
        console.log(`[DEBUG-FAV ${buttonId}] Finished toggle operation`);
        setIsTogglingFavorite(false);
      });
  };
  
  return (
    <button
      onClick={handleClick}
      disabled={isTogglingFavorite || hasError}
      className={btnClasses}
      aria-label={hasError ? 'Error saving favorite' : internalState ? 'Remove from favorites' : 'Add to favorites'}
      style={{ willChange: 'transform, background-color' }}
    >
      <div className={isTogglingFavorite ? `animate-pulse ${iconClasses}` : iconClasses}>
        {hasError ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ) : internalState ? (
          <FaHeart className="text-red-500" />
        ) : (
          <FaRegHeart className={isInModal ? "text-gray-600 dark:text-gray-400 hover:text-red-400" : "text-blue-600 dark:text-blue-400"} />
        )}
      </div>
      <span className={textClasses}>
        {hasError 
          ? 'Server Error' 
          : isInModal 
            ? (internalState ? 'Saved to Favorites' : 'Save to Favorites')
            : (internalState ? 'Saved' : 'Save')
        }
      </span>
    </button>
  );
};

const AIGeneratedMealCard: React.FC<AIGeneratedMealCardProps> = ({
  recipe,
  isFavorite,
  onCopy,
  onToggleFavorite,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  // Reset error state when recipe or favorite status changes
  useEffect(() => {
    setHasError(false);
  }, [recipe.id, isFavorite]);

  // Handle favorites toggle
  const handleToggleFavorite = async () => {
    if (isSaving || hasError) {
      console.log('[DEBUG-CARD] Toggle blocked - already saving or has error:', 
        { isSaving, hasError, currentState: isFavorite });
      return isFavorite === true;
    }
    
    console.log('[DEBUG-CARD] Starting toggle favorite from state:', isFavorite);
    setIsSaving(true);
    setHasError(false);
    
    try {
      console.log('[DEBUG-CARD] Calling parent onToggleFavorite function');
      const result = await onToggleFavorite();
      console.log('[DEBUG-CARD] Parent onToggleFavorite returned:', result, typeof result);
      
      // Ensure boolean result
      const boolResult = result === true;
      console.log('[DEBUG-CARD] Converted to boolean:', boolResult);
      
      return boolResult;
    } catch (err) {
      console.error('[DEBUG-CARD] Error in toggle favorite:', err);
      setHasError(true);
      return isFavorite === true;
    } finally {
      console.log('[DEBUG-CARD] Toggle favorite operation completed');
      setIsSaving(false);
    }
  };
  
  // Get recipe name (handle different property names)
  const recipeName = recipe.mealName || 'Untitled Recipe';
  
  // Get ingredients from different possible locations in the data structure
  const ingredients: string[] = 
    (recipe.recipeDetails && 
     typeof recipe.recipeDetails !== 'string' && 
     recipe.recipeDetails.ingredientsList) ? 
      (recipe.recipeDetails as RecipeDetails).ingredientsList : 
      (recipe.ingredientsUsed || []);

  // Process difficulty and cooking time - ensure we have valid values
  const difficulty = recipe.difficulty || 'EASY';
  const cookingTime = recipe.totalTimeMinutes || 30;
  
  // Helper function to get difficulty color
  const getDifficultyColor = (level: string) => {
    switch(level.toUpperCase()) {
      case 'EASY': return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20';
      case 'MEDIUM': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/20';
      case 'HARD': return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20';
      default: return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20';
    }
  };
  
  const difficultyColor = getDifficultyColor(difficulty);
  
  return (
    <>
      <div className="mt-8 bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-blue-900/30 rounded-2xl shadow-2xl p-6 border border-blue-100 dark:border-blue-900/50 transition-all duration-300 hover:shadow-blue-100/50 dark:hover:shadow-blue-500/10 relative overflow-hidden">
        <div className="absolute -top-2 -right-2 flex items-center">
          <div className="animate-pulse z-10">
          </div>
        </div>
        
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-blue-500/5 dark:bg-blue-500/10 rounded-full z-0"></div>
        <div className="absolute top-1/4 -right-8 w-16 h-16 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full z-0"></div>

        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent mb-6 text-center relative z-10">
          {recipeName}
        </h2>

        {/* Add cooking time and difficulty info */}
        <div className="mb-6 flex justify-center gap-4 relative z-10">
          <div className="px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-sm border border-blue-100 dark:border-blue-900/50 bg-white dark:bg-gray-800">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">{cookingTime} min</span>
          </div>
          
          <div className={`px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-sm border border-blue-100 dark:border-blue-900/50 ${difficultyColor}`}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="font-medium">{difficulty}</span>
          </div>
        </div>

        <div className="mb-6 flex justify-center relative z-10">
          {recipe.imageUrl ? (
            <div className="relative w-full max-w-md overflow-hidden rounded-xl shadow-xl transform transition-all duration-500 hover:scale-[1.02] group">
              <img
                src={recipe.imageUrl}
                alt={recipeName}
                className="w-full h-[300px] object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null; // Prevent infinite loop
                  target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center text-white">
                  <div className="flex items-center">
                    <FaStar className="text-yellow-400 mr-1" />
                    <span className="font-medium">AI Chef's Recommendation</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full h-[250px] max-w-md bg-gradient-to-r from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center">
              <span className="text-white text-xl font-medium">Recipe Image Generating...</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-4 justify-between items-center relative z-10">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex-1 min-w-32 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <FaList />
            View Full Recipe
          </button>

          <button
            onClick={onCopy}
            className="px-4 py-3 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <FaRegCopy className="text-blue-600 dark:text-blue-400" />
            Copy Recipe
          </button>

          <FavoriteButton isFavorite={isFavorite} onToggleFavorite={handleToggleFavorite} />
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="max-w-4xl w-full bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl overflow-hidden shadow-2xl transform transition-all duration-500">
          <div className="relative">
            {recipe.imageUrl ? (
              <div className="relative h-96 w-full overflow-hidden">
                <img
                  src={recipe.imageUrl}
                  alt={recipeName}
                  className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              </div>
            ) : (
              <div className="h-64 bg-gradient-to-r from-blue-600 to-indigo-600" />
            )}
            
            <div className="absolute bottom-0 left-0 right-0 p-8 text-center">
              <h2 className="text-5xl font-bold text-white mb-4 font-serif">
                {recipeName}
              </h2>
              
              {/* Add cooking time and difficulty info to modal */}
              <div className="flex justify-center gap-4">
                <div className="px-4 py-2 rounded-lg flex items-center gap-2 bg-white/20 backdrop-blur-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium text-white">{cookingTime} min</span>
                </div>
                
                <div className="px-4 py-2 rounded-lg flex items-center gap-2 bg-white/20 backdrop-blur-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="font-medium text-white">{difficulty}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-12">
            {ingredients.length > 0 && (
              <div className="bg-gradient-to-r from-white to-blue-50 dark:from-gray-800 dark:to-blue-950/30 rounded-2xl p-8 shadow-xl">
                <div className="flex items-center gap-4 mb-8 justify-center">
                  <FaList className="text-blue-600 dark:text-blue-400 text-3xl" />
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">Ingredients</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  {ingredients.map((ingredient: string, idx: number) => (
                    <div key={idx} 
                      className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                        {idx + 1}
                      </span>
                      <span className="text-gray-700 dark:text-gray-200 text-lg">{ingredient}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {recipe.recipeDetails && 
              typeof recipe.recipeDetails !== 'string' && 
              recipe.recipeDetails.equipmentNeeded && 
              recipe.recipeDetails.equipmentNeeded.length > 0 && (
              <div className="bg-gradient-to-r from-white to-blue-50 dark:from-gray-800 dark:to-blue-950/30 rounded-2xl p-8 shadow-xl">
                <div className="flex items-center gap-4 mb-8 justify-center">
                  <FaUtensils className="text-blue-600 dark:text-blue-400 text-3xl" />
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">Equipment Needed</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  {recipe.recipeDetails.equipmentNeeded.map((equipment, idx) => (
                    <div key={idx} 
                      className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300">
                      <FaChevronRight className="text-blue-600 dark:text-blue-400 text-xl" />
                      <span className="text-gray-700 dark:text-gray-200 text-lg">{equipment}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {recipe.recipeDetails && 
             typeof recipe.recipeDetails !== 'string' && 
             recipe.recipeDetails.instructions && 
             recipe.recipeDetails.instructions.length > 0 && (
              <div className="bg-gradient-to-r from-white to-blue-50 dark:from-gray-800 dark:to-blue-950/30 rounded-2xl p-8 shadow-xl">
                <div className="flex items-center gap-4 mb-8 justify-center">
                  <FaClipboardList className="text-blue-600 dark:text-blue-400 text-3xl" />
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">Instructions</h3>
                </div>
                <div className="space-y-6">
                  {recipe.recipeDetails.instructions.map((instruction, idx) => (
                    <div key={idx} 
                      className="flex gap-6 p-6 rounded-xl bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300">
                      <span className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 dark:bg-blue-700 text-white flex items-center justify-center text-xl font-bold">
                        {idx + 1}
                      </span>
                      <p className="text-gray-700 dark:text-gray-200 text-lg leading-relaxed">{instruction}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {recipe.recipeDetails && 
             typeof recipe.recipeDetails !== 'string' && 
             recipe.recipeDetails.servingSuggestions && 
             recipe.recipeDetails.servingSuggestions.length > 0 && (
              <div className="bg-gradient-to-r from-white to-blue-50 dark:from-gray-800 dark:to-blue-950/30 rounded-2xl p-8 shadow-xl">
                <div className="flex items-center gap-4 mb-8 justify-center">
                  <FaInfoCircle className="text-blue-600 dark:text-blue-400 text-3xl" />
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">Serving Tips</h3>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
                  {(recipe.recipeDetails as RecipeDetails).servingSuggestions.map((suggestion: string, index: number) => (
                    <p key={index} className="text-gray-700 dark:text-gray-300 mb-4 text-lg leading-relaxed">
                      {suggestion}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {recipe.recipeDetails && 
             typeof recipe.recipeDetails !== 'string' && 
             recipe.recipeDetails.nutritionalInformation && (
              <div className="bg-gradient-to-r from-white to-blue-50 dark:from-gray-800 dark:to-blue-950/30 rounded-2xl p-8 shadow-xl">
                <div className="flex items-center gap-4 mb-8 justify-center">
                  <FaInfoCircle className="text-blue-600 dark:text-blue-400 text-3xl" />
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">Nutrition Information Per Serving</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {Object.entries((recipe.recipeDetails as RecipeDetails).nutritionalInformation).map(([key, value]) => (
                    <div key={key} 
                      className="p-6 rounded-xl bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 text-center">
                      <p className="text-blue-600 dark:text-blue-400 font-semibold capitalize text-lg mb-2">
                        {key === 'carbohydrates' ? 'Carbs' : key}
                      </p>
                      <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="p-8 bg-gradient-to-r from-white to-blue-50 dark:from-gray-800 dark:to-blue-950/20 flex justify-center gap-6">
            <button
              onClick={onCopy}
              className="flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl hover:scale-105 transition-all duration-300 transform shadow-lg hover:shadow-xl"
            >
              <FaRegCopy className="mr-3 text-xl" />
              <span className="text-lg font-semibold">Copy Recipe</span>
            </button>
            
            <FavoriteButton isFavorite={isFavorite} onToggleFavorite={handleToggleFavorite} isInModal={true} />
          </div>
        </div>
      </Modal>
    </>
  );
};

export default AIGeneratedMealCard;
