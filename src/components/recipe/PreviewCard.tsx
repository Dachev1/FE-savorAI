import React, { useMemo } from 'react';
import { RecipeResponse } from '../../types/recipe';
import { FaClock, FaUtensils, FaFireAlt, FaDumbbell, FaCarrot, FaOilCan } from 'react-icons/fa';

interface PreviewCardProps {
  recipe: RecipeResponse;
  onClick?: () => void;
}

// Helper function to extract instructions from recipeDetails
const getInstructions = (recipeDetails: RecipeResponse['recipeDetails']): string => {
  if (typeof recipeDetails === 'string') return recipeDetails;
  return recipeDetails?.instructions?.join(' ') || '';
};

// Helper to check if recipe has nutrition info
const hasNutritionInfo = (recipe: RecipeResponse): boolean => 
  Boolean(recipe.macros && 
  Object.values(recipe.macros).some(value => value && value > 0));

// Get difficulty color for consistent styling
const getDifficultyColor = (difficulty?: string): string => {
  switch (difficulty?.toUpperCase()) {
    case 'EASY': return 'bg-green-500/80';
    case 'MEDIUM': return 'bg-amber-500/80';
    case 'HARD': return 'bg-red-500/80';
    default: return 'bg-blue-500/80';
  }
};

// Format difficulty text to be user-friendly
const formatDifficulty = (difficulty?: string): string => {
  if (!difficulty) return 'Medium';
  return difficulty.charAt(0) + difficulty.slice(1).toLowerCase();
};

const PreviewCard: React.FC<PreviewCardProps> = ({ recipe, onClick }) => {
  // Use memoization to prevent unnecessary calculations
  const { instructions, ingredientsUsed, totalTimeMinutes, imageUrl, mealName, difficulty } = useMemo(() => ({
    instructions: getInstructions(recipe.recipeDetails),
    ingredientsUsed: recipe.ingredientsUsed || [],
    totalTimeMinutes: recipe.totalTimeMinutes || 0,
    imageUrl: recipe.imageUrl || '',
    mealName: recipe.mealName || 'Untitled Recipe',
    difficulty: recipe.difficulty
  }), [recipe]);

  // Memoize macros to prevent recalculations
  const macros = useMemo(() => ({
    calories: recipe.macros?.calories || 0,
    protein: recipe.macros?.protein || 0,
    carbs: recipe.macros?.carbs || 0,
    fat: recipe.macros?.fat || 0
  }), [recipe.macros]);

  return (
    <div 
      className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl border border-purple-100 dark:border-purple-900/50 flex flex-col h-full group cursor-pointer transform hover:-translate-y-1"
      onClick={onClick}
      data-aos="fade-up"
      role="article"
      aria-label={`Recipe card for ${mealName}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick && onClick();
        }
      }}
    >
      <div className="relative">
        {imageUrl ? (
          <div className="relative h-56 w-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-purple-600/40 via-indigo-500/20 to-blue-400/10 z-10 mix-blend-overlay"></div>
            <img
              src={imageUrl}
              alt={mealName}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null; // Prevent infinite loop
                target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop";
              }}
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-70 group-hover:opacity-80 transition-opacity duration-300"></div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-indigo-400 to-purple-500 w-full h-56 flex items-center justify-center">
            <FaUtensils className="text-5xl text-white/40" aria-hidden="true" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-70 group-hover:opacity-80 transition-opacity duration-300"></div>
          </div>
        )}
        
        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-5 z-20">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-2 drop-shadow-lg">
            {mealName}
          </h2>
          
          {/* Quick stats with colorful style */}
          <div className="flex flex-wrap gap-3 mt-3">
            {totalTimeMinutes > 0 && (
              <div className="flex items-center bg-purple-500/80 backdrop-blur-md px-3 py-1.5 rounded-full text-white shadow-md text-sm">
                <FaClock className="mr-1.5 text-white/90" aria-hidden="true" />
                <span className="font-medium">{totalTimeMinutes} min</span>
              </div>
            )}
            
            {difficulty && (
              <div className={`flex items-center px-3 py-1.5 rounded-full text-white shadow-md text-sm ${getDifficultyColor(difficulty)}`}>
                <span className="font-medium">
                  {formatDifficulty(difficulty)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="p-6 flex-grow bg-gradient-to-b from-white/20 to-white/100 dark:from-gray-800/20 dark:to-gray-800/100">
        {/* Nutrition info */}
        {hasNutritionInfo(recipe) && (
          <div className="mb-5 grid grid-cols-4 gap-3">
            <div className="bg-rose-50 dark:bg-rose-900/20 p-2 rounded-lg text-center">
              <FaFireAlt className="mx-auto text-rose-500 mb-1" aria-hidden="true" />
              <p className="text-xs text-gray-500 dark:text-gray-400">Cal</p>
              <p className="font-bold text-sm text-rose-600 dark:text-rose-400">{macros.calories}</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg text-center">
              <FaDumbbell className="mx-auto text-blue-500 mb-1" aria-hidden="true" />
              <p className="text-xs text-gray-500 dark:text-gray-400">Protein</p>
              <p className="font-bold text-sm text-blue-600 dark:text-blue-400">{macros.protein}g</p>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/20 p-2 rounded-lg text-center">
              <FaCarrot className="mx-auto text-amber-500 mb-1" aria-hidden="true" />
              <p className="text-xs text-gray-500 dark:text-gray-400">Carbs</p>
              <p className="font-bold text-sm text-amber-600 dark:text-amber-400">{macros.carbs}g</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded-lg text-center">
              <FaOilCan className="mx-auto text-green-500 mb-1" aria-hidden="true" />
              <p className="text-xs text-gray-500 dark:text-gray-400">Fat</p>
              <p className="font-bold text-sm text-green-600 dark:text-green-400">{macros.fat}g</p>
            </div>
          </div>
        )}
        
        {ingredientsUsed.length > 0 && (
          <section className="mb-6" aria-label="Ingredients">
            <h3 className="flex items-center text-lg font-medium text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 mb-3 tracking-wide">
              <span className="w-1.5 h-6 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full mr-2" aria-hidden="true"></span>
              Ingredients
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {ingredientsUsed.slice(0, 6).map((ingredient, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-600 dark:text-gray-300 group">
                  <span className="text-indigo-500 dark:text-indigo-400 mt-0.5 group-hover:scale-110 transition-transform" aria-hidden="true">●</span>
                  <span className="text-sm group-hover:text-gray-800 dark:group-hover:text-gray-100 transition-colors font-light">{ingredient}</span>
                </li>
              ))}
              {ingredientsUsed.length > 6 && (
                <li className="text-sm text-indigo-500 dark:text-indigo-400 mt-1 font-medium">
                  +{ingredientsUsed.length - 6} more ingredients
                </li>
              )}
            </ul>
          </section>
        )}

        {instructions && (
          <section aria-label="Instructions preview">
            <h3 className="flex items-center text-lg font-medium text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 mb-3 tracking-wide">
              <span className="w-1.5 h-6 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full mr-2" aria-hidden="true"></span>
              Instructions
            </h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm line-clamp-3 font-light">{instructions}</p>
          </section>
        )}
      </div>
      
      <div className="p-4 flex justify-center">
        <button 
          className="w-full py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center text-sm font-medium"
          onClick={onClick}
          aria-label={`View full recipe for ${mealName}`}
        >
          View Full Recipe
        </button>
      </div>
    </div>
  );
};

export default React.memo(PreviewCard);
