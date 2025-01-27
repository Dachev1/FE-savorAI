import React, { useState, useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import axios from '../../api/axiosConfig';

// -----------------------------------------------
// Types & Interfaces
// -----------------------------------------------
interface RecipeResponse {
  image: string; // Frontend expects 'image'
  ingredientsUsed: string[];
  mealName: string;
  recipeDetails: string;
}

// -----------------------------------------------
// Main Component
// -----------------------------------------------
const Features: React.FC = () => {
  // State
  const [ingredients, setIngredients] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recipe, setRecipe] = useState<RecipeResponse | null>(null);
  const [copySuccess, setCopySuccess] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);

  // AOS Initialization
  useEffect(() => {
    AOS.init({ duration: 1000, easing: 'ease-in-out', once: true });
  }, []);

  // -----------------------------------------------
  // Handlers
  // -----------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setRecipe(null);

    const ingredientsArray = ingredients
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    try {
      const response = await axios.post<{
        mealName: string;
        ingredientsUsed: string[];
        recipeDetails: string;
        imageUrl: string;
      }>(
        '/recipes/generate-meal',
        { ingredients: ingredientsArray }
      );

      // Map the backend response to match the frontend interface
      const mappedRecipe: RecipeResponse = {
        image: response.data.imageUrl, // Mapping 'imageUrl' to 'image'
        ingredientsUsed: response.data.ingredientsUsed,
        mealName: response.data.mealName,
        recipeDetails: response.data.recipeDetails,
      };

      setRecipe(mappedRecipe);
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (recipe?.recipeDetails) {
      navigator.clipboard.writeText(recipe.recipeDetails).then(
        () => setCopySuccess('Recipe details copied to clipboard!'),
        () => setCopySuccess('Failed to copy recipe details.')
      );
      // Clear message after 3 seconds
      setTimeout(() => setCopySuccess(''), 3000);
    }
  };

  const toggleFavorite = () => {
    setIsFavorite((prev) => !prev);
  };

  // -----------------------------------------------
  // Render
  // -----------------------------------------------
  return (
    <div
      className="relative flex flex-col min-h-screen bg-gradient-to-br from-light via-softGray to-accent overflow-hidden"
      data-aos="fade-in"
    >
      <BackgroundCircles />

      <div className="flex-grow flex items-center justify-center px-6 sm:px-8 lg:px-12 py-20">
        <div
          className="w-full max-w-3xl bg-white/80 backdrop-blur-md rounded-3xl shadow-lg p-10
                     border border-gray-200 transition-transform duration-500 hover:-translate-y-2 hover:shadow-2xl"
          data-aos="fade-up"
        >
          <h1
            className="text-5xl sm:text-6xl font-extrabold text-transparent bg-clip-text
                       bg-gradient-to-r from-accent to-dark text-center mb-10 drop-shadow-md"
          >
            Discover Your Recipe
          </h1>

          <RecipeGeneratorForm
            ingredients={ingredients}
            setIngredients={setIngredients}
            loading={loading}
            onSubmit={handleSubmit}
          />

          {error && (
            <p className="text-red-500 font-semibold text-center mt-6">
              {error}
            </p>
          )}

          {recipe && (
            <RecipeCard
              recipe={recipe}
              isFavorite={isFavorite}
              copySuccess={copySuccess}
              onCopy={copyToClipboard}
              onToggleFavorite={toggleFavorite}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Features;

// -----------------------------------------------
// Subcomponent: BackgroundCircles
// -----------------------------------------------
const BackgroundCircles: React.FC = () => (
  <>
    <div
      className="absolute top-0 left-0 w-96 h-96 rounded-full bg-accent opacity-20 blur-3xl animate-pulse -z-10"
      data-aos="zoom-in"
    />
    <div
      className="absolute bottom-0 right-0 w-72 h-72 rounded-full bg-dark opacity-10 blur-3xl animate-pulse -z-10"
      data-aos="zoom-in"
      data-aos-delay="300"
    />
  </>
);

// -----------------------------------------------
// Subcomponent: RecipeGeneratorForm
// -----------------------------------------------
interface RecipeGeneratorFormProps {
  ingredients: string;
  setIngredients: React.Dispatch<React.SetStateAction<string>>;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

const RecipeGeneratorForm: React.FC<RecipeGeneratorFormProps> = ({
  ingredients,
  setIngredients,
  loading,
  onSubmit,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <div>
        <label
          htmlFor="ingredients"
          className="block mb-3 text-lg font-semibold text-dark"
        >
          Enter Ingredients (comma-separated):
        </label>
        <input
          id="ingredients"
          type="text"
          placeholder="e.g. chicken, rice, tomatoes"
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-5 py-3 text-dark
                     focus:outline-none focus:ring-4 focus:ring-accent
                     transition-all placeholder:text-gray-400 shadow-sm"
        />
      </div>

      <button
        type="submit"
        disabled={!ingredients.trim() || loading}
        className="w-full py-4 rounded-full bg-gradient-to-r from-accent to-dark
                   text-white font-bold text-xl shadow-md
                   transition-transform duration-300 hover:scale-105
                   focus:outline-none focus:ring-4 focus:ring-dark
                   disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Generating...' : 'Generate Recipe'}
      </button>
    </form>
  );
};

// -----------------------------------------------
// Subcomponent: RecipeCard
// -----------------------------------------------
interface RecipeCardProps {
  recipe: RecipeResponse;
  isFavorite: boolean;
  copySuccess: string;
  onCopy: () => void;
  onToggleFavorite: () => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  isFavorite,
  copySuccess,
  onCopy,
  onToggleFavorite,
}) => {
  return (
    <div
      className="mt-10 bg-white rounded-2xl shadow-lg p-8 transition-transform
                 duration-300 hover:scale-[1.02] border border-gray-100"
      data-aos="fade-up"
    >
      <h2 className="text-4xl font-bold text-accent mb-6 text-center">
        {recipe.mealName}
      </h2>

      <div className="relative overflow-hidden rounded-xl mb-6">
        <img
          src={recipe.image} // Uses the mapped 'image' field
          alt={recipe.mealName}
          className="w-full h-auto object-cover
                     transform hover:scale-105 transition-transform duration-500"
        />
      </div>

      <p className="text-lg text-dark leading-relaxed mb-4">
        <strong>Ingredients Used:</strong> {recipe.ingredientsUsed.join(', ')}
      </p>

      <p className="text-dark/90 leading-relaxed text-md whitespace-pre-wrap mb-4">
        {recipe.recipeDetails}
      </p>

      <div className="flex justify-between items-center">
        <button
          onClick={onCopy}
          className="py-3 px-6 rounded-lg bg-gradient-to-r from-accent to-dark
                     text-white font-semibold text-lg shadow-md
                     transition-transform duration-300 hover:scale-105
                     focus:outline-none focus:ring-4 focus:ring-dark"
        >
          Copy Recipe Details
        </button>
        <button
          onClick={onToggleFavorite}
          className={`py-3 px-6 rounded-lg text-white font-semibold text-lg
                     ${
                       isFavorite ? 'bg-red-500' : 'bg-gray-500'
                     } shadow-md transition-transform duration-300 hover:scale-105`}
        >
          {isFavorite ? '❤️ Added to Favorites' : '🤍 Add to Favorites'}
        </button>
      </div>

      {copySuccess && (
        <p className="text-green-500 font-semibold text-center mt-4">
          {copySuccess}
        </p>
      )}
    </div>
  );
};
