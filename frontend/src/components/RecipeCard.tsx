import React, { useState } from 'react';
import Modal from './Modal';
import { FaRegCopy, FaHeart, FaRegHeart } from 'react-icons/fa';

interface NutritionalInformation {
  calories: number;
  protein: string;
  carbohydrates: string;
  fat: string;
}

interface RecipeDetails {
  ingredientsList: string[];
  equipmentNeeded: string[];
  instructions: string[];
  servingSuggestions: string[];
  nutritionalInformation: NutritionalInformation;
}

interface RecipeResponse {
  mealName: string;
  ingredientsUsed: string[];
  recipeDetails: RecipeDetails;
  imageUrl: string;
}

interface RecipeCardProps {
  recipe: RecipeResponse;
  isFavorite: boolean;
  copySuccess: string;
  onCopy: () => void;
  onToggleFavorite: () => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  isFavorite,
  copySuccess,
  onCopy,
  onToggleFavorite,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Function to remove "Step X: " from instructions
  const cleanInstructions = (instructions: string[]) => {
    return instructions.map((step) => step.replace(/^Step\s*\d+:\s*/, ''));
  };

  return (
    <>
      <div
        className="mt-10 bg-white rounded-2xl shadow-lg p-8 transition-transform
                   duration-300 hover:scale-[1.02] border border-gray-100"
        data-aos="fade-up"
      >
        <h2 className="text-4xl font-bold text-accent mb-6 text-center">
          {recipe.mealName}
        </h2>

        <div className="relative overflow-hidden rounded-xl mb-6 flex justify-center">
          <img
            src={recipe.imageUrl}
            alt={recipe.mealName}
            className="w-[512px] h-[512px] object-cover
                       transform hover:scale-105 transition-transform duration-500
                       md:w-[400px] md:h-[400px] sm:w-[300px] sm:h-[300px]"
          />
        </div>

        <p className="text-lg text-dark leading-relaxed mb-4">
          <strong>Ingredients Used:</strong> {recipe.ingredientsUsed.join(', ')}
        </p>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 mt-6">
          <button
            onClick={openModal}
            className="flex items-center justify-center py-3 px-6 rounded-lg bg-gradient-to-r from-accent to-dark
                       text-white font-semibold text-lg shadow-md
                       transition-transform duration-300 hover:scale-105
                       focus:outline-none focus:ring-4 focus:ring-dark"
            aria-label="View Recipe Details"
          >
            View Recipe Details
          </button>

          <button
            onClick={onCopy}
            className="flex items-center justify-center py-3 px-6 rounded-lg bg-gradient-to-r from-accent to-dark
                       text-white font-semibold text-lg shadow-md
                       transition-transform duration-300 hover:scale-105
                       focus:outline-none focus:ring-4 focus:ring-dark"
            aria-label="Copy Recipe Details"
          >
            <FaRegCopy className="mr-2" />
            Copy Details
          </button>

          <button
            onClick={onToggleFavorite}
            className={`flex items-center justify-center py-3 px-6 rounded-lg text-white font-semibold text-lg
                       ${
                         isFavorite ? 'bg-red-500' : 'bg-gray-500'
                       } shadow-md transition-transform duration-300 hover:scale-105`}
            aria-label={isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
          >
            {isFavorite ? <FaHeart className="mr-2" /> : <FaRegHeart className="mr-2" />}
            {isFavorite ? 'Remove Favorite' : 'Add to Favorites'}
          </button>
        </div>

        {/* Copy Success Message */}
        {copySuccess && (
          <p className="text-green-500 font-semibold text-center mt-4">
            {copySuccess}
          </p>
        )}
      </div>

      {/* Modal for Recipe Details */}
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        {recipe && (
          <div className="flex flex-col items-center space-y-6">
            <h2 className="text-3xl font-bold text-accent">{recipe.mealName}</h2>

            {/* Removed Image from Modal */}

            {/* Ingredients List */}
            <div className="w-full">
              <h3 className="text-2xl font-semibold text-dark mb-2">Ingredients:</h3>
              <ul className="list-disc list-inside space-y-1">
                {recipe.recipeDetails.ingredientsList.map((ingredient, index) => (
                  <li key={index} className="text-lg text-dark">
                    {ingredient}
                  </li>
                ))}
              </ul>
            </div>

            {/* Equipment Needed */}
            <div className="w-full">
              <h3 className="text-2xl font-semibold text-dark mb-2">Equipment Needed:</h3>
              <ul className="list-disc list-inside space-y-1">
                {recipe.recipeDetails.equipmentNeeded.map((equipment, index) => (
                  <li key={index} className="text-lg text-dark">
                    {equipment}
                  </li>
                ))}
              </ul>
            </div>

            {/* Instructions */}
            <div className="w-full">
              <h3 className="text-2xl font-semibold text-dark mb-2">Instructions:</h3>
              <ol className="list-decimal list-inside space-y-2">
                {cleanInstructions(recipe.recipeDetails.instructions).map((instruction, index) => (
                  <li key={index} className="text-lg text-dark">
                    {instruction}
                  </li>
                ))}
              </ol>
            </div>

            {/* Serving Suggestions */}
            <div className="w-full">
              <h3 className="text-2xl font-semibold text-dark mb-2">Serving Suggestions:</h3>
              <ul className="list-disc list-inside space-y-1">
                {recipe.recipeDetails.servingSuggestions.map((suggestion, index) => (
                  <li key={index} className="text-lg text-dark">
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>

            {/* Nutritional Information */}
            <div className="w-full">
              <h3 className="text-2xl font-semibold text-dark mb-2">Nutritional Information:</h3>
              <ul className="list-none space-y-1">
                <li className="text-lg text-dark">Calories: {recipe.recipeDetails.nutritionalInformation.calories}</li>
                <li className="text-lg text-dark">Protein: {recipe.recipeDetails.nutritionalInformation.protein}</li>
                <li className="text-lg text-dark">Carbohydrates: {recipe.recipeDetails.nutritionalInformation.carbohydrates}</li>
                <li className="text-lg text-dark">Fat: {recipe.recipeDetails.nutritionalInformation.fat}</li>
              </ul>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default RecipeCard;
