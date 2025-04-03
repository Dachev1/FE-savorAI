import React, { useState, KeyboardEvent, ChangeEvent } from 'react';
import { IMacros } from '../../../types/recipeForm';
import { BsPlus } from 'react-icons/bs';
import { MdOutlineDelete } from 'react-icons/md';
import { FiChevronRight } from 'react-icons/fi';

export interface Props {
  ingredientsUsed: string[];
  setIngredientsUsed: React.Dispatch<React.SetStateAction<string[]>>;
  error?: string;
  onAddIngredient?: (ingredient: string) => void;
  onRemoveIngredient?: (index: number) => void;
}

export const CreateIngredientsInput = ({
  ingredientsUsed,
  setIngredientsUsed,
  error,
  onAddIngredient,
  onRemoveIngredient
}: Props) => {
  const [newIngredient, setNewIngredient] = useState('');
  const isValid = newIngredient.trim().length >= 3;
  const hasIngredients = ingredientsUsed.length > 0;
  
  const getBorderStyle = () => {
    if (error && !hasIngredients) return 'border-red-500 dark:border-red-500 ring-red-200 dark:ring-red-900/30';
    if (hasIngredients) return 'border-green-500 dark:border-green-500 ring-green-200 dark:ring-green-900/30';
    return 'border-gray-300 dark:border-gray-600 ring-blue-100 dark:ring-blue-900/20';
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && isValid) {
      e.preventDefault();
      onAddIngredient ? onAddIngredient(newIngredient) : 
        setIngredientsUsed([...ingredientsUsed, newIngredient.trim()]);
      setNewIngredient('');
    }
  };

  // Clear error on input change
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewIngredient(value);
    
    // Clear error immediately when user starts typing if we have ingredients
    // or if they're typing something valid
    if (error && (hasIngredients || value.trim().length >= 2)) {
      // Use the optional callback if provided, otherwise do nothing
      onAddIngredient && onAddIngredient("");
    }
  };

  const handleRemove = (index: number) => {
    onRemoveIngredient ? onRemoveIngredient(index) : 
      setIngredientsUsed(ingredientsUsed.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
            Ingredients {!hasIngredients && <span className="text-red-500 ml-1">*</span>}
          </label>
          {error && !hasIngredients && (
            <span className="ml-2 text-xs text-red-500 animate-pulse">{error}</span>
          )}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 italic">
          Press Enter to add
        </div>
      </div>
      
      <div className={`flex rounded-md overflow-hidden shadow-sm transition-all duration-150 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-1 ${
        error && !hasIngredients ? 'ring-1 ring-red-300 dark:ring-red-700' : ''
      }`}>
        <input
          type="text"
          value={newIngredient}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Add ingredient (e.g. 2 cups flour)"
          className={`flex-grow py-2.5 px-3.5 bg-white dark:bg-gray-800 dark:text-white text-sm border ${getBorderStyle()} rounded-l-md focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500`}
          autoComplete="off"
        />
        <button
          onClick={() => {
            if (isValid) {
              onAddIngredient ? onAddIngredient(newIngredient) : 
                setIngredientsUsed([...ingredientsUsed, newIngredient.trim()]);
              setNewIngredient('');
            }
          }}
          type="button"
          disabled={!isValid}
          className={`px-4 bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-600 dark:hover:bg-blue-700
            flex items-center justify-center transition-all border border-blue-600 dark:border-blue-700 rounded-r-md
            ${!isValid ? 'opacity-50 cursor-not-allowed bg-blue-400 dark:bg-blue-500 border-blue-400 dark:border-blue-600' : 'hover:scale-105 active:scale-95'}`}
        >
          <BsPlus className="text-xl" />
        </button>
      </div>

      {hasIngredients && (
        <div className="pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {ingredientsUsed.map((ingredient, index) => (
              <div
                key={index}
                className="group flex items-center gap-1.5 px-3 py-2 rounded-md bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 transition-all hover:bg-blue-100 dark:hover:bg-blue-800/40"
              >
                <FiChevronRight className="text-blue-500 dark:text-blue-400" />
                <span className="text-sm text-blue-800 dark:text-blue-300 flex-grow">{ingredient}</span>
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="text-blue-400 hover:text-red-500 dark:text-blue-500 dark:hover:text-red-400 transition-colors p-1 rounded-full hover:bg-white/50 dark:hover:bg-gray-800/50 hover:scale-110"
                  aria-label="Remove ingredient"
                >
                  <MdOutlineDelete size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
