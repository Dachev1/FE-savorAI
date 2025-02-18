import React, { useState } from 'react';
import Modal from './Modal';
import { FaRegCopy, FaHeart, FaRegHeart } from 'react-icons/fa';
import { RecipeResponse } from '../types/recipe';

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
  copySuccess,
  onCopy,
  onToggleFavorite,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Remove any "Step X:" prefix from instructions for cleaner display.
  const cleanInstructions = (instructions: string[]) =>
    instructions.map((step) => step.replace(/^Step\s*\d+:\s*/, ''));

  return (
    <>
      <div
        className="mt-10 bg-white rounded-3xl shadow-2xl p-8 transition-transform duration-300 hover:scale-105 border border-gray-200"
        data-aos="fade-up"
      >
        <h2 className="text-4xl font-extrabold text-indigo-600 mb-6 text-center">
          {recipe.mealName}
        </h2>
        <div className="relative overflow-hidden rounded-xl mb-6 flex justify-center">
          <img
            src={recipe.imageUrl}
            alt={recipe.mealName}
            className="w-full max-w-lg h-auto rounded-xl object-cover transition-transform duration-500 hover:scale-105"
          />
        </div>
        <p className="text-lg text-gray-700 leading-relaxed mb-4 text-center">
          <strong>Ingredients Used:</strong> {recipe.ingredientsUsed.join(', ')}
        </p>
        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={openModal}
            className="flex items-center justify-center py-3 px-6 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold text-lg shadow-lg transition-transform duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="View Recipe Details"
          >
            View Recipe Details
          </button>
          <button
            onClick={onCopy}
            className="flex items-center justify-center py-3 px-6 rounded-lg bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold text-lg shadow-lg transition-transform duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400"
            aria-label="Copy Recipe Details"
          >
            <FaRegCopy className="mr-2" />
            Copy Details
          </button>
          <button
            onClick={onToggleFavorite}
            className={`flex items-center justify-center py-3 px-6 rounded-lg text-white font-semibold text-lg shadow-lg transition-transform duration-300 hover:scale-105 focus:outline-none focus:ring-2 ${
              isFavorite
                ? 'bg-red-500 hover:bg-red-600 focus:ring-red-400'
                : 'bg-gray-500 hover:bg-gray-600 focus:ring-gray-400'
            }`}
            aria-label={isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
          >
            {isFavorite ? <FaHeart className="mr-2" /> : <FaRegHeart className="mr-2" />}
            {isFavorite ? 'Remove Favorite' : 'Add to Favorites'}
          </button>
        </div>
        {copySuccess && (
          <p className="text-green-600 font-semibold text-center mt-4">
            {copySuccess}
          </p>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal}>
        {recipe && (
          <div className="flex flex-col items-center space-y-6 p-4">
            <h2 className="text-3xl font-bold text-indigo-600">{recipe.mealName}</h2>
            <div className="w-full">
              <h3 className="text-2xl font-semibold text-gray-800 mb-2">Ingredients:</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {recipe.recipeDetails.ingredientsList.map((ingredient, index) => (
                  <li key={index} className="text-lg">
                    {ingredient}
                  </li>
                ))}
              </ul>
            </div>
            <div className="w-full">
              <h3 className="text-2xl font-semibold text-gray-800 mb-2">Equipment Needed:</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {recipe.recipeDetails.equipmentNeeded.map((equipment, index) => (
                  <li key={index} className="text-lg">
                    {equipment}
                  </li>
                ))}
              </ul>
            </div>
            <div className="w-full">
              <h3 className="text-2xl font-semibold text-gray-800 mb-2">Instructions:</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                {cleanInstructions(recipe.recipeDetails.instructions).map((instruction, index) => (
                  <li key={index} className="text-lg">
                    {instruction}
                  </li>
                ))}
              </ol>
            </div>
            <div className="w-full">
              <h3 className="text-2xl font-semibold text-gray-800 mb-2">Serving Suggestions:</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {recipe.recipeDetails.servingSuggestions.map((suggestion, index) => (
                  <li key={index} className="text-lg">
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
            <div className="w-full">
              <h3 className="text-2xl font-semibold text-gray-800 mb-2">Nutritional Information:</h3>
              <ul className="list-none space-y-1 text-gray-700">
                <li className="text-lg">
                  <strong>Calories:</strong> {recipe.recipeDetails.nutritionalInformation.calories}
                </li>
                <li className="text-lg">
                  <strong>Protein:</strong> {recipe.recipeDetails.nutritionalInformation.protein}
                </li>
                <li className="text-lg">
                  <strong>Carbohydrates:</strong> {recipe.recipeDetails.nutritionalInformation.carbohydrates}
                </li>
                <li className="text-lg">
                  <strong>Fat:</strong> {recipe.recipeDetails.nutritionalInformation.fat}
                </li>
              </ul>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default AIGeneratedMealCard;
