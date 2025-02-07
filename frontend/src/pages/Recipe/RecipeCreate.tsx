import React, { useState, useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import axios from '../../api/axiosConfig';

// Import components
import HeaderSection from '../../components/HeaderSection';
import TextInput from '../../components/TextInput';
import TextArea from '../../components/TextArea';
import IngredientsInput from '../../components/CreateIngredientsInput';
import DragDropImageInput from '../../components/DragDropImageInput';
import FlyingFoods from '../../components/FlyingFoods';  // Updated import

/** -----------------------------
 *  Types & Interfaces
 * ----------------------------- */
interface IFormErrors {
  mealName?: string;
  ingredientsUsed?: string;
  recipeDetails?: string;
}

interface IRecipeFormData {
  mealName: string;
  ingredientsUsed: string[];
  recipeDetails: string;
  imageFile: File | null;
}

/** -----------------------------
 *  Validation Helper
 * ----------------------------- */
function validateForm(formData: IRecipeFormData): IFormErrors {
  const newErrors: IFormErrors = {};

  if (!formData.mealName.trim()) {
    newErrors.mealName = 'Meal Name is required.';
  }
  if (formData.ingredientsUsed.length === 0) {
    newErrors.ingredientsUsed = 'At least one ingredient is required.';
  }
  if (!formData.recipeDetails.trim()) {
    newErrors.recipeDetails = 'Recipe details are required.';
  }

  return newErrors;
}

/** -----------------------------
 *  Main Component: RecipeCreate
 * ----------------------------- */
const RecipeCreate: React.FC = () => {
  // Form fields state
  const [mealName, setMealName] = useState('');
  const [ingredientsUsed, setIngredientsUsed] = useState<string[]>([]);
  const [newIngredient, setNewIngredient] = useState('');
  const [recipeDetails, setRecipeDetails] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Error, loading, and success state
  const [errors, setErrors] = useState<IFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Initialize AOS scroll animations
  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  // Auto-dismiss the success modal after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  /**
   * Handle recipe creation:
   * - Validate fields and update error state.
   * - If valid, post the data (with a JSON blob and optional image file).
   * - On success, show a modal pop-up and reset the form.
   */
  const handleCreateRecipe = async () => {
    setSuccessMessage('');

    const formDataObj: IRecipeFormData = {
      mealName,
      recipeDetails,
      ingredientsUsed,
      imageFile,
    };

    const formErrors = validateForm(formDataObj);
    setErrors(formErrors);
    if (Object.keys(formErrors).length > 0) return;

    const recipePayload = { mealName, recipeDetails, ingredientsUsed };

    const formData = new FormData();
    formData.append(
      'request',
      new Blob([JSON.stringify(recipePayload)], { type: 'application/json' })
    );
    if (imageFile) {
      formData.append('image', imageFile);
    }

    setIsLoading(true);
    try {
      const response = await axios.post('/recipes/create-meal', formData);
      console.log('New Recipe Created:', response.data);
      setSuccessMessage('Your meal was uploaded successfully!');

      // Reset the form fields and errors
      setMealName('');
      setRecipeDetails('');
      setIngredientsUsed([]);
      setNewIngredient('');
      setImageFile(null);
      setImagePreview(null);
      setErrors({});
    } catch (error) {
      console.error('Error creating recipe:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Update image file selection and preview.
   */
  const handleFileSelection = (file: File) => {
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  /**
   * Add a new ingredient and clear any related error.
   */
  const handleAddIngredient = () => {
    if (newIngredient.trim()) {
      setIngredientsUsed((prev) => [...prev, newIngredient.trim()]);
      setNewIngredient('');
      if (errors.ingredientsUsed) {
        setErrors((prev) => ({ ...prev, ingredientsUsed: undefined }));
      }
    }
  };

  /**
   * Remove an ingredient from the list.
   */
  const handleRemoveIngredient = (index: number) => {
    setIngredientsUsed((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-br from-accent to-light p-4 overflow-hidden">
      {/* Flying food emojis background */}
      <FlyingFoods />

      {/* Form container with a higher z-index */}
      <div
        className="relative z-10 bg-white shadow-2xl rounded-3xl p-8 w-full max-w-md hover:shadow-2xl transition-all transform hover:-translate-y-1"
        data-aos="fade-up"
      >
        <HeaderSection />
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <TextInput
            label="Meal Name"
            id="mealName"
            value={mealName}
            setValue={(value) => {
              setMealName(value);
              if (errors.mealName) {
                setErrors((prev) => ({ ...prev, mealName: undefined }));
              }
            }}
            error={errors.mealName}
            placeholder="e.g. Spiced Chicken Rice Pilaf"
          />

          <IngredientsInput
            ingredientsUsed={ingredientsUsed}
            newIngredient={newIngredient}
            setNewIngredient={(value) => {
              setNewIngredient(value);
              if (errors.ingredientsUsed) {
                setErrors((prev) => ({ ...prev, ingredientsUsed: undefined }));
              }
            }}
            onAddIngredient={handleAddIngredient}
            onRemoveIngredient={handleRemoveIngredient}
            error={errors.ingredientsUsed}
          />

          <TextArea
            label="Recipe Details"
            id="recipeDetails"
            value={recipeDetails}
            setValue={(value) => {
              setRecipeDetails(value);
              if (errors.recipeDetails) {
                setErrors((prev) => ({ ...prev, recipeDetails: undefined }));
              }
            }}
            error={errors.recipeDetails}
            placeholder="Describe the preparation steps..."
          />

          <DragDropImageInput
            imagePreview={imagePreview}
            onFileSelect={handleFileSelection}
          />

          <button
            type="button"
            onClick={handleCreateRecipe}
            disabled={isLoading}
            className="w-full py-3 bg-accent text-white font-semibold rounded-lg shadow-lg hover:bg-dark transition-transform transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center"
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin h-5 w-5 mr-3 text-white"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  ></path>
                </svg>
                Creating...
              </span>
            ) : (
              'Create Recipe'
            )}
          </button>
        </form>
      </div>

      {/* Animated Success Modal */}
      {successMessage && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black opacity-50"></div>
          {/* Modal */}
          <div className="bg-white p-8 rounded-xl shadow-2xl border border-green-400 transform transition-all duration-500 ease-out animate-modalIn">
            <p className="text-green-600 text-xl font-bold text-center">
              {successMessage}
            </p>
          </div>
        </div>
      )}

      {/* Inline style for modal animation */}
      <style>{`
        @keyframes modalIn {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-modalIn {
          animation: modalIn 0.5s forwards;
        }
      `}</style>
    </div>
  );
};

export default RecipeCreate;
