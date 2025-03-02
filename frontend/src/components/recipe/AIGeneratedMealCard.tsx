import React, { useState } from 'react';
import Modal from '../common/Modal/Modal';
import { FaRegCopy, FaHeart, FaRegHeart } from 'react-icons/fa';
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
  copySuccess,
  onCopy,
  onToggleFavorite,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Get recipe name (handle different property names)
  const recipeName = recipe.mealName || 'Untitled Recipe';
  
  // Get ingredients list (handle different property names)
  const ingredients = recipe.ingredientsUsed || [];
  
  // Clean instructions by removing "Step X:" prefix
  const cleanInstructions = (instructions: string[]) => {
    return instructions.map(step => step.replace(/^Step\s*\d+:\s*/, ''));
  };

  // Render a list of items
  const renderList = (items: string[], ordered = false) => {
    if (!items || items.length === 0) return <p>None specified</p>;
    
    const ListComponent = ordered ? 'ol' : 'ul';
    return (
      <ListComponent className={`list-${ordered ? 'decimal' : 'disc'} list-inside space-y-1 text-gray-700 dark:text-gray-300`}>
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
      return <p className="text-lg text-gray-700 dark:text-gray-300">{recipe.recipeDetails}</p>;
    }
    
    // Default fallback
    return <p className="text-lg text-gray-700 dark:text-gray-300">No instructions available</p>;
  };

  // Safely get nutritional information
  const getNutritionalInfo = () => {
    if (recipe.recipeDetails && 
        typeof recipe.recipeDetails !== 'string' && 
        recipe.recipeDetails.nutritionalInformation) {
      
      const { nutritionalInformation } = recipe.recipeDetails;
      
      return (
        <ul className="list-none space-y-1 text-gray-700 dark:text-gray-300">
          <li className="text-lg">
            <strong>Calories:</strong> {nutritionalInformation.calories || 'N/A'}
          </li>
          <li className="text-lg">
            <strong>Protein:</strong> {nutritionalInformation.protein || 'N/A'}
          </li>
          <li className="text-lg">
            <strong>Carbohydrates:</strong> {nutritionalInformation.carbohydrates || 'N/A'}
          </li>
          <li className="text-lg">
            <strong>Fat:</strong> {nutritionalInformation.fat || 'N/A'}
          </li>
        </ul>
      );
    }
    
    return <p className="text-lg text-gray-700 dark:text-gray-300">Nutritional information not available</p>;
  };

  return (
    <>
      <div
        className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 border border-gray-200 dark:border-gray-700 transition-all duration-300"
      >
        <h2 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-6 text-center">
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
          <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-4 text-center">
            <strong>Ingredients Used:</strong> {ingredients.join(', ')}
          </p>
        )}
        
        <div className="flex flex-wrap justify-center gap-3 mt-6">
          <button
            onClick={() => setIsModalOpen(true)}
            className="py-2.5 px-5 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white font-medium shadow-md transition-all duration-300 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
          >
            View Recipe Details
          </button>
          
          <button
            onClick={onCopy}
            className="flex items-center justify-center py-2.5 px-5 rounded-lg bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 text-white font-medium shadow-md transition-all duration-300 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
          >
            <FaRegCopy className="mr-2" />
            Copy Details
          </button>
          
          <button
            onClick={onToggleFavorite}
            className={`flex items-center justify-center py-2.5 px-5 rounded-lg text-white font-medium shadow-md transition-all duration-300 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isFavorite
                ? 'bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 focus:ring-red-400'
                : 'bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 focus:ring-gray-400'
            }`}
          >
            {isFavorite ? <FaHeart className="mr-2" /> : <FaRegHeart className="mr-2" />}
            {isFavorite ? 'Remove' : 'Add Favorite'}
          </button>
        </div>
        
        {copySuccess && (
          <p className="text-green-600 dark:text-green-400 font-semibold text-center mt-4">
            {copySuccess}
          </p>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="flex flex-col items-center space-y-6 p-4">
          <h2 className="text-3xl font-bold text-blue-600 dark:text-blue-400">{recipeName}</h2>
          
          <div className="w-full">
            <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Ingredients:</h3>
            {renderList(ingredients)}
          </div>
          
          {recipe.recipeDetails && 
            typeof recipe.recipeDetails !== 'string' && 
            recipe.recipeDetails.equipmentNeeded && 
            recipe.recipeDetails.equipmentNeeded.length > 0 && (
            <div className="w-full">
              <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Equipment Needed:</h3>
              {renderList(recipe.recipeDetails.equipmentNeeded)}
            </div>
          )}
          
          <div className="w-full">
            <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Instructions:</h3>
            {getInstructions()}
          </div>
          
          {recipe.recipeDetails && 
            typeof recipe.recipeDetails !== 'string' && 
            recipe.recipeDetails.servingSuggestions && 
            recipe.recipeDetails.servingSuggestions.length > 0 && (
            <div className="w-full">
              <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Serving Suggestions:</h3>
              {renderList(recipe.recipeDetails.servingSuggestions)}
            </div>
          )}
          
          <div className="w-full">
            <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Nutritional Information:</h3>
            {getNutritionalInfo()}
          </div>
        </div>
      </Modal>
    </>
  );
};

export default AIGeneratedMealCard;
