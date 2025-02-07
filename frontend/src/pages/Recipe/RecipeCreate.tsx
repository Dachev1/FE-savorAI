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
  // Form state variables
  const [mealName, setMealName] = useState('');
  const [ingredientsUsed, setIngredientsUsed] = useState<string[]>([]);
  const [newIngredient, setNewIngredient] = useState('');
  const [recipeDetails, setRecipeDetails] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Validation error state
  const [errors, setErrors] = useState<IFormErrors>({});
  // Loading state and success message
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  /**
   * Handle final form submission.
   * This function validates the form, creates a FormData object containing a JSON blob
   * and an optional image file, then posts the data without setting the Content-Type header manually.
   */
  const handleCreateRecipe = async () => {
    // Clear any previous success message
    setSuccessMessage('');

    // Build the form data object for validation
    const formDataObj: IRecipeFormData = {
      mealName,
      recipeDetails,
      ingredientsUsed,
      imageFile,
    };

    // Validate and update errors state
    const formErrors = validateForm(formDataObj);
    setErrors(formErrors);
    if (Object.keys(formErrors).length > 0) return;

    // Prepare the JSON payload for the "request" part
    const recipePayload = {
      mealName,
      recipeDetails,
      ingredientsUsed,
    };

    // Create a FormData instance and append a JSON blob for non-file data
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
      // Do not set Content-Type manually; let the browser/Axios set it automatically
      const response = await axios.post('/recipes/create-meal', formData);
      console.log('New Recipe Created:', response.data);
      setSuccessMessage('Recipe created successfully!');
      // Optionally reset the form fields:
      setMealName('');
      setRecipeDetails('');
      setIngredientsUsed([]);
      setImageFile(null);
      setImagePreview(null);
    } catch (error) {
      console.error('Error creating recipe:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Update state when an image is selected.
   */
  const handleFileSelection = (file: File) => {
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  /**
   * Add a new ingredient to the list.
   */
  const handleAddIngredient = () => {
    if (newIngredient.trim()) {
      setIngredientsUsed((prev) => [...prev, newIngredient.trim()]);
      setNewIngredient('');
    }
  };

  /**
   * Remove an ingredient from the list.
   */
  const handleRemoveIngredient = (index: number) => {
    setIngredientsUsed((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-accent to-light p-4">
      <div
        className="bg-white shadow-lg rounded-3xl p-8 w-full max-w-md hover:shadow-xl transition-all transform hover:-translate-y-0.5"
        data-aos="fade-up"
      >
        <HeaderSection />
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
          <TextInput
            label="Meal Name"
            id="mealName"
            value={mealName}
            setValue={setMealName}
            error={errors.mealName}
            placeholder="e.g. Spiced Chicken Rice Pilaf"
          />

          <IngredientsInput
            ingredientsUsed={ingredientsUsed}
            newIngredient={newIngredient}
            setNewIngredient={setNewIngredient}
            onAddIngredient={handleAddIngredient}
            onRemoveIngredient={handleRemoveIngredient}
            error={errors.ingredientsUsed}
          />

          <TextArea
            label="Recipe Details"
            id="recipeDetails"
            value={recipeDetails}
            setValue={setRecipeDetails}
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
            className="w-full py-3 bg-accent text-white font-semibold rounded-lg shadow-lg hover:bg-dark transition-transform transform hover:-translate-y-0.5 active:translate-y-0"
          >
            {isLoading ? 'Creating...' : 'Create Recipe'}
          </button>

          {successMessage && (
            <p className="mt-4 text-center text-green-600">{successMessage}</p>
          )}
        </form>
      </div>
    </div>
  );
};

export default RecipeCreate;
