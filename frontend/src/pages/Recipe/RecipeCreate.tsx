import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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

const initialMacros: IMacros = { calories: '', protein: '', carbs: '', fat: '' };

const RecipeCreate: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const editingRecipe = location.state?.recipe;
  const isEditing = Boolean(editingRecipe);

  // Form state
  const [mealName, setMealName] = useState('');
  const [ingredientsUsed, setIngredientsUsed] = useState<string[]>([]);
  const [newIngredient, setNewIngredient] = useState('');
  const [recipeDetails, setRecipeDetails] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [macros, setMacros] = useState<IMacros>(initialMacros);
  const [showMacros, setShowMacros] = useState(false);
  const [errors, setErrors] = useState<IFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [createdRecipeId, setCreatedRecipeId] = useState<string | null>(null);

  // Initialize animations
  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  // Pre-fill form if editing an existing recipe
  useEffect(() => {
    if (!editingRecipe) return;

    setMealName(editingRecipe.mealName || '');
    
    // Handle recipe details whether it's a string or an object with instructions.
    if (typeof editingRecipe.recipeDetails === 'string') {
      setRecipeDetails(editingRecipe.recipeDetails);
    } else if (editingRecipe.recipeDetails?.instructions) {
      setRecipeDetails(editingRecipe.recipeDetails.instructions.join(' '));
    }
    
    setIngredientsUsed(editingRecipe.ingredientsUsed || []);
    if (editingRecipe.imageUrl) setImagePreview(editingRecipe.imageUrl);
    // Uncomment if macros are available:
    // if (editingRecipe.macros) setMacros(editingRecipe.macros);
  }, [editingRecipe]);

  // Helper: Reset form fields to initial values
  const resetForm = useCallback(() => {
    setMealName('');
    setRecipeDetails('');
    setIngredientsUsed([]);
    setNewIngredient('');
    setImageFile(null);
    setImagePreview(null);
    setMacros(initialMacros);
    setErrors({});
    setShowMacros(false);
  }, []);

  // Helper: Validate form and return error object (if any)
  const validateForm = useCallback((formData: IRecipeFormData): IFormErrors => {
    const formErrors: IFormErrors = {};
    if (!formData.mealName.trim()) {
      formErrors.mealName = 'Meal Name is required.';
    }
    if (formData.ingredientsUsed.length === 0) {
      formErrors.ingredientsUsed = 'At least one ingredient is required.';
    }
    if (!formData.recipeDetails.trim()) {
      formErrors.recipeDetails = 'Recipe details are required.';
    }
    return formErrors;
  }, []);

  // Handler: Submit form for create or update
  const handleSubmit = useCallback(async () => {
    setSuccessMessage('');
    const formDataObj: IRecipeFormData = {
      mealName,
      recipeDetails,
      ingredientsUsed,
      imageFile,
      macros: Object.values(macros).some((val) => val !== '') ? macros : undefined,
    };

    const formErrors = validateForm(formDataObj);
    setErrors(formErrors);
    if (Object.keys(formErrors).length > 0) return;

    // Prepare payload and FormData for submission
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
      if (isEditing && editingRecipe.id) {
        const response = await axios.put(`/recipes/${editingRecipe.id}`, formDataToSend);
        console.log('Recipe Updated:', response.data);
        setSuccessMessage('Your meal was updated successfully!');
        setCreatedRecipeId(editingRecipe.id);
      } else {
        const response = await axios.post('/recipes/create-meal', formDataToSend);
        console.log('New Recipe Created:', response.data);
        setSuccessMessage('Your meal was uploaded successfully!');
        setCreatedRecipeId(response.data.id);
        resetForm();
      }
    } catch (error) {
      console.error(isEditing ? 'Error updating recipe:' : 'Error creating recipe:', error);
    } finally {
      setIsLoading(false);
    }
  }, [
    mealName,
    recipeDetails,
    ingredientsUsed,
    imageFile,
    macros,
    validateForm,
    resetForm,
    isEditing,
    editingRecipe,
  ]);

  // Handler: File selection for image upload
  const handleFileSelection = useCallback((file: File) => {
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }, []);

  // Handler: Add ingredient to list
  const handleAddIngredient = useCallback(() => {
    const trimmed = newIngredient.trim();
    if (!trimmed) return;
    setIngredientsUsed((prev) => [...prev, trimmed]);
    setNewIngredient('');
    if (errors.ingredientsUsed) {
      setErrors((prev) => ({ ...prev, ingredientsUsed: undefined }));
    }
  }, [newIngredient, errors.ingredientsUsed]);

  // Handler: Remove ingredient by index
  const handleRemoveIngredient = useCallback((index: number) => {
    setIngredientsUsed((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Handler: Change macro value
  const handleMacroChange = useCallback((field: string, value: string) => {
    setMacros((prev) => ({ ...prev, [field as keyof IMacros]: value }));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent to-light p-4 overflow-hidden">
      <FlyingFoods />
      <div className="mt-24 mx-auto w-full max-w-sm">
        <div
          className="relative z-10 bg-white shadow-2xl rounded-3xl p-8 transition-all transform"
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
                className="w-full py-2 bg-blue-500 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-600 transition"
              >
                {showMacros ? 'Hide Macros' : 'Add Macros (optional)'}
              </button>
              {showMacros && <MacrosSection macros={macros} onChange={handleMacroChange} />}
            </div>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full py-3 bg-accent text-white font-semibold rounded-lg shadow-lg hover:bg-dark transition flex items-center justify-center"
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
                  {isEditing ? 'Updating...' : 'Creating...'}
                </span>
              ) : (
                isEditing ? 'Edit Recipe' : 'Create Recipe'
              )}
            </button>
          </form>
        </div>
      </div>
      {successMessage && (
        <SuccessModal
          message={successMessage}
          recipeId={createdRecipeId}
          onClose={() => {
            setSuccessMessage('');
            navigate('/recipes');
          }}
        />
      )}
    </div>
  );
};

export default RecipeCreate;
