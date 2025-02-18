import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../../api/axiosConfig';
import { isCancel, isAxiosError } from 'axios';
import FlyingFoods from '../../components/FlyingFoods';
import PreviewCard from '../../components/PreviewCard';
import { RecipeResponse } from '../../types/recipe';

const RecipePreview: React.FC = () => {
  // Extract the recipe ID from URL parameters and get navigation and location objects.
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // Determine if the user came from the create/edit form.
  const fromCreate = location.state?.fromCreate;

  // Local component state.
  const [recipe, setRecipe] = useState<RecipeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch recipe on component mount or when the id changes.
  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchRecipe = async () => {
      try {
        const { data } = await axiosInstance.get<RecipeResponse>(`/recipes/${id}`, {
          signal: controller.signal,
        });
        setRecipe(data);
      } catch (err: unknown) {
        if (isCancel(err)) {
          console.log('Request canceled:', (err as Error).message);
        } else if (isAxiosError(err)) {
          console.error('Error fetching recipe:', err);
          setError('An error occurred while fetching the recipe.');
        } else {
          console.error('Unexpected error:', err);
          setError('An unexpected error occurred.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();

    // Cleanup: abort the request if the component unmounts.
    return () => controller.abort();
  }, [id]);

  // Display loading state.
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-accent to-light">
        <p className="text-white text-xl">Loading Recipe Preview...</p>
      </div>
    );
  }

  // Display error state or if no recipe was found.
  if (error || !recipe) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-accent to-light">
        <p className="text-white text-xl">{error || 'Recipe not found.'}</p>
        <button
          onClick={() => navigate('/recipes')}
          className="mt-4 px-6 py-2 bg-white text-accent font-bold rounded shadow hover:bg-gray-100 transition"
        >
          Back to Recipes
        </button>
      </div>
    );
  }

  // Render the recipe preview.
  return (
    <div className="min-h-screen bg-gradient-to-br from-accent to-light p-4 overflow-hidden relative flex flex-col items-center justify-center pt-24">
      <div className="absolute inset-0 -z-10">
        <FlyingFoods />
      </div>
      <div className="w-full max-w-lg mx-auto animate-fadeIn relative z-10 mt-16">
        <PreviewCard recipe={recipe} />
      </div>
      <div className="flex flex-col sm:flex-row gap-4 mt-8 relative z-10">
        <button
          onClick={() => {
            if (fromCreate) {
              // If the user came from the create/edit form, send them back to edit.
              navigate('/recipes/create', { state: { recipe } });
            } else {
              navigate('/recipes');
            }
          }}
          className="px-6 py-3 bg-white text-accent font-bold rounded-full shadow hover:bg-gray-200 transition transform hover:scale-105"
        >
          {fromCreate ? 'Back to Edit' : 'Back to Recipes'}
        </button>
        <button
          onClick={() => navigate('/recipes/create', { state: { recipe } })}
          className="px-6 py-3 bg-blue-500 text-white font-bold rounded-full shadow hover:bg-blue-600 transition transform hover:scale-105"
        >
          Edit Recipe
        </button>
      </div>
    </div>
  );
};

export default RecipePreview;
