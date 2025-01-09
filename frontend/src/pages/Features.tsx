import React, { useState } from "react";
import axios from "../api/axiosConfig";

interface RecipeResponse {
  image: string;
  ingredientsUsed: string[];
  mealName: string;
  recipeDetails: string;
}

const Features: React.FC = () => {
  const [ingredients, setIngredients] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [recipe, setRecipe] = useState<RecipeResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setRecipe(null);

    // Convert comma-separated string to array
    const ingredientsArray = ingredients
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    try {
      // Make a real request to your backend
      const response = await axios.post<RecipeResponse>(
        "/recipes/generate-meal",
        { ingredients: ingredientsArray }
      );
      setRecipe(response.data);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded shadow p-6">
        <h1 className="text-2xl font-bold text-center mb-4">Generate a Meal</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="ingredients" className="block font-medium mb-1">
              Enter Ingredients (comma separated)
            </label>
            <input
              id="ingredients"
              type="text"
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="e.g. eggs, bread"
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={!ingredients.trim() || loading}
            className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Generating..." : "Generate Meal"}
          </button>
        </form>

        {error && (
          <p className="text-red-600 text-center mt-4">{error}</p>
        )}

        {recipe && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2">{recipe.mealName}</h2>
            <img
              src={recipe.image}
              alt={recipe.mealName}
              className="w-full h-auto object-cover rounded mb-3"
            />
            <p className="text-gray-700 whitespace-pre-line">
              <strong>Ingredients Used:</strong> {recipe.ingredientsUsed.join(", ")}
            </p>
            <p className="text-gray-700 whitespace-pre-line mt-2">
              {recipe.recipeDetails}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Features;
