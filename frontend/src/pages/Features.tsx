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
      {/* Subtle floating accent blobs */}
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
          className="w-full max-w-2xl bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl p-8
                     border border-white/20 overflow-hidden
                     transform hover:-translate-y-1 transition-all duration-500
                     hover:shadow-[0_15px_40px_rgba(0,0,0,0.2)]"
          data-aos="fade-up"
        >
          <h1
            className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text
                       bg-gradient-to-r from-accent to-dark text-center mb-8 drop-shadow-sm"
          >
            Generate a Meal
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="ingredients"
                className="block mb-2 text-sm font-semibold text-dark"
              >
                Enter Ingredients (comma separated)
              </label>
              <input
                id="ingredients"
                type="text"
                placeholder="e.g. eggs, bread"
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-4 py-2 text-dark
                           focus:outline-none focus:ring-2 focus:ring-accent
                           focus:border-transparent transition-all
                           placeholder:text-gray-400"
              />
            </div>

            <button
              type="submit"
              disabled={!ingredients.trim() || loading}
              className="w-full py-3 rounded-full bg-gradient-to-r from-accent to-dark
                         text-white font-bold shadow-lg
                         transition-transform duration-300 hover:scale-105
                         focus:outline-none focus:ring-2 focus:ring-dark
                         disabled:opacity-50"
            >
              {loading ? "Generating..." : "Generate Meal"}
            </button>
          </form>

          {error && (
            <p className="text-red-600 font-semibold text-center mt-6">{error}</p>
          )}

          {recipe && (
            <div
              className="mt-10 p-6 bg-white rounded-xl shadow-md transition-transform
                         duration-300 hover:scale-[1.02] hover:shadow-lg
                         border border-gray-100"
              data-aos="fade-up"
            >
              <h2 className="text-3xl font-bold text-accent mb-4 text-center">
                {recipe.mealName}
              </h2>
              <div className="relative overflow-hidden rounded-xl mb-4">
                <img
                  src={recipe.image}
                  alt={recipe.mealName}
                  className="w-full h-auto object-cover
                             transform hover:scale-110 transition-transform duration-500"
                />
              </div>
              <p className="text-dark leading-relaxed mb-2">
                <strong>Ingredients Used:</strong>{" "}
                {recipe.ingredientsUsed.join(", ")}
              </p>
              <p className="text-dark/90 leading-relaxed whitespace-pre-wrap">
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
