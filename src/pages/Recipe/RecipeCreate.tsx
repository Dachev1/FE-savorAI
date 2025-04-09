import React, { useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import axios from '../../api/axiosConfig.tsx';
import TextInput from '../../components/common/Input/TextInput';
import TextArea from '../../components/common/Input/TextArea';
import { CreateIngredientsInput } from '../../components/common/Input/CreateIngredientsInput';
import MacrosInput from '../../components/common/Input/MacrosInput';
import { IFormErrors, IMacros, IRecipeFormData } from '../../types/recipeForm';
import RecipePreview from './RecipePreview';
import { FaArrowLeft, FaEdit, FaUtensils, FaChartBar, FaEye, FaLeaf, FaListUl, FaInfoCircle, FaRegLightbulb, FaExclamationCircle, FaCheckCircle, FaCheck, FaHeart, FaImage, FaUpload } from 'react-icons/fa';

// Props interface for FormSection component
interface FormSectionProps {
  icon: ReactNode;
  title: string;
  children: ReactNode;
  color: string;
  delay?: number;
}

// Section component for consistent styling
const FormSection: React.FC<FormSectionProps> = ({ icon, title, children, color, delay = 0 }) => (
  <div 
    className={`p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-${color}-100 dark:border-${color}-900/30 hover:shadow-md transition-all duration-300 mb-6 transform hover:-translate-y-1`}
  >
    <div className="flex items-center mb-5">
      <div className={`p-2.5 bg-${color}-50 dark:bg-${color}-900/20 rounded-lg text-${color}-500`}>
        {icon}
      </div>
      <h3 className="ml-3 text-lg font-semibold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
        {title}
      </h3>
    </div>
    <div className="ml-1">
      {children}
    </div>
  </div>
);

const RecipeCreate: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const navigate = useNavigate();
  
  // Form state
  const [mealName, setMealName] = useState('');
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [recipeDetails, setRecipeDetails] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [errors, setErrors] = useState<IFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [macros, setMacros] = useState<IMacros>({
    calories: 0,
    protein: 0,
    carbohydrates: 0,
    fat: 0
  });
  const [showMacros, setShowMacros] = useState(false);
  const [prepTimeMinutes, setPrepTimeMinutes] = useState<number | undefined>(undefined);
  const [showPrepTime, setShowPrepTime] = useState(false);
  const [recipeImage, setRecipeImage] = useState<File | null>(null);
  
  // Split recipe details into instructions
  const instructionsArray = useMemo(() => {
    if (!recipeDetails) return [];
    
    return recipeDetails
      .split(/\n+/)
      .map(line => line.trim())
      .filter(line => line.length > 0);
  }, [recipeDetails]);
  
  // Combine recipe data
  const recipeData = useMemo<IRecipeFormData>(() => ({
    mealName,
    imageUrl: '',
    ingredientsUsed: ingredients,
    recipeDetails: recipeDetails,
    prepTimeMinutes: showPrepTime ? prepTimeMinutes : undefined,
    showPrepTime,
    macros: showMacros ? macros : null,
    showMacros
  }), [mealName, ingredients, recipeDetails, showMacros, macros, prepTimeMinutes, showPrepTime]);

  // UI state
  const [apiError, setApiError] = useState<string | null>(null);
  const [errorNotificationVisible, setErrorNotificationVisible] = useState(false);

  // Monitor errors and control animation only on first appearance
  useEffect(() => {
    const hasErrors = Object.keys(errors).length > 0;
    if (hasErrors && !errorNotificationVisible) {
      setErrorNotificationVisible(true);
    } else if (!hasErrors && errorNotificationVisible) {
      setErrorNotificationVisible(false);
    }
  }, [errors, errorNotificationVisible]);

  // Initialize animations - with proper cleanup
  useEffect(() => {
    AOS.init({ 
      duration: 800, 
      once: true,
      easing: 'ease-out-cubic',
      delay: 50,
      disable: 'mobile' // Disable on mobile to avoid potential issues
    });
    
    // Clean up AOS on unmount
    return () => {
      // Remove AOS attributes from DOM to avoid React reconciliation conflicts
      document.querySelectorAll('[data-aos]').forEach(el => {
        el.removeAttribute('data-aos');
        el.removeAttribute('data-aos-delay');
        el.removeAttribute('data-aos-duration');
      });
    };
  }, []);

  // Replace dynamic style injection with static styles
  useEffect(() => {
    // Static approach instead of dynamic style injection
    const hasAnimationStyles = document.getElementById('recipe-create-animations');
    if (!hasAnimationStyles) {
      const styleEl = document.createElement('style');
      styleEl.id = 'recipe-create-animations';
      styleEl.innerHTML = `
        .animate-slide-in-right {
          animation: slideInRight 0.3s ease-out forwards;
        }
        @keyframes slideInRight {
          0% {
            transform: translateX(100%);
            opacity: 0;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `;
      document.head.appendChild(styleEl);
    }
    
    // Clean up on unmount
    return () => {
      const styleEl = document.getElementById('recipe-create-animations');
      if (styleEl) {
        // Use safe removal pattern
        const parent = styleEl.parentNode;
        if (parent) {
          parent.removeChild(styleEl);
        }
      }
    };
  }, []);

  // Effect to show success message when errors are fixed
  useEffect(() => {
    if (previewMode && Object.keys(errors).length === 0) {
      setSuccessMessage('Preview mode activated');
      setTimeout(() => setSuccessMessage(''), 1500);
    }
  }, [errors, previewMode]);

  // Fetch recipe data if in edit mode
  useEffect(() => {
    if (isEditing && id) {
      const fetchRecipe = async () => {
        setIsLoading(true);
        try {
          const response = await axios.get(`/v1/recipes/${id}`);
          const recipeData = response.data;
          
          setMealName(recipeData.mealName || '');
          setIngredients(recipeData.ingredientsUsed || []);
          
          // Handle different formats of recipeDetails
          if (typeof recipeData.recipeDetails === 'string') {
            setRecipeDetails(recipeData.recipeDetails);
          } else if (recipeData.recipeDetails && typeof recipeData.recipeDetails === 'object') {
            // Format structured recipeDetails into a string
            const details = recipeData.recipeDetails;
            let formattedDetails = '';
            
            if (details.instructions && Array.isArray(details.instructions)) {
              formattedDetails += "Instructions:\n" + details.instructions.join('\n') + '\n\n';
            }
            
            if (details.servingSuggestions && Array.isArray(details.servingSuggestions)) {
              formattedDetails += "Serving Suggestions:\n" + details.servingSuggestions.join('\n');
            }
            
            setRecipeDetails(formattedDetails);
          }
          
          if (recipeData.macros) {
            setMacros(recipeData.macros);
            setShowMacros(true);
          }
          
          if (recipeData.prepTimeMinutes) {
            setPrepTimeMinutes(recipeData.prepTimeMinutes);
          }
        } catch (error) {
          console.error('Failed to fetch recipe:', error);
          setApiError('Failed to load recipe data. Please try again.');
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchRecipe();
    }
  }, [id, isEditing]);


  // Combined function to handle input changes
  const handleInputChange = (field: 'mealName' | 'recipeDetails', value: string) => {
    // Update the appropriate state
    field === 'mealName' ? setMealName(value) : setRecipeDetails(value);
    
    // Clear error if value is not empty
    if (errors[field] && value.trim()) clearError(field);
  };
  
  // Simplified handler functions using the combined approach
  const handleMealNameChange = (value: string) => handleInputChange('mealName', value);
  const handleDetailsChange = (value: string) => handleInputChange('recipeDetails', value);

  // Handle adding ingredients
  const handleAddIngredient = (ingredient: string) => {
    // Special case for empty string - just clear the error
    if (ingredient === "") {
      clearError('ingredientsUsed');
      return;
    }
    
    // Normal case - add the ingredient
    if (ingredient.trim().length >= 3) {
      const newIngredients = [...ingredients, ingredient.trim()];
      setIngredients(newIngredients);
      
      // Clear error when at least one ingredient is added
      clearError('ingredientsUsed');
    }
  };

  // Handle removing ingredients
  const handleRemoveIngredient = (indexToRemove: number) => {
    const newIngredients = ingredients.filter((_, index) => index !== indexToRemove);
    setIngredients(newIngredients);
    
    // Set error if all ingredients are removed
    if (newIngredients.length === 0) {
      setErrors({ ...errors, ingredientsUsed: 'At least one ingredient is required' });
    }
  };

  // Clear errors efficiently with early return
  const clearError = (field: keyof IFormErrors) => {
    if (!errors[field]) return;
    
    const newErrors = {...errors};
    delete newErrors[field];
    setErrors(newErrors);
    
    // Show success message if form is now valid
    if (Object.keys(newErrors).length === 0 && 
        mealName.trim() && recipeDetails.trim() && ingredients.length > 0) {
      setSuccessMessage('Recipe details are valid');
      setTimeout(() => setSuccessMessage(''), 2000);
    }
  };

  // Optimized preview mode toggle with efficient validation
  const togglePreviewMode = () => {
    // Exit preview mode: Clear all messages and return to editing
    if (previewMode) {
      setPreviewMode(false);
      setSuccessMessage('');
      return;
    }
    
    // Enter preview mode: Validate and show appropriate feedback
    const validationErrors = validateForm({
      mealName,
      ingredients,
      recipeDetails,
      ingredientsUsed: ingredients,
      prepTimeMinutes,
      macros,
      showMacros
    });
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    // All valid: Enter preview mode with success notification
    setPreviewMode(true);
    setSuccessMessage('Preview mode activated');
    setTimeout(() => setSuccessMessage(''), 1500);
  };
  
  // Simplified validation with more concise logic
  const validateForm = (data: {
    mealName: string;
    ingredients?: string[];
    ingredientsUsed?: string[];
    recipeDetails: string;
    prepTimeMinutes?: number;
    macros?: IMacros;
    showMacros?: boolean;
  }) => {
    const newErrors: IFormErrors = {};
    
    if (!data.mealName.trim()) newErrors.mealName = 'Recipe name is required';
    if (!data.recipeDetails.trim()) newErrors.recipeDetails = 'Instructions are required';
    
    // Use either ingredientsUsed or ingredients
    const ingredientsList = data.ingredientsUsed || data.ingredients || [];
    if (ingredientsList.length === 0) {
      newErrors.ingredientsUsed = 'At least one ingredient is required';
    }
    
    if (data.prepTimeMinutes !== undefined && data.prepTimeMinutes <= 0) {
      newErrors.prepTimeMinutes = 'Preparation time must be positive';
    }
    
    return newErrors;
  };

  // Updated handleSubmit function
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form before submission
    const data = { mealName, ingredients, recipeDetails, prepTimeMinutes, macros, showMacros };
    const validationErrors = validateForm(data);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsLoading(true);
    setApiError(null);
    
    try {
      // Create a request object matching what the backend expects
      const requestObj = {
        mealName,
        ingredientsUsed: ingredients,
        recipeDetails,
        ...(prepTimeMinutes !== undefined && { prepTimeMinutes }),
        ...(macros && Object.values(macros).some(v => v !== undefined) && { macros })
      };
      
      // Create FormData with request and optional image
      const formData = new FormData();
      formData.append('request', new Blob([JSON.stringify(requestObj)], { type: 'application/json' }));
      
      // Add the image file if one is selected
      if (recipeImage) {
        formData.append('image', recipeImage);
      }
      
      // Determine endpoint and method based on edit/create mode
      const endpoint = isEditing ? `/v1/recipes/${id}` : '/v1/recipes/create-meal';
      const method = isEditing ? 'put' : 'post';
      
      const response = await axios[method](endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Show success and navigate
      const newRecipeId = response.data.id || id;
      setSuccessMessage(isEditing ? 'Recipe updated successfully!' : 'Recipe created successfully!');
      
      // Redirect to My Recipes page after a short delay
      setTimeout(() => navigate('/recipe/my-recipes'), 1500);
    } catch (err: any) {
      console.error('Error submitting recipe:', err);
      
      let errorMessage = 'An error occurred while saving the recipe';
      
      if (err.response?.status === 401 || err.response?.status === 403) {
        errorMessage = 'Error saving recipe. This might be due to a permission issue.';
      } else if (err.message === 'Network Error' || !err.response) {
        errorMessage = 'Unable to connect to the server. Please check your internet connection.';
      } else if (err.response?.status === 413) {
        errorMessage = 'The image you uploaded is too large. Please use an image smaller than 5MB.';
      } else if (err.response?.data?.message || err.friendlyMessage) {
        errorMessage = err.response?.data?.message || err.friendlyMessage;
      }
      
      setApiError(errorMessage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsLoading(false);
    }
  };

  // Simplified notification component with consistent styling
  const Notification = () => {
    const hasErrors = Object.keys(errors).length > 0;
    const hasSuccess = !!successMessage;
    const hasApiError = !!apiError;
    
    // Common notification container styles
    const containerStyles = "fixed right-0 top-4 w-80 min-h-[80px] rounded-l-lg shadow-lg overflow-hidden transition-transform duration-300 ease-in-out z-50";
    
    return (
      <>
        {/* Error notification */}
        <div 
          className={`${containerStyles} bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg ${hasErrors ? 'translate-x-0' : 'translate-x-full'}`}
        >
          <div className="p-4 border-l-4 border-red-500">
            <div className="font-semibold text-red-600 dark:text-red-400 flex items-center mb-2">
              <div className="p-1.5 bg-red-100 dark:bg-red-900/30 rounded-lg mr-2">
                <FaExclamationCircle className="text-red-500" />
              </div>
              <span>Please Fix These Issues</span>
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-300 ml-9">
              {Object.entries(errors).map(([key, value]) => (
                <p key={key} className="mb-1 flex items-center before:content-['•'] before:mr-2 before:text-red-400">{value}</p>
              ))}
            </div>
          </div>
        </div>

        {/* API Error notification */}
        {hasApiError && (
          <div className={`${containerStyles} bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg translate-x-0 top-24`}>
            <div className="p-4 border-l-4 border-red-500">
              <div className="font-semibold text-red-600 dark:text-red-400 flex items-center mb-2">
                <div className="p-1.5 bg-red-100 dark:bg-red-900/30 rounded-lg mr-2">
                  <FaExclamationCircle className="text-red-500" />
                </div>
                <span>Server Error</span>
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300 ml-9">
                {apiError}
              </div>
            </div>
          </div>
        )}

        {/* Success notification */}
        {hasSuccess && (
          <div className={`${containerStyles} bg-white dark:bg-gray-800 border-r-4 border-green-500 translate-x-0 ${hasErrors ? 'top-24' : ''}`}>
            <div className="p-3 flex flex-col">
              <div className="font-semibold text-green-500 flex items-center">
                <FaCheckCircle className="mr-2" />
                <span>Success</span>
              </div>
              <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                {successMessage}
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  // If in preview mode, render the recipe preview with improved UI
  if (previewMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-indigo-900/20 p-4 sm:p-6 lg:p-8">
        <div className="max-w-3xl mx-auto">
          <Notification />
          <div className="flex justify-between mb-6">
            <button 
              onClick={() => (setPreviewMode(false), setSuccessMessage(''), setErrors({}))}
              className="group flex items-center text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-300 px-3 py-2 rounded-lg hover:bg-white/70 dark:hover:bg-gray-700"
            >
              <FaEdit className="mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Edit
            </button>
            <button 
              onClick={handleSubmit} 
              className="flex items-center bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white px-6 py-2.5 rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-medium"
              disabled={isLoading}
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
                <>
                  <FaCheck className="mr-2" /> {isEditing ? 'Update Recipe' : 'Create Recipe'}
                </>
              )}
            </button>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 p-5 relative overflow-hidden">
              <h2 className="text-xl text-white font-bold">Recipe Preview</h2>
              <p className="text-blue-100 text-sm">Review your recipe before publishing</p>
            </div>
            <RecipePreview recipe={{
              id: id,
              mealName: recipeData.mealName,
              imageUrl: recipeImage ? URL.createObjectURL(recipeImage) : recipeData.imageUrl,
              ingredientsUsed: recipeData.ingredientsUsed,
              recipeDetails: {
                ingredientsList: recipeData.ingredientsUsed,
                instructions: instructionsArray,
                equipmentNeeded: [],
                servingSuggestions: [],
                nutritionalInformation: {
                  calories: recipeData.macros ? recipeData.macros.calories.toString() : "0",
                  protein: recipeData.macros ? recipeData.macros.protein.toString() : "0",
                  carbohydrates: recipeData.macros ? recipeData.macros.carbohydrates.toString() : "0",
                  fat: recipeData.macros ? recipeData.macros.fat.toString() : "0"
                }
              },
              prepTimeMinutes: recipeData.prepTimeMinutes,
              macros: recipeData.macros ? {
                calories: recipeData.macros.calories,
                protein: recipeData.macros.protein,
                carbs: recipeData.macros.carbohydrates,
                fat: recipeData.macros.fat
              } : undefined
            }} />
          </div>
        </div>
      </div>
    );
  }

  // For edit mode UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-indigo-900/20 p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={() => navigate('/recipes')}
            className="group flex items-center text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-300 px-3 py-2 rounded-lg hover:bg-white/70 dark:hover:bg-gray-700"
          >
            <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" /> Back to All Recipes
          </button>
          
          <Link 
            to="/favorites"
            className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 rounded-lg hover:bg-red-100 dark:hover:bg-red-800/30 transition-colors border border-red-200 dark:border-red-800/50"
          >
            <FaHeart className="text-red-500" />
            <span className="font-medium">My Favorites</span>
          </Link>
        </div>
        <Notification />
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mt-12 -mr-12 z-0"></div>
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full -mb-10 -ml-10 z-0"></div>
            <div className="relative z-10 text-white">
              <div className="flex items-center">
                <div className="p-3 bg-white/20 rounded-xl">
                  <FaUtensils className="text-3xl text-white" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold ml-4">{isEditing ? 'Edit Recipe' : 'Create New Recipe'}</h1>
              </div>
              <p className="text-blue-100 mt-3 ml-1 max-w-lg">Share your culinary masterpiece with detailed instructions and beautiful images</p>
            </div>
          </div>
          
          <div className="p-8">
            {/* Pro tip */}
            {showMacros && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-l-4 border-blue-500 p-5 mb-8 rounded-lg shadow-sm" data-aos="fade-in">
                <div className="flex justify-between items-start">
                  <div className="flex items-start">
                    <div className="p-2 bg-blue-100 dark:bg-blue-800/30 rounded-lg mr-3 flex-shrink-0">
                      <FaRegLightbulb className="text-blue-500 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-semibold flex items-center text-blue-700 dark:text-blue-300">Pro Tip</p>
                      <p className="text-sm text-blue-600 dark:text-blue-300/90 mt-1">Fill in all details for a complete recipe. Add nutritional information to help users with dietary needs. The more details you provide, the more valuable your recipe will be!</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowMacros(false)}
                    className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 p-1.5 rounded-full hover:bg-blue-100 dark:hover:bg-blue-800/30 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
            
            {/* Error alert */}
          {apiError && (
              <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 mb-8 rounded-lg shadow-sm" data-aos="fade-in">
                <p className="font-medium flex items-center"><FaInfoCircle className="mr-2" /> Error</p>
                <p className="dark:text-red-300/90">{apiError}</p>
            </div>
          )}
          
            <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
              {/* Recipe Name */}
              <FormSection 
                icon={<FaUtensils className="text-blue-500 dark:text-blue-400" />} 
                title="Recipe Name" 
                color="blue"
              >
            <TextInput
                  label="Recipe Name"
              id="mealName"
              value={mealName}
                  setValue={setMealName}
                  error={errors.mealName}
                  placeholder="e.g. Creamy Garlic Butter Tuscan Shrimp"
                  onErrorClear={() => clearError('mealName')}
                />
              </FormSection>
              
              {/* Image Upload */}
              <FormSection 
                icon={<FaImage className="text-indigo-500 dark:text-indigo-400" />} 
                title="Recipe Image" 
                color="indigo"
                delay={50}
              >
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Upload Recipe Image
                  </label>
                  <div 
                    className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-xl
                      border-gray-300 dark:border-gray-600
                      hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors duration-200 relative"
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          const file = e.target.files[0];
                          // Check if file size is less than 5MB
                          if (file.size <= 5 * 1024 * 1024) {
                            setRecipeImage(file);
                          } else {
                            // Show file size error
                            setApiError("Image size must be less than 5MB");
                          }
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    
                    {recipeImage ? (
                      <div className="flex flex-col items-center py-2">
                        <img 
                          src={URL.createObjectURL(recipeImage)} 
                          alt="Recipe preview" 
                          className="h-40 object-cover rounded-lg shadow-md mb-3" 
                        />
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {recipeImage.name} ({(recipeImage.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            setRecipeImage(null);
                          }}
                          className="mt-2 px-3 py-1 text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 border border-red-300 dark:border-red-600 hover:border-red-500 dark:hover:border-red-500 rounded-full transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1 text-center py-8">
                        <FaUpload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex flex-col items-center text-sm text-gray-600 dark:text-gray-400">
                          <p className="mt-1">Click to select an image</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            PNG, JPG, GIF up to 5MB
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </FormSection>
              
              {/* Preparation Time */}
              <FormSection 
                icon={<FaRegLightbulb className="text-amber-500 dark:text-amber-400" />} 
                title="Preparation Time" 
                color="amber"
                delay={80}
              >
                <div>
                  <label 
                    htmlFor="prepTimeMinutes" 
                    className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1"
                  >
                    Preparation Time (minutes)
                  </label>
                  <input
                    id="prepTimeMinutes"
                    type="number"
                    min="1"
                    value={prepTimeMinutes || ''}
                    onChange={(e) => {
                      const value = e.target.value ? parseInt(e.target.value) : undefined;
                      setPrepTimeMinutes(value);
                      if (errors.prepTimeMinutes) clearError('prepTimeMinutes');
                    }}
                    className={`w-full px-4 py-3 rounded-lg border shadow-sm focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200
                      ${errors.prepTimeMinutes ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'}
                      bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-300`}
                    placeholder="e.g. 30"
                  />
                  {errors.prepTimeMinutes && (
                    <p className="mt-2 text-sm text-red-500 dark:text-red-400">
                      {errors.prepTimeMinutes}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 italic">
                    Enter the approximate time it takes to prepare this recipe
                  </p>
                </div>
              </FormSection>
              
              {/* Ingredients */}
              <FormSection 
                icon={<FaLeaf className="text-green-500 dark:text-green-400" />} 
                title="Ingredients" 
                color="green"
                delay={100}
              >
            <CreateIngredientsInput
              ingredientsUsed={ingredients}
                  setIngredientsUsed={setIngredients}
              error={errors.ingredientsUsed}
            />
              </FormSection>
              
              {/* Recipe Details */}
              <FormSection 
                icon={<FaListUl className="text-amber-500 dark:text-amber-400" />} 
                title="Instructions" 
                color="amber"
                delay={150}
              >
            <TextArea
                  label="Recipe Instructions"
              id="recipeDetails"
              value={recipeDetails}
                  setValue={setRecipeDetails}
              error={errors.recipeDetails}
                  placeholder="Describe the preparation steps, one per line..."
                  onErrorClear={() => clearError('recipeDetails')}
                />
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 italic">
                  Instructions will be automatically numbered. Each new line represents a new step.
                </p>
              </FormSection>
              
              {/* Macros Section */}
              <FormSection 
                icon={<FaChartBar className="text-blue-500 dark:text-blue-400" />} 
                title="Nutritional Information" 
                color="blue"
                delay={250}
              >
            <MacrosInput
              macros={macros}
              setMacros={setMacros}
              showMacros={showMacros}
              setShowMacros={setShowMacros}
            />
              </FormSection>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6" data-aos="fade-up" data-aos-delay="300">
                <button
                  type="button"
                  onClick={togglePreviewMode}
                  className="flex-1 py-3 px-5 bg-gradient-to-r from-purple-500 to-violet-600 text-white font-medium rounded-xl hover:from-purple-600 hover:to-violet-700 transition shadow-md hover:shadow-lg flex items-center justify-center transform hover:-translate-y-0.5"
                >
                  {previewMode ? <FaEdit className="mr-2" /> : <FaEye className="mr-2" />} 
                  {previewMode ? 'Return to Edit' : 'Preview Recipe'}
                </button>
                
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
                  className="flex-1 py-3 px-5 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-medium rounded-xl hover:from-emerald-600 hover:to-green-700 transition shadow-md hover:shadow-lg flex items-center justify-center transform hover:-translate-y-0.5"
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
                    <>
                      <FaCheck className="mr-2" /> {isEditing ? 'Update Recipe' : 'Create Recipe'}
                    </>
              )}
            </button>
              </div>
          </form>
          </div>
        </div>
      </div>
      
      {/* Success Modal - remove data-aos from here */}
      {successMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div 
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-2xl max-w-md w-full mx-4 transform animate-[scale-in_0.3s_ease-out]"
          >
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                <FaCheckCircle className="w-8 h-8 text-green-500 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{successMessage}</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">Your recipe has been successfully {isEditing ? 'updated' : 'created'}!</p>
              <button
                onClick={() => {
                  setSuccessMessage('');
                  navigate('/recipes');
                }}
                className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-medium rounded-xl hover:from-emerald-600 hover:to-green-700 transition shadow-md hover:shadow-lg"
              >
                View All Recipes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeCreate;
