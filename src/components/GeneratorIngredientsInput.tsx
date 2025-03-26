import React from 'react';

interface IngredientsInputProps {
  ingredients: string;
  onChange: (value: string) => void;
}

const IngredientsInput: React.FC<IngredientsInputProps> = ({ ingredients, onChange }) => {
  return (
    <div>
      <label
        htmlFor="ingredients"
        className="block mb-2 text-lg font-semibold text-gray-800 dark:text-gray-200"
      >
        Enter Ingredients (comma-separated):
      </label>
      <div className="relative">
        <input
          id="ingredients"
          type="text"
          placeholder="e.g. chicken, rice, tomatoes"
          value={ingredients}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-5 py-3.5
                    text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800
                    focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                    transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 shadow-sm"
        />
        {ingredients.length > 0 && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="Clear ingredients"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        List all ingredients you have available, separated by commas.
      </p>
    </div>
  );
};

export default IngredientsInput;
