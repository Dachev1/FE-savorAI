import React, { useState } from 'react';
import Modal from '../common/Modal/Modal';
import { FaRegCopy, FaHeart, FaRegHeart } from 'react-icons/fa';
import { RecipeResponse } from '../../types/recipe';

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

  // Get recipe name (handle different property names)
  const recipeName = recipe.mealName || recipe.mealName || 'Untitled Recipe';
  
  // Get ingredients list (handle different property names)
  const ingredients = recipe.ingredientsUsed || recipe.ingredientsUsed || [];
  
  // Clean instructions by removing "Step X:" prefix
  const cleanInstructions = (instructions: string[]) => {
    return instructions.map(step => step.replace(/^Step\s*\d+:\s*/, ''));
  };

  // Render a list of items
  const renderList = (items: string[], ordered = false) => {
    if (!items || items.length === 0) return <p>None specified</p>;
    
    const ListComponent = ordered ? 'ol' : 'ul';
    return (
      <ListComponent className={`list-${ordered ? 'decimal' : 'disc'} list-inside space-y-1 text-gray-700`}>
        {items.map((item, idx) => (
          <li key={`${item.substring(0, 10)}-${idx}`} className="text-lg">
            {item}
          </li>
        ))}
      </ListComponent>
    );
  };

  // Get formatted instructions based on data structure
  const getInstructions = () => {
    // Check if instructions are in recipeDetails.instructions (most common case based on your JSON)
    if (recipe.recipeDetails && 
        typeof recipe.recipeDetails !== 'string' && 
        recipe.recipeDetails.instructions && 
        Array.isArray(recipe.recipeDetails.instructions)) {
      return renderList(cleanInstructions(recipe.recipeDetails.instructions), true);
    }
    
    // Fallback to string recipeDetails
    if (typeof recipe.recipeDetails === 'string') {
      return <p className="text-lg text-gray-700">{recipe.recipeDetails}</p>;
    }
    
    // Default fallback
    return <p className="text-lg text-gray-700">No instructions available</p>;
  };

  return (
    <>
      <div
        className="mt-10 bg-white rounded-3xl shadow-2xl p-8 transition-transform duration-300 hover:scale-105 border border-gray-200"
        data-aos="fade-up"
      >
        <h2 className="text-4xl font-extrabold text-indigo-600 mb-6 text-center">
          {recipeName}
        </h2>
        
        {recipe.imageUrl && (
          <div className="relative overflow-hidden rounded-xl mb-6 flex justify-center">
            <img
              src={recipe.imageUrl}
              alt={recipeName}
              className="w-full max-w-lg h-auto rounded-xl object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>
        )}
        
        {ingredients.length > 0 && (
          <p className="text-lg text-gray-700 leading-relaxed mb-4 text-center">
            <strong>Ingredients Used:</strong> {ingredients.join(', ')}
          </p>
        )}
        
        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center py-3 px-6 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold text-lg shadow-lg transition-transform duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            View Recipe Details
          </button>
          
          <button
            onClick={onCopy}
            className="flex items-center justify-center py-3 px-6 rounded-lg bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold text-lg shadow-lg transition-transform duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400"
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="flex flex-col items-center space-y-6 p-4">
          <h2 className="text-3xl font-bold text-indigo-600">{recipeName}</h2>
          
          <div className="w-full">
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">Ingredients:</h3>
            {renderList(ingredients)}
          </div>
          
          {recipe.recipeDetails && 
            typeof recipe.recipeDetails !== 'string' && 
            recipe.recipeDetails.equipmentNeeded && 
            recipe.recipeDetails.equipmentNeeded.length > 0 && (
            <div className="w-full">
              <h3 className="text-2xl font-semibold text-gray-800 mb-2">Equipment Needed:</h3>
              {renderList(recipe.recipeDetails.equipmentNeeded)}
            </div>
          )}
          
          <div className="w-full">
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">Instructions:</h3>
            {getInstructions()}
          </div>
          
          {recipe.recipeDetails && 
            typeof recipe.recipeDetails !== 'string' && 
            recipe.recipeDetails.servingSuggestions && 
            recipe.recipeDetails.servingSuggestions.length > 0 && (
            <div className="w-full">
              <h3 className="text-2xl font-semibold text-gray-800 mb-2">Serving Suggestions:</h3>
              {renderList(recipe.recipeDetails.servingSuggestions)}
            </div>
          )}
          
          {recipe.recipeDetails && 
            typeof recipe.recipeDetails !== 'string' && 
            recipe.recipeDetails.nutritionalInformation && (
            <div className="w-full">
              <h3 className="text-2xl font-semibold text-gray-800 mb-2">Nutritional Information:</h3>
              <ul className="list-none space-y-1 text-gray-700">
                <li className="text-lg">
                  <strong>Calories:</strong> {recipe.recipeDetails.nutritionalInformation.calories || 'N/A'}
                </li>
                <li className="text-lg">
                  <strong>Protein:</strong> {recipe.recipeDetails.nutritionalInformation.protein || 'N/A'}
                </li>
                <li className="text-lg">
                  <strong>Carbohydrates:</strong> {recipe.recipeDetails.nutritionalInformation.carbohydrates || 'N/A'}
                </li>
                <li className="text-lg">
                  <strong>Fat:</strong> {recipe.recipeDetails.nutritionalInformation.fat || 'N/A'}
                </li>
              </ul>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

export default AIGeneratedMealCard;
