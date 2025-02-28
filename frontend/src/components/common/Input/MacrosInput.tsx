import React from 'react';
import { IMacros } from '../../../types/recipeForm';

interface MacrosInputProps {
  macros: IMacros | undefined;
  setMacros: React.Dispatch<React.SetStateAction<IMacros | undefined>>;
  showMacros: boolean;
  setShowMacros: React.Dispatch<React.SetStateAction<boolean>>;
}

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

export default MacrosInput; 