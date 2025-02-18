import React from 'react';
import { RecipeResponse } from '../types/recipe';

interface PreviewCardProps {
  recipe: RecipeResponse;
}

// Helper function to extract instructions from recipeDetails.
const getInstructions = (recipeDetails: RecipeResponse['recipeDetails']): string => {
  if (typeof recipeDetails === 'string') return recipeDetails;
  return recipeDetails?.instructions?.join(' ') || '';
};

const PreviewCard: React.FC<PreviewCardProps> = ({ recipe }) => {
  const instructions = getInstructions(recipe.recipeDetails);

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden transition-transform duration-300 hover:scale-105">
      <div className="p-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 font-serif tracking-wide">
          {recipe.mealName}
        </h1>

        {recipe.ingredientsUsed?.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-3 border-b border-gray-200 pb-2">
              Ingredients
            </h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 text-base">
              {recipe.ingredientsUsed.map((ingredient, index) => (
                <li key={index} className="hover:text-accent transition-colors duration-200">
                  {ingredient}
                </li>
              ))}
            </ul>
          </div>
        )}

        {instructions && (
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-3 border-b border-gray-200 pb-2">
              How to Cook It 🍽️
            </h2>
            <p className="text-gray-700 leading-relaxed text-base">{instructions}</p>
          </div>
        )}
      </div>

      {recipe.imageUrl && (
        <div className="relative h-80 w-full">
          <img
            src={recipe.imageUrl}
            alt={recipe.mealName}
            className="w-full h-full object-cover"
          />
        </div>
      )}
    </div>
  );
};

export default PreviewCard;
