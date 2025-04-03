import React, { useState } from 'react';
import Modal from '../common/Modal/Modal';
import { FaRegCopy, FaHeart, FaRegHeart, FaUtensils, FaList, FaClipboardList, FaInfoCircle, FaClock, FaChevronRight } from 'react-icons/fa';
import { RecipeResponse, RecipeDetails } from '../../types/recipe';

interface AIGeneratedMealCardProps {
  recipe: RecipeResponse;
  isFavorite: boolean;
  copySuccess: string;
  onCopy: () => void;
  onToggleFavorite: () => void;
}

const AIGeneratedMealCard: React.FC<AIGeneratedMealCardProps> = ({
  recipe,
  isFavorite,
  onCopy,
  onToggleFavorite,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

  // Get recipe name (handle different property names)
  const recipeName = recipe.mealName || 'Untitled Recipe';
  
  // Get ingredients from different possible locations in the data structure
  const ingredients: string[] = 
    (recipe.recipeDetails && 
     typeof recipe.recipeDetails !== 'string' && 
     recipe.recipeDetails.ingredientsList) ? 
      (recipe.recipeDetails as RecipeDetails).ingredientsList : 
      (recipe.ingredientsUsed || []);

  // Enhanced favorite toggle handler with loading state
  const handleFavoriteToggle = async () => {
    setIsTogglingFavorite(true);
    try {
      await onToggleFavorite();
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  return (
    <>
      <div
        className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-200 dark:border-gray-700 transition-all duration-300"
      >
        <h2 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-6 text-center">
          {recipeName}
        </h2>

        <div className="mb-6 flex justify-center">
          {recipe.imageUrl && (
            <img
              src={recipe.imageUrl}
              alt={recipeName}
              className="w-full max-w-md h-auto rounded-xl object-cover shadow-md"
            />
          )}
        </div>

        <div className="flex flex-wrap gap-4 justify-between items-center">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex-1 min-w-32 px-4 py-2 bg-accent hover:bg-accent/90 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <FaList />
            View Recipe Details
          </button>

          <button
            onClick={onCopy}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <FaRegCopy />
            Copy
          </button>

          <button
            onClick={handleFavoriteToggle}
            disabled={isTogglingFavorite}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
              isFavorite 
                ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30' 
                : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {isTogglingFavorite ? (
              <div className="animate-pulse">
                {isFavorite ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
              </div>
            ) : (
              isFavorite ? <FaHeart className="text-red-500" /> : <FaRegHeart />
            )}
            {isFavorite ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="max-w-4xl w-full bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-2xl transform transition-all duration-500">
          {/* Hero Section with Image */}
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
              <div className="h-48 bg-gradient-to-r from-accent to-blue-600" />
            )}
            
            {/* Recipe Title */}
            <div className="absolute bottom-0 left-0 right-0 p-8 text-center">
              <h2 className="text-5xl font-bold text-white mb-4 font-serif">
                {recipeName}
              </h2>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-8 space-y-12">
            {/* Ingredients Section */}
            {ingredients.length > 0 && (
              <div className="bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 shadow-xl">
                <div className="flex items-center gap-4 mb-8 justify-center">
                  <FaList className="text-accent text-3xl" />
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-accent to-blue-600 bg-clip-text text-transparent">Ingredients</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  {ingredients.map((ingredient: string, idx: number) => (
                    <div key={idx} 
                      className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-gray-700 shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center font-bold">
                        {idx + 1}
                      </span>
                      <span className="text-gray-700 dark:text-gray-200 text-lg">{ingredient}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Equipment Section */}
            {recipe.recipeDetails && 
              typeof recipe.recipeDetails !== 'string' && 
              recipe.recipeDetails.equipmentNeeded && 
              recipe.recipeDetails.equipmentNeeded.length > 0 && (
              <div className="bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 shadow-xl">
                <div className="flex items-center gap-4 mb-8 justify-center">
                  <FaUtensils className="text-accent text-3xl" />
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-accent to-blue-600 bg-clip-text text-transparent">Equipment Needed</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  {recipe.recipeDetails.equipmentNeeded.map((equipment, idx) => (
                    <div key={idx} 
                      className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-gray-700 shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300">
                      <FaChevronRight className="text-accent text-xl" />
                      <span className="text-gray-700 dark:text-gray-200 text-lg">{equipment}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Instructions Section */}
            {recipe.recipeDetails && 
             typeof recipe.recipeDetails !== 'string' && 
             recipe.recipeDetails.instructions && 
             recipe.recipeDetails.instructions.length > 0 && (
              <div className="bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 shadow-xl">
                <div className="flex items-center gap-4 mb-8 justify-center">
                  <FaClipboardList className="text-accent text-3xl" />
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-accent to-blue-600 bg-clip-text text-transparent">Instructions</h3>
                </div>
                <div className="space-y-6">
                  {recipe.recipeDetails.instructions.map((instruction, idx) => (
                    <div key={idx} 
                      className="flex gap-6 p-6 rounded-xl bg-white dark:bg-gray-700 shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300">
                      <span className="flex-shrink-0 w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center text-xl font-bold">
                        {idx + 1}
                      </span>
                      <p className="text-gray-700 dark:text-gray-200 text-lg leading-relaxed">{instruction}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Serving Suggestions Section */}
            {recipe.recipeDetails && 
             typeof recipe.recipeDetails !== 'string' && 
             recipe.recipeDetails.servingSuggestions && 
             recipe.recipeDetails.servingSuggestions.length > 0 && (
              <div className="mt-6">
                <h3 className="flex items-center gap-2 text-xl font-semibold text-blue-600 dark:text-blue-400 mb-3">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"></path>
                  </svg>
                  Serving Suggestions
                </h3>
                
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-inner">
                  {(recipe.recipeDetails as RecipeDetails).servingSuggestions.map((suggestion: string, index: number) => (
                    <p key={index} className="text-gray-700 dark:text-gray-300 mb-2 text-justify leading-relaxed">
                      {suggestion}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Nutritional Information */}
            {recipe.recipeDetails && 
             typeof recipe.recipeDetails !== 'string' && 
             recipe.recipeDetails.nutritionalInformation && (
              <div className="bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 shadow-xl">
                <div className="flex items-center gap-4 mb-8 justify-center">
                  <FaInfoCircle className="text-accent text-3xl" />
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-accent to-blue-600 bg-clip-text text-transparent">Nutritional Information</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {Object.entries((recipe.recipeDetails as RecipeDetails).nutritionalInformation).map(([key, value]) => (
                    <div key={key} 
                      className="p-6 rounded-xl bg-white dark:bg-gray-700 shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 text-center">
                      <p className="text-accent font-semibold capitalize text-lg mb-2">
                        {key === 'carbohydrates' ? 'Carbs' : key}
                      </p>
                      <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-8 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 flex justify-center gap-6">
            <button
              onClick={onCopy}
              className="flex items-center px-8 py-4 bg-accent text-white rounded-xl hover:bg-accent/90 transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
            >
              <FaRegCopy className="mr-3 text-xl" />
              <span className="text-lg font-semibold">Copy Recipe</span>
            </button>
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-8 py-4 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-xl text-lg font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default AIGeneratedMealCard;
