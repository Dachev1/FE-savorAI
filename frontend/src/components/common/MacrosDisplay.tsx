import React from 'react';
import { IMacros } from '../../types/recipeForm';

interface MacrosDisplayProps {
  macros: IMacros | undefined;
}

const MacrosDisplay: React.FC<MacrosDisplayProps> = ({ macros }) => {
  if (!macros) return null;

  return (
    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
      <h3 className="text-lg font-semibold text-dark mb-3">Nutritional Information</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <div className="text-sm text-secondary">Calories</div>
          <div className="text-xl font-bold text-accent">{macros.calories || '0'}</div>
        </div>
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <div className="text-sm text-secondary">Protein</div>
          <div className="text-xl font-bold text-accent">{macros.protein || '0'}g</div>
        </div>
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <div className="text-sm text-secondary">Carbs</div>
          <div className="text-xl font-bold text-accent">{macros.carbs || '0'}g</div>
        </div>
        <div className="bg-white p-3 rounded-lg shadow-sm">
          <div className="text-sm text-secondary">Fat</div>
          <div className="text-xl font-bold text-accent">{macros.fat || '0'}g</div>
        </div>
      </div>
    </div>
  );
};

export default MacrosDisplay; 