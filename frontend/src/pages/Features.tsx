import React, { useState, useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
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

  useEffect(() => {
    AOS.init({ duration: 1000, easing: "ease-in-out", once: true });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setRecipe(null);

    const ingredientsArray = ingredients
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    try {
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
    <div
      className="relative flex flex-col min-h-screen bg-gradient-to-br from-light via-softGray to-accent overflow-hidden"
      data-aos="fade-in"
    >
      <div
        className="absolute top-0 left-0 w-96 h-96 rounded-full bg-accent opacity-20 blur-3xl animate-pulse -z-10"
        data-aos="zoom-in"
      />
      <div
        className="absolute bottom-0 right-0 w-72 h-72 rounded-full bg-dark opacity-10 blur-3xl animate-pulse -z-10"
        data-aos="zoom-in"
        data-aos-delay="300"
      />

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

          <form onSubmit={handleSubmit} className="space-y-8">
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
              {loading ? "Generating..." : "Generate Recipe"}
            </button>
          </form>

          {error && (
            <p className="text-red-500 font-semibold text-center mt-6">{error}</p>
          )}

          {recipe && (
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
                  src={recipe.image}
                  alt={recipe.mealName}
                  className="w-full h-auto object-cover
                             transform hover:scale-105 transition-transform duration-500"
                />
              </div>
              <p className="text-lg text-dark leading-relaxed mb-4">
                <strong>Ingredients Used:</strong> {recipe.ingredientsUsed.join(", ")}
              </p>
              <p className="text-dark/90 leading-relaxed text-md whitespace-pre-wrap">
                {recipe.recipeDetails}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Features;
