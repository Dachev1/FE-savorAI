import React, { KeyboardEvent } from 'react';
import { IMacros } from '../../../types/recipeForm';

interface IngredientsInputProps {
  ingredientsUsed: string[];
  newIngredient: string;
  setNewIngredient: (value: string) => void;
  onAddIngredient: () => void;
  onRemoveIngredient: (index: number) => void;
  error?: string;
}

interface MacrosInputProps {
  macros: IMacros | undefined;
  setMacros: React.Dispatch<React.SetStateAction<IMacros | undefined>>;
  showMacros: boolean;
  setShowMacros: React.Dispatch<React.SetStateAction<boolean>>;
}

export const CreateIngredientsInput: React.FC<IngredientsInputProps> = ({
  ingredientsUsed,
  newIngredient,
  setNewIngredient,
  onAddIngredient,
  onRemoveIngredient,
  error,
}) => {
  // Add ingredient on Enter key press
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
          } placeholder:text-sm`}
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
      {error && (
        <p className="mt-2 text-sm text-red-500">
          {error}
        </p>
      )}
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

const MacrosInput: React.FC<MacrosInputProps> = ({
  macros,
  setMacros,
  showMacros,
  setShowMacros,
}) => {
  const handleMacrosChange = (field: keyof IMacros, value: string) => {
    const numValue = value === '' ? undefined : parseFloat(value);
    
    setMacros((prev) => ({
      ...(prev || { calories: undefined, protein: undefined, carbs: undefined, fat: undefined }),
      [field]: numValue,
    }));
  };

  return (
    <div className="mt-6">
      <div className="flex items-center mb-2">
        <label className="text-sm font-medium text-secondary">
          Nutritional Information
        </label>
        <div className="ml-auto">
          <label className="inline-flex items-center cursor-pointer">
            <span className="mr-2 text-sm text-secondary">
              {showMacros ? 'Hide Macros' : 'Add Macros'}
            </span>
            <div className="relative">
              <input
                type="checkbox"
                checked={showMacros}
                onChange={() => setShowMacros(!showMacros)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
            </div>
          </label>
        </div>
      </div>

      {showMacros && (
        <div className="grid grid-cols-2 gap-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <div>
            <label className="block text-sm font-medium text-secondary">
              Calories
            </label>
            <input
              type="number"
              value={macros?.calories ?? ''}
              onChange={(e) => handleMacrosChange('calories', e.target.value)}
              className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              placeholder="e.g. 350"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary">
              Protein (g)
            </label>
            <input
              type="number"
              step="0.1"
              value={macros?.protein ?? ''}
              onChange={(e) => handleMacrosChange('protein', e.target.value)}
              className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              placeholder="e.g. 25.5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary">
              Carbs (g)
            </label>
            <input
              type="number"
              step="0.1"
              value={macros?.carbs ?? ''}
              onChange={(e) => handleMacrosChange('carbs', e.target.value)}
              className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              placeholder="e.g. 30.2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary">
              Fat (g)
            </label>
            <input
              type="number"
              step="0.1"
              value={macros?.fat ?? ''}
              onChange={(e) => handleMacrosChange('fat', e.target.value)}
              className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              placeholder="e.g. 12.8"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default { CreateIngredientsInput, MacrosInput };
