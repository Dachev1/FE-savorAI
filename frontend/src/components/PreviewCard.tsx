import React, { useState } from 'react';
import Modal from './Modal';
import { RecipeResponse } from '../types';

interface PreviewCardProps {
  recipe: RecipeResponse;
}

const PreviewCard: React.FC<PreviewCardProps> = ({ recipe }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Handlers for modal open/close
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Optional helper to clean up instructions (removing "Step X:" if present)
  const cleanInstructions = (instructions: string[]): string[] =>
    instructions.map((instruction) => instruction.replace(/^Step\s*\d+:\s*/, ''));

  return (
    <>
      {/* Preview Card Container */}
      <div
        className="bg-white rounded-xl shadow-lg p-6 transition transform hover:scale-105 border border-gray-200"
        data-aos="fade-up"
      >
        <h2 className="text-3xl font-bold text-primary mb-4 text-center">
          {recipe.mealName}
        </h2>

        {recipe.imageUrl && (
          <div className="overflow-hidden rounded-lg mb-4">
            <img
              src={recipe.imageUrl}
              alt={recipe.mealName}
              className="w-full h-48 object-cover"
            />
          </div>
        )}

        <p className="text-gray-700 mb-4">
          <strong>Ingredients:</strong> {recipe.ingredientsUsed.join(', ')}
        </p>

        <button
          onClick={openModal}
          className="w-full py-2 bg-primary text-white font-semibold rounded hover:bg-primary-dark transition"
          aria-label="View Full Recipe Details"
        >
          View Full Details
        </button>
      </div>

      {/* Modal for Full Recipe Details */}
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <div className="p-4">
          <h2 className="text-2xl font-bold text-primary mb-4">{recipe.mealName}</h2>

          <div className="mb-4">
            <h3 className="text-xl font-semibold text-gray-800">Ingredients:</h3>
            <ul className="list-disc list-inside text-gray-700">
              {recipe.ingredientsUsed.map((ingredient, index) => (
                <li key={index}>{ingredient}</li>
              ))}
            </ul>
          </div>

          {recipe.recipeDetails.instructions && recipe.recipeDetails.instructions.length > 0 && (
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-gray-800">Instructions:</h3>
              <ol className="list-decimal list-inside text-gray-700">
                {cleanInstructions(recipe.recipeDetails.instructions).map((instruction, index) => (
                  <li key={index} className="mb-1">{instruction}</li>
                ))}
              </ol>
            </div>
          )}

          {recipe.recipeDetails.nutritionalInformation && (
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-gray-800">Nutritional Information:</h3>
              <ul className="list-none text-gray-700">
                <li>Calories: {recipe.recipeDetails.nutritionalInformation.calories}</li>
                <li>Protein: {recipe.recipeDetails.nutritionalInformation.protein}</li>
                <li>Carbohydrates: {recipe.recipeDetails.nutritionalInformation.carbohydrates}</li>
                <li>Fat: {recipe.recipeDetails.nutritionalInformation.fat}</li>
              </ul>
            </div>
          )}

          <button
            onClick={closeModal}
            className="mt-4 px-4 py-2 bg-gray-300 text-gray-800 font-semibold rounded hover:bg-gray-400 transition"
          >
            Close
          </button>
        </div>
      </Modal>
    </>
  );
};

export default PreviewCard;
