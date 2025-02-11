import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../api/axiosConfig';
import FlyingFoods from '../../components/FlyingFoods';
import PreviewCard from '../../components/PreviewCard';
import { RecipeResponse } from '../../types';

const RecipePreview: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState<RecipeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const response = await axios.get(`/recipes/${id}`);
        setRecipe(response.data);
      } catch (error) {
        console.error('Error fetching recipe:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRecipe();
    } else {
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-accent to-light">
        <p className="text-white text-xl">Loading Recipe Preview...</p>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-accent to-light">
        <p className="text-white text-xl">Recipe not found.</p>
        <button
          onClick={() => navigate('/recipes')}
          className="mt-4 px-6 py-2 bg-white text-accent font-bold rounded shadow hover:bg-gray-100 transition"
        >
          Back to Recipes
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-accent to-light p-6 flex flex-col items-center">
      <FlyingFoods />
      <div className="w-full max-w-4xl mt-12 animate-fadeIn">
        <PreviewCard recipe={recipe} />
      </div>
      <button
        onClick={() => navigate('/recipes')}
        className="mt-8 px-6 py-3 bg-white text-accent font-bold rounded-lg shadow hover:bg-gray-200 transition transform hover:scale-105"
      >
        Back to Recipes
      </button>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out;
        }
      `}</style>
    </div>
  );
};

export default RecipePreview;
