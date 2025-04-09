import React, { useState, useEffect } from 'react';
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
  // Use local state for immediate visual feedback
  const [visuallyActive, setVisuallyActive] = useState(isFavorite);
  
  // Keep visual state in sync with prop
  useEffect(() => {
    setVisuallyActive(isFavorite);
  }, [isFavorite]);
  
  const btnClasses = `${isInModal ? 'px-8 py-4' : 'px-4 py-3'} rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ${
    visuallyActive 
      ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30' 
      : 'bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
  }`;
  
  const iconClasses = isInModal ? "mr-3 text-xl" : "";
  const textClasses = isInModal ? "text-lg font-semibold" : "";
  
  // Handle click with immediate visual feedback
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (isTogglingFavorite) return;
    
    // Toggle visual state immediately
    setVisuallyActive(!visuallyActive);
    setIsTogglingFavorite(true);
    
    // Call parent handler
    onToggleFavorite()
      .catch((error) => {
        // Revert on error
        console.error('Error toggling favorite:', error);
        setVisuallyActive(visuallyActive);
      })
      .finally(() => {
        setIsTogglingFavorite(false);
      });
  };
  
  return (
    <button
      onClick={handleClick}
      disabled={isTogglingFavorite}
      className={btnClasses}
      aria-label={visuallyActive ? 'Remove from favorites' : 'Add to favorites'}
      style={{ willChange: 'transform, background-color' }}
    >
      <div className={isTogglingFavorite ? `animate-pulse ${iconClasses}` : iconClasses}>
        {visuallyActive ? 
          <FaHeart className="text-red-500" /> : 
          <FaRegHeart className={isInModal ? "text-gray-600 dark:text-gray-400 hover:text-red-400" : "text-blue-600 dark:text-blue-400"} />
        }
      </div>
      <span className={textClasses}>
        {isInModal 
          ? (visuallyActive ? 'Saved to Favorites' : 'Save to Favorites')
          : (visuallyActive ? 'Saved' : 'Save')
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
  console.log('AIGeneratedMealCard: rendering with isFavorite =', isFavorite);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Get recipe name (handle different property names)
  const recipeName = recipe.mealName || 'Untitled Recipe';
  
  // Get ingredients from different possible locations in the data structure
  const ingredients: string[] = 
    (recipe.recipeDetails && 
     typeof recipe.recipeDetails !== 'string' && 
     recipe.recipeDetails.ingredientsList) ? 
      (recipe.recipeDetails as RecipeDetails).ingredientsList : 
      (recipe.ingredientsUsed || []);

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

        <div className="mb-6 flex justify-center relative z-10">
          {recipe.imageUrl ? (
            <div className="relative w-full max-w-md overflow-hidden rounded-xl shadow-xl transform transition-all duration-500 hover:scale-[1.02] group">
              <img
                src={recipe.imageUrl}
                alt={recipeName}
                className="w-full h-[300px] object-cover"
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

          <FavoriteButton isFavorite={isFavorite} onToggleFavorite={onToggleFavorite} />
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
            
            <FavoriteButton isFavorite={isFavorite} onToggleFavorite={onToggleFavorite} isInModal={true} />
          </div>
        </div>
      </Modal>
    </>
  );
};

export default AIGeneratedMealCard;
