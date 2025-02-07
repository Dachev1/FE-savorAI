// src/components/IngredientsInput.tsx
import React, { KeyboardEvent } from 'react';

interface IngredientsInputProps {
  ingredientsUsed: string[];
  newIngredient: string;
  setNewIngredient: React.Dispatch<React.SetStateAction<string>>;
  onAddIngredient: () => void;
  onRemoveIngredient: (index: number) => void;
  error?: string;
}

const CreateIngredientsInput: React.FC<IngredientsInputProps> = ({
  ingredientsUsed,
  newIngredient,
  setNewIngredient,
  onAddIngredient,
  onRemoveIngredient,
  error,
}) => {
  // Add ingredient on Enter key
  const handleIngredientKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onAddIngredient();
    }
  };

  return (
    <div>
      <label
        htmlFor="ingredientsUsed"
        className={`block text-sm font-medium transition-colors ${
          ingredientsUsed.length > 0 ? 'text-accent' : 'text-secondary'
        }`}
      >
        Ingredients
      </label>
      <div className="flex mt-1 space-x-2">
        <input
          id="ingredientsUsed"
          type="text"
          value={newIngredient}
          onChange={(e) => setNewIngredient(e.target.value)}
          onKeyDown={handleIngredientKeyDown}
          className={`w-full px-4 py-3 rounded-lg border shadow-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors duration-200 ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Type an ingredient and press Enter or +"
        />
        <button
          type="button"
          onClick={onAddIngredient}
          className="px-5 py-3 bg-accent text-white font-semibold rounded-lg shadow-lg transform transition-transform active:scale-95 hover:bg-dark"
        >
          +
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-500 animate-pulse">{error}</p>}
      <div className="flex flex-wrap gap-2 mt-3">
        {ingredientsUsed.map((ingredient, index) => (
          <div
            key={index}
            className="flex items-center bg-accent text-white px-3 py-1 rounded-full text-sm shadow-md hover:bg-dark transition-colors"
          >
            <span>{ingredient}</span>
            <button
              type="button"
              onClick={() => onRemoveIngredient(index)}
              className="ml-2 text-xs bg-white text-accent rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CreateIngredientsInput;
