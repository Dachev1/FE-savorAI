// pages/RecipeCreate.tsx
import React, { useState, useEffect, useCallback } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import axios from '../../api/axiosConfig';
import HeaderSection from '../../components/HeaderSection';
import TextInput from '../../components/TextInput';
import TextArea from '../../components/TextArea';
import IngredientsInput from '../../components/CreateIngredientsInput';
import DragDropImageInput from '../../components/DragDropImageInput';
import FlyingFoods from '../../components/FlyingFoods';
import MacrosSection from '../../components/MacrosSection';
import SuccessModal from '../../components/SuccessModal';
import { IFormErrors, IMacros, IRecipeFormData, IRecipePayload } from '../../types/recipeForm';

const RecipeCreate: React.FC = () => {
  const [mealName, setMealName] = useState('');
  const [ingredientsUsed, setIngredientsUsed] = useState<string[]>([]);
  const [newIngredient, setNewIngredient] = useState('');
  const [recipeDetails, setRecipeDetails] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [macros, setMacros] = useState<IMacros>({ calories: '', protein: '', carbs: '', fat: '' });
  const [showMacros, setShowMacros] = useState(false);
  const [errors, setErrors] = useState<IFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [createdRecipeId, setCreatedRecipeId] = useState<string | null>(null);

  // Initialize AOS once on mount.
  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  // Reset form state.
  const resetForm = useCallback(() => {
    setMealName('');
    setRecipeDetails('');
    setIngredientsUsed([]);
    setNewIngredient('');
    setImageFile(null);
    setImagePreview(null);
    setMacros({ calories: '', protein: '', carbs: '', fat: '' });
    setErrors({});
    setShowMacros(false);
  }, []);

  // Validate form data.
  const validateForm = (formData: IRecipeFormData): IFormErrors => {
    const errors: IFormErrors = {};
    if (!formData.mealName.trim()) errors.mealName = 'Meal Name is required.';
    if (formData.ingredientsUsed.length === 0) errors.ingredientsUsed = 'At least one ingredient is required.';
    if (!formData.recipeDetails.trim()) errors.recipeDetails = 'Recipe details are required.';
    return errors;
  };

  // Submit the recipe to the backend.
  const handleCreateRecipe = async () => {
    setSuccessMessage('');
    const formDataObj: IRecipeFormData = {
      mealName,
      recipeDetails,
      ingredientsUsed,
      imageFile,
      macros: Object.values(macros).some((value) => value !== '') ? macros : undefined,
    };

    const formErrors = validateForm(formDataObj);
    setErrors(formErrors);
    if (Object.keys(formErrors).length > 0) return;

    const recipePayload: IRecipePayload = {
      mealName,
      recipeDetails,
      ingredientsUsed,
      macros: formDataObj.macros,
    };

    const formDataToSend = new FormData();
    formDataToSend.append('request', new Blob([JSON.stringify(recipePayload)], { type: 'application/json' }));
    if (imageFile) {
      formDataToSend.append('image', imageFile);
    }

    setIsLoading(true);
    try {
      const response = await axios.post('/recipes/create-meal', formDataToSend);
      console.log('New Recipe Created:', response.data);
      setSuccessMessage('Your meal was uploaded successfully!');
      setCreatedRecipeId(response.data.id);
      resetForm();
    } catch (error) {
      console.error('Error creating recipe:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update the image selection and preview.
  const handleFileSelection = useCallback((file: File) => {
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }, []);

  // Add a new ingredient.
  const handleAddIngredient = useCallback(() => {
    if (newIngredient.trim()) {
      setIngredientsUsed((prev) => [...prev, newIngredient.trim()]);
      setNewIngredient('');
      if (errors.ingredientsUsed) {
        setErrors((prev) => ({ ...prev, ingredientsUsed: undefined }));
      }
    }
  }, [newIngredient, errors.ingredientsUsed]);

  // Remove an ingredient by index.
  const handleRemoveIngredient = useCallback((index: number) => {
    setIngredientsUsed((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Update macros. Note: The field is received as a string and then cast to a valid key.
  const handleMacroChange = useCallback((field: string, value: string) => {
    setMacros((prev) => ({ ...prev, [field as keyof IMacros]: value }));
  }, []);

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-br from-accent to-light p-4 overflow-hidden">
      <FlyingFoods />
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
          <DragDropImageInput imagePreview={imagePreview} onFileSelect={handleFileSelection} />
          <div className="mt-6">
            <button
              type="button"
              onClick={() => setShowMacros((prev) => !prev)}
              className="w-full py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-600 transition duration-300 transform hover:-translate-y-1"
            >
              {showMacros ? 'Hide Macros' : 'Add Macros (optional)'}
            </button>
            {showMacros && <MacrosSection macros={macros} onChange={handleMacroChange} />}
          </div>
          <button
            type="button"
            onClick={handleCreateRecipe}
            disabled={isLoading}
            className="w-full py-3 bg-accent text-white font-semibold rounded-lg shadow-lg hover:bg-dark transition-transform transform hover:-translate-y-1 active:translate-y-0 flex items-center justify-center"
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Creating...
              </span>
            ) : (
              'Create Recipe'
            )}
          </button>
        </form>
      </div>
      {successMessage && (
        <SuccessModal
          message={successMessage}
          recipeId={createdRecipeId}
          onClose={() => setSuccessMessage('')}
        />
      )}
      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: translateY(-20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-modalIn { animation: modalIn 0.5s forwards; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-in { animation: fadeIn 0.5s ease-out; }
      `}</style>
    </div>
  );
};

export default RecipeCreate;
