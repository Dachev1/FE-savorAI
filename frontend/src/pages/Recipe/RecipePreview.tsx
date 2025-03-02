import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from '../../api/axiosConfig.tsx';
import MacrosDisplay from '../../components/common/MacrosDisplay';
import { RecipeResponse } from '../../types/recipe';
import HeaderSection from '../../components/HeaderSection';

const RecipePreview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<RecipeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMacros, setShowMacros] = useState(false);

  useEffect(() => {
    const fetchRecipe = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`/api/v1/recipes/${id}`);
        setRecipe(response.data);
      } catch (err) {
        console.error('Error fetching recipe:', err);
        setError('Failed to load recipe. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchRecipe();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Recipe not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent to-light p-4">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <HeaderSection />
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {recipe.imageUrl && (
            <div className="relative h-80 w-full">
              <img
                src={recipe.imageUrl}
                alt={recipe.mealName}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900">{recipe.mealName}</h1>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">Ingredients</h2>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  {recipe.ingredientsUsed?.map((ingredient, index) => (
                    <li key={index} className="flex items-center mb-2">
                      <span className="text-accent mr-2">•</span>
                      {ingredient}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">Instructions</h2>
                <div className="text-gray-700 whitespace-pre-line">
                  {typeof recipe.recipeDetails === 'string' 
                    ? recipe.recipeDetails 
                    : recipe.recipeDetails.instructions.join('\n')}
                </div>
              </div>
            </div>

            {recipe.macros && showMacros && (
              <div className="mt-8 flex justify-center">
                <MacrosDisplay macros={recipe.macros} />
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-6 text-center space-y-4">
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => navigate(`/recipes/edit/${id}`)}
              className="px-4 py-2 bg-accent hover:bg-accent-dark text-white font-bold rounded focus:outline-none focus:shadow-outline transition duration-300"
            >
              Edit Recipe
            </button>
            
            <button
              onClick={() => setShowMacros(!showMacros)}
              className="px-4 py-2 bg-secondary hover:bg-secondary-dark text-white font-bold rounded focus:outline-none focus:shadow-outline transition duration-300"
            >
              {showMacros ? 'Hide Macros' : 'Show Macros'}
            </button>
            
            <button
              onClick={() => navigate('/recipes/create')}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded focus:outline-none focus:shadow-outline transition duration-300"
            >
              Create New Recipe
            </button>
          </div>
          
          <div>
            <Link to="/" className="inline-block px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipePreview;
