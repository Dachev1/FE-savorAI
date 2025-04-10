import React from 'react';

interface MacrosDisplayProps {
  macros: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  size?: 'sm' | 'md' | 'lg';
}

const MacrosDisplay: React.FC<MacrosDisplayProps> = ({ 
  macros, 
  size = 'md' 
}) => {
  const { calories, protein, carbs, fat } = macros;
  
  // Set sizes based on prop
  const sizeClasses = {
    sm: {
      container: 'p-3',
      title: 'text-md',
      label: 'text-xs',
      value: 'text-lg'
    },
    md: {
      container: 'p-4',
      title: 'text-lg',
      label: 'text-sm',
      value: 'text-xl'
    },
    lg: {
      container: 'p-5',
      title: 'text-xl',
      label: 'text-base',
      value: 'text-2xl'
    }
  }[size];

  return (
    <div className={`rounded-xl bg-gray-50 dark:bg-gray-800 shadow-sm ${sizeClasses.container}`}>
      <h3 className={`${sizeClasses.title} font-semibold text-gray-800 dark:text-white mb-4`}>
        Nutritional Information
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-700 rounded-lg shadow-sm p-3 transform hover:scale-105 transition-transform">
          <div className={`${sizeClasses.label} text-gray-500 dark:text-gray-300`}>Calories</div>
          <div className={`${sizeClasses.value} font-bold text-orange-500`}>
            {calories || '0'}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-700 rounded-lg shadow-sm p-3 transform hover:scale-105 transition-transform">
          <div className={`${sizeClasses.label} text-gray-500 dark:text-gray-300`}>Protein</div>
          <div className={`${sizeClasses.value} font-bold text-blue-500`}>
            {protein || '0'}g
          </div>
        </div>
        <div className="bg-white dark:bg-gray-700 rounded-lg shadow-sm p-3 transform hover:scale-105 transition-transform">
          <div className={`${sizeClasses.label} text-gray-500 dark:text-gray-300`}>Carbs</div>
          <div className={`${sizeClasses.value} font-bold text-green-500`}>
            {carbs || '0'}g
          </div>
        </div>
        <div className="bg-white dark:bg-gray-700 rounded-lg shadow-sm p-3 transform hover:scale-105 transition-transform">
          <div className={`${sizeClasses.label} text-gray-500 dark:text-gray-300`}>Fat</div>
          <div className={`${sizeClasses.value} font-bold text-purple-500`}>
            {fat || '0'}g
          </div>
        </div>
      </div>
    </div>
  );
};

export default MacrosDisplay; 