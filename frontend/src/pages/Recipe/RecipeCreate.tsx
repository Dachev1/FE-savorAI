import React, { useState, useRef, useEffect, DragEvent, ChangeEvent, KeyboardEvent } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

interface IFormErrors {
  mealName?: string;
  ingredientsUsed?: string;
  recipeDetails?: string;
}

const RecipeCreate: React.FC = () => {
  const [mealName, setMealName] = useState('');
  const [ingredientsUsed, setIngredientsUsed] = useState<string[]>([]);
  const [newIngredient, setNewIngredient] = useState('');
  const [recipeDetails, setRecipeDetails] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<IFormErrors>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      e.dataTransfer.clearData();
    }
  };

  const handleClickUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (files && files.length > 0) {
      const file = files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAddIngredient = () => {
    if (newIngredient.trim()) {
      setIngredientsUsed((prev) => [...prev, newIngredient.trim()]);
      setNewIngredient('');
    }
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredientsUsed((prev) => prev.filter((_, i) => i !== index));
  };

  const handleIngredientKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddIngredient();
    }
  };

  const validateForm = () => {
    const newErrors: IFormErrors = {};
    if (!mealName.trim()) newErrors.mealName = 'Meal Name is required.';
    if (ingredientsUsed.length === 0) newErrors.ingredientsUsed = 'At least one ingredient is required.';
    if (!recipeDetails.trim()) newErrors.recipeDetails = 'Recipe details are required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateRecipe = () => {
    if (validateForm()) {
      console.log('New Recipe Created:', {
        mealName,
        ingredientsUsed,
        recipeDetails,
        imageFile,
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-accent to-light p-4">
      <div
        className="bg-white shadow-lg rounded-3xl p-8 w-full max-w-md hover:shadow-xl transition-all transform hover:-translate-y-0.5"
        data-aos="fade-up"
      >
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-dark transition-colors duration-300 hover:text-accent">
            Create a New Recipe
          </h2>
          <p className="text-secondary">Share your delicious creation!</p>
        </div>
        <form className="space-y-6">
          <div>
            <label
              htmlFor="mealName"
              className={`block text-sm font-medium transition-colors ${
                mealName ? 'text-accent' : 'text-secondary'
              }`}
            >
              Meal Name
            </label>
            <input
              id="mealName"
              type="text"
              value={mealName}
              onChange={(e) => setMealName(e.target.value)}
              className={`mt-1 w-full px-4 py-3 rounded-lg border shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent ${
                errors.mealName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g. Spiced Chicken Rice Pilaf"
            />
            {errors.mealName && (
              <p className="mt-2 text-sm text-red-500 animate-pulse">{errors.mealName}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="ingredientsUsed"
              className={`block text-sm font-medium transition-colors ${
                ingredientsUsed.length > 0 ? 'text-accent' : 'text-secondary'
              }`}
            >
              Ingredients
            </label>
            <div className="flex mt-1 space-x-2">
              <input
                id="ingredientsUsed"
                type="text"
                value={newIngredient}
                onChange={(e) => setNewIngredient(e.target.value)}
                onKeyDown={handleIngredientKeyDown}
                className={`w-full px-4 py-3 rounded-lg border shadow-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors duration-200 ${
                  errors.ingredientsUsed ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Type an ingredient and press Enter or +"
              />
              <button
                type="button"
                onClick={handleAddIngredient}
                className="px-5 py-3 bg-accent text-white font-semibold rounded-lg shadow-lg transform transition-transform active:scale-95 hover:bg-dark"
              >
                +
              </button>
            </div>
            {errors.ingredientsUsed && (
              <p className="mt-2 text-sm text-red-500 animate-pulse">{errors.ingredientsUsed}</p>
            )}
            <div className="flex flex-wrap gap-2 mt-3">
              {ingredientsUsed.map((ingredient, index) => (
                <div
                  key={index}
                  className="flex items-center bg-accent text-white px-3 py-1 rounded-full text-sm shadow-md hover:bg-dark transition-colors"
                >
                  <span>{ingredient}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveIngredient(index)}
                    className="ml-2 text-xs bg-white text-accent rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div>
            <label
              htmlFor="recipeDetails"
              className={`block text-sm font-medium transition-colors ${
                recipeDetails ? 'text-accent' : 'text-secondary'
              }`}
            >
              Recipe Details
            </label>
            <textarea
              id="recipeDetails"
              rows={6}
              value={recipeDetails}
              onChange={(e) => setRecipeDetails(e.target.value)}
              className={`mt-1 w-full px-4 py-3 rounded-lg border shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent ${
                errors.recipeDetails ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Describe the preparation steps..."
            />
            {errors.recipeDetails && (
              <p className="mt-2 text-sm text-red-500 animate-pulse">{errors.recipeDetails}</p>
            )}
          </div>
          <div
            className={`border-2 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer transition-colors duration-300 ${
              isDragging ? 'border-accent bg-blue-50' : 'border-dashed border-gray-300 hover:border-accent'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClickUpload}
          >
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg mb-2 shadow-md transform hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <p className="text-secondary text-sm transition-colors">
                {isDragging
                  ? 'Drop the image here...'
                  : 'Drag & Drop an image, or click to select.'}
              </p>
            )}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
          <button
            type="button"
            onClick={handleCreateRecipe}
            className="w-full py-3 bg-accent text-white font-semibold rounded-lg shadow-lg hover:bg-dark transition-transform transform hover:-translate-y-0.5 active:translate-y-0"
          >
            Create Recipe
          </button>
        </form>
      </div>
    </div>
  );
};

export default RecipeCreate;
