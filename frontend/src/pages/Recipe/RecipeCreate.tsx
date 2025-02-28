import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import axios from '../../api/axiosConfig.tsx';
import TextInput from '../../components/common/Input/TextInput';
import TextArea from '../../components/common/Input/TextArea';
import { CreateIngredientsInput } from '../../components/common/Input/CreateIngredientsInput';
import DragDropImageInput from '../../components/common/DragDropImageInput/DragDropImageInput';
import FlyingFoods from '../../components/FlyingFoods';
import SuccessModal from '../../components/common/Modal/SuccessModal';
import MacrosInput from '../../components/common/Input/MacrosInput';
import { IFormErrors, IMacros, IRecipeFormData } from '../../types/recipeForm';

const RecipeCreate: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  // Determine if we're in edit mode based on URL parameter
  const isEditing = Boolean(id);

  // Form state
  const [mealName, setMealName] = useState('');
  const [ingredientsUsed, setIngredientsUsed] = useState<string[]>([]);
  const [newIngredient, setNewIngredient] = useState('');
  const [recipeDetails, setRecipeDetails] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [macros, setMacros] = useState<IMacros | undefined>(undefined);
  const [showMacros, setShowMacros] = useState(false);
  const [errors, setErrors] = useState<IFormErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [createdRecipeId, setCreatedRecipeId] = useState<string | null>(null);

  // Initialize animations
  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  // Fetch recipe data if in edit mode
  useEffect(() => {
    if (isEditing && id) {
      const fetchRecipe = async () => {
        setIsLoading(true);
        try {
          const response = await axios.get(`/api/v1/recipes/${id}`);
          const recipeData = response.data;
          
          // Populate form fields with existing data
          setMealName(recipeData.mealName || '');
          setRecipeDetails(recipeData.recipeDetails || '');
          setIngredientsUsed(Array.isArray(recipeData.ingredientsUsed) ? recipeData.ingredientsUsed : []);
          
          // Set macros if they exist and are valid
          if (recipeData.macros && 
              typeof recipeData.macros === 'object' && 
              recipeData.macros !== null) {
            setMacros(recipeData.macros);
            setShowMacros(true);
          }
          
          // Set image preview if available
          if (recipeData.imageUrl) {
            setImagePreview(recipeData.imageUrl);
          }
          
          // Clear any previous errors
          setErrors({});
          setApiError(null);
        } catch (error) {
          console.error('Error fetching recipe for editing:', error);
          setApiError('Failed to load recipe data. Please try again.');
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchRecipe();
    }
  }, [id, isEditing]);

  // Add this validation function
  const validateIngredient = (ingredient: string): boolean => {
    // Check if ingredient is just a number or empty
    if (/^\d+$/.test(ingredient) || ingredient.trim() === '') {
      return false;
    }
    // Ensure ingredient has at least 3 characters
    return ingredient.trim().length >= 3;
  };

  // Update the addIngredient function
  const handleAddIngredient = useCallback(() => {
    const trimmed = newIngredient.trim();
    if (!trimmed) {
      setErrors(prev => ({ ...prev, ingredients: 'Ingredient cannot be empty' }));
      return;
    }
    
    if (!validateIngredient(trimmed)) {
      setErrors(prev => ({ 
        ...prev, 
        ingredients: 'Invalid ingredient format. Must be at least 3 characters and not just a number.' 
      }));
      return;
    }
    
    setIngredientsUsed((prev) => [...prev, trimmed]);
    setNewIngredient('');
    if (errors.ingredients) {
      setErrors((prev) => ({ ...prev, ingredients: undefined }));
    }
  }, [newIngredient, errors.ingredients, validateIngredient]);

  // Also update the validateForm function to check all ingredients
  const validateForm = useCallback((data: IRecipeFormData) => {
    const errors: Record<string, string> = {};
    
    if (!data.mealName.trim()) {
      errors.mealName = 'Meal name is required';
    }
    
    if (!data.recipeDetails.trim()) {
      errors.recipeDetails = 'Recipe details are required';
    }
    
    if (data.ingredientsUsed.length === 0) {
      errors.ingredients = 'At least one ingredient is required';
    } else {
      // Validate each ingredient
      const invalidIngredients = data.ingredientsUsed.filter(ing => !validateIngredient(ing));
      if (invalidIngredients.length > 0) {
        errors.ingredients = `Some ingredients are invalid: ${invalidIngredients.join(', ')}`;
      }
    }
    
    // Add other validations as needed
    
    return errors;
  }, []);

  // Handler: Submit form for create or update
  const handleSubmit = useCallback(async () => {
    setSuccessMessage('');
    setApiError(null);
    
    const formDataObj: IRecipeFormData = {
      mealName,
      recipeDetails,
      ingredientsUsed,
      imageFile,
      macros: showMacros ? macros : undefined,
    };

    const formErrors = validateForm(formDataObj);
    setErrors(formErrors);
    if (Object.keys(formErrors).length > 0) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      
      // Create the recipe data object
      const recipeData = {
        mealName,
        ingredientsUsed,
        recipeDetails,
        // Include macros if they're being shown
        ...(showMacros && macros ? { macros } : {})
      };
      
      // Create a JSON blob with the correct content type
      const recipeBlob = new Blob([JSON.stringify(recipeData)], {
        type: 'application/json'
      });
      
      // Add the recipe data as a properly typed part
      formData.append('request', recipeBlob);
      
      // Add the image if available
      if (imageFile) {
        formData.append('image', imageFile);
      }
      
      let response;
      
      if (isEditing && id) {
        // Update existing recipe
        response = await axios.put(`/api/v1/recipes/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setSuccessMessage('Recipe updated successfully!');
        
        // Redirect to preview page after a short delay
        setTimeout(() => {
          navigate(`/recipes/preview/${id}`);
        }, 1500); // 1.5 second delay to show success message
      } else {
        // Create new recipe
        response = await axios.post('/api/v1/recipes/create-meal', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setCreatedRecipeId(response.data.id || null);
        setSuccessMessage('Recipe created successfully!');
      }
      
      setIsLoading(false);
    } catch (error) {
      // Handle error
      console.error('Error with recipe:', error);
      setApiError(isEditing 
        ? 'Failed to update recipe. Please try again.' 
        : 'Failed to create recipe. Please try again.');
      setIsLoading(false);
    }
  }, [
    mealName,
    recipeDetails,
    ingredientsUsed,
    imageFile,
    macros,
    showMacros,
    validateForm,
    isEditing,
    id,
    navigate,
  ]);

  // Handler: File selection for image upload
  const handleFileSelection = useCallback((file: File) => {
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }, []);

  // Handler: Remove ingredient by index
  const handleRemoveIngredient = useCallback((index: number) => {
    setIngredientsUsed((prev) => prev.filter((_, i) => i !== index));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent to-light p-4 overflow-hidden">
      <FlyingFoods />
      <div className="mt-24 mx-auto w-full max-w-sm">
        <div
          className="relative z-10 bg-white shadow-2xl rounded-3xl p-8 transition-all transform"
          data-aos="fade-up"
        >
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-dark transition-colors duration-300 hover:text-accent">
              {isEditing ? 'Edit Recipe' : 'Create a New Recipe'}
            </h2>
            <p className="text-secondary">
              {isEditing ? 'Update your delicious creation!' : 'Share your delicious creation!'}
            </p>
          </div>
          
          {apiError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{apiError}</span>
            </div>
          )}
          
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
            <CreateIngredientsInput
              ingredientsUsed={ingredientsUsed}
              newIngredient={newIngredient}
              setNewIngredient={(value: string) => {
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
            <MacrosInput
              macros={macros}
              setMacros={setMacros}
              showMacros={showMacros}
              setShowMacros={setShowMacros}
            />
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
                isEditing ? 'Update Recipe' : 'Create Recipe'
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
