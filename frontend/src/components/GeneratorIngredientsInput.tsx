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
        className="block mb-2 text-lg font-semibold text-dark"
      >
        Enter Ingredients (comma-separated):
      </label>
      <input
        id="ingredients"
        type="text"
        placeholder="e.g. chicken, rice, tomatoes"
        value={ingredients}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-300 px-5 py-3 text-dark
                   focus:outline-none focus:ring-4 focus:ring-accent
                   transition-all placeholder:text-gray-400 shadow-sm"
      />
    </div>
  );
};

export default IngredientsInput;
