import React from 'react';

interface MacrosDisplayProps {
  macros: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

const MacrosDisplay: React.FC<MacrosDisplayProps> = ({ macros }) => {
  const { calories, protein, carbs, fat } = macros;

  return (
    <div className="mt-6 p-4 bg-softGray dark:bg-gray-800 rounded-lg">
      <h3 className="text-lg font-semibold text-dark dark:text-light mb-3">Nutritional Information</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-700 p-3 rounded-lg shadow-sm">
          <div className="text-sm text-secondary dark:text-gray-300">Calories</div>
          <div className="text-xl font-bold text-accent">{calories || '0'}</div>
        </div>
        <div className="bg-white dark:bg-gray-700 p-3 rounded-lg shadow-sm">
          <div className="text-sm text-secondary dark:text-gray-300">Protein</div>
          <div className="text-xl font-bold text-accent">{protein || '0'}g</div>
        </div>
        <div className="bg-white dark:bg-gray-700 p-3 rounded-lg shadow-sm">
          <div className="text-sm text-secondary dark:text-gray-300">Carbs</div>
          <div className="text-xl font-bold text-accent">{carbs || '0'}g</div>
        </div>
        <div className="bg-white dark:bg-gray-700 p-3 rounded-lg shadow-sm">
          <div className="text-sm text-secondary dark:text-gray-300">Fat</div>
          <div className="text-xl font-bold text-accent">{fat || '0'}g</div>
        </div>
      </div>
    </div>
  );
};

export default MacrosDisplay; 