import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaSearch, FaEdit, FaEye } from 'react-icons/fa';
import 'aos/dist/aos.css';

// Simple recipe type
interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  imageUrl: string;
}

const UserRecipes: React.FC = () => {
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/v1/recipes/all');
      setRecipes(response.data);
    } catch (err) {
      console.error('Error fetching recipes:', err);
      setError('Failed to load recipes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter recipes based on search term
  const filteredRecipes = recipes.filter(recipe => 
    !searchTerm || 
    recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipe.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipe.ingredients.some(i => i.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Recipes</h1>
        <button
          onClick={() => navigate('/create-recipe')}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          <FaPlus className="inline mr-2" /> Create Recipe
        </button>
      </div>

      {/* Search bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search recipes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 pl-10 border rounded"
          />
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
        </div>
      </div>
      
      {/* Loading state */}
      {loading ? (
        <div className="text-center py-10">Loading...</div>
      ) : error ? (
        <div className="bg-red-100 p-4 rounded text-center">
          <p className="text-red-700">{error}</p>
          <button onClick={fetchRecipes} className="mt-2 bg-blue-500 text-white px-4 py-1 rounded">
            Try Again
          </button>
        </div>
      ) : filteredRecipes.length === 0 ? (
        <div className="text-center py-10">
          {searchTerm ? (
            <p>No recipes found matching "{searchTerm}"</p>
          ) : (
            <p>No recipes yet. Create your first recipe!</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRecipes.map(recipe => (
            <div key={recipe.id} className="border rounded overflow-hidden">
              {recipe.imageUrl && (
                <div className="h-40 relative">
                  <img 
                    src={recipe.imageUrl} 
                    alt={recipe.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                <h2 className="font-bold text-lg mb-2">{recipe.title}</h2>
                <p className="text-gray-700 mb-4 line-clamp-2">{recipe.description}</p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => navigate(`/recipes/${recipe.id}`)}
                    className="flex-1 bg-blue-500 text-white px-2 py-1 rounded flex items-center justify-center"
                  >
                    <FaEye className="mr-1" /> View
                  </button>
                  <button 
                    onClick={() => navigate(`/edit-recipe/${recipe.id}`)}
                    className="flex-1 bg-green-500 text-white px-2 py-1 rounded flex items-center justify-center"
                  >
                    <FaEdit className="mr-1" /> Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserRecipes; 