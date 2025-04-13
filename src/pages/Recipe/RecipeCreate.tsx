import React, { useState, useEffect, useMemo, ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { recipeService } from '../../api/serviceApi';
import TextInput from '../../components/common/Input/TextInput';
import TextArea from '../../components/common/Input/TextArea';
import { CreateIngredientsInput } from '../../components/common/Input/CreateIngredientsInput';
import MacrosInput from '../../components/common/Input/MacrosInput';
import { IFormErrors, IMacros, IRecipeFormData } from '../../types/recipeForm';
import RecipePreview from './RecipePreview';
import { FaArrowLeft, FaUtensils, FaChartBar, FaEye, FaListUl, FaInfoCircle, FaRegLightbulb, FaExclamationCircle, FaCheckCircle, FaCheck, FaImage, FaUpload, FaClock } from 'react-icons/fa';

// Props interface for FormSection component
interface FormSectionProps {
  icon: ReactNode;
  title: string;
  children: ReactNode;
  color: string;
}

// Section component for consistent styling
const FormSection: React.FC<FormSectionProps> = ({ icon, title, children, color }) => (
  <div 
    className={`p-8 bg-white/95 dark:bg-gray-800/90 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 mb-8 backdrop-blur-sm`}
    style={{ 
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)', 
    }}
  >
    <div className="flex items-center mb-7">
      <div className={`p-3.5 bg-${color}-50/90 dark:bg-${color}-900/30 rounded-xl text-${color}-500 shadow-sm`}>
        {icon}
      </div>
      <h3 className="ml-4 text-xl font-medium text-gray-800 dark:text-white">
        {title}
      </h3>
    </div>
    <div className="space-y-5">
      {children}
    </div>
  </div>
);

// RecipePreviewComponent optimized
const RecipePreviewComponent: React.FC<{
  recipe: any;
  previewImage?: File;
  isOwnRecipe?: boolean;
}> = ({ recipe, previewImage }) => {
  // Helper function to get image source
  const getImageContent = () => {
    if (previewImage) {
      return (
        <img
          src={URL.createObjectURL(previewImage)}
          alt={recipe.mealName || 'Recipe preview'}
          className="w-full h-full object-cover"
        />
      );
    } 
    
    if (recipe.imageUrl) {
      return (
        <img
          src={recipe.imageUrl}
          alt={recipe.mealName || 'Recipe preview'}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop";
          }}
        />
      );
    }
    
    return (
      <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
        <FaUtensils className="text-white text-5xl opacity-30" />
      </div>
    );
  };

  // Helper function to check if macros exist and have values
  const hasMacros = () => {
    return recipe.macros && (
      recipe.macros.calories > 0 || 
      recipe.macros.protein > 0 || 
      recipe.macros.carbs > 0 || 
      recipe.macros.fat > 0 || 
      recipe.macros.proteinGrams > 0 || 
      recipe.macros.carbsGrams > 0 || 
      recipe.macros.fatGrams > 0
    );
  };

  // Parse instructions into separate steps
  const parseInstructions = () => {
    if (!recipe.recipeDetails) return [];
    
    return recipe.recipeDetails
      .split(/\n+/)
      .map((line: string) => line.trim())
      .filter((line: string) => line.length > 0);
  };

  // Common section title style
  const sectionTitleClass = "text-xl font-semibold mb-5 border-b border-gray-100 dark:border-gray-700 pb-3";

  return (
    <div className="bg-white/95 dark:bg-gray-800/95 rounded-2xl shadow-lg overflow-hidden backdrop-blur-sm ring-1 ring-gray-100 dark:ring-gray-700">
      {/* Recipe header */}
      <div className="relative h-96 w-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
        {getImageContent()}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
          <h2 className="text-4xl font-bold text-white mb-3">{recipe.mealName || 'Untitled Recipe'}</h2>
          
          <div className="flex flex-wrap gap-3 mt-3">
            {recipe.totalTimeMinutes && (
              <span className="bg-white/20 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-sm flex items-center">
                <FaClock className="mr-2" aria-hidden="true" />
                {recipe.totalTimeMinutes} min
              </span>
            )}
            
            {recipe.difficulty && (
              <span className={`${getDifficultyColor(recipe.difficulty)} backdrop-blur-md text-white px-4 py-1.5 rounded-full text-sm`}>
                {formatDifficulty(recipe.difficulty)}
              </span>
            )}
          </div>
        </div>
      </div>
      
      <div className="p-8">
        {/* Ingredients */}
        <div className="mb-10">
          <h3 className={sectionTitleClass}>
            Ingredients
          </h3>
          
          {recipe.ingredientsUsed && recipe.ingredientsUsed.length > 0 ? (
            <ul className="space-y-3 pl-1">
              {recipe.ingredientsUsed.map((ingredient: string, index: number) => (
                <li key={index} className="flex items-start gap-3 group">
                  <span className="text-blue-500 dark:text-blue-400 text-lg group-hover:scale-110 transition-transform duration-200">•</span>
                  <span className="text-gray-700 dark:text-gray-300">{ingredient}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 italic">No ingredients added yet</p>
          )}
        </div>
        
        {/* Instructions */}
        <div className="mb-10">
          <h3 className={`${sectionTitleClass} flex items-center gap-2`}>
            <span className="bg-blue-50 dark:bg-blue-900/20 text-blue-500 p-1 rounded-md">
              <FaRegLightbulb className="h-5 w-5" />
            </span>
            Instructions
          </h3>
          
          {recipe.recipeDetails ? (
            <div className="space-y-6 bg-blue-50/20 dark:bg-blue-900/5 p-5 rounded-xl border border-blue-100/50 dark:border-blue-800/10">
              {parseInstructions().map((instruction, index) => (
                <div 
                  key={index} 
                  className="flex items-start gap-4 group hover:bg-blue-50/40 dark:hover:bg-blue-900/10 p-4 rounded-xl transition-all duration-200 border border-transparent hover:border-blue-100 dark:hover:border-blue-800/20"
                >
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full h-8 w-8 flex-shrink-0 flex items-center justify-center font-semibold shadow-sm group-hover:scale-110 transition-transform duration-200">
                    {index + 1}
                  </div>
                  <div className="text-gray-700 dark:text-gray-300 leading-relaxed pt-1">
                    {instruction}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">No instructions added yet</p>
          )}
        </div>

        {/* Serving Suggestions - only display if exists */}
        {recipe.servingSuggestions && (
          <div className="mb-10">
            <h3 className={sectionTitleClass}>
              Serving Suggestions
            </h3>
            <div className="p-6 bg-blue-50/80 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800/30 text-gray-700 dark:text-gray-300 backdrop-blur-sm">
              {recipe.servingSuggestions}
            </div>
          </div>
        )}
        
        {/* Nutrition - only display if macros have values */}
        {hasMacros() && (
          <div className="mb-10">
            <h3 className={sectionTitleClass}>
              Nutrition Information
            </h3>
            
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-red-50/80 dark:bg-red-900/20 p-4 rounded-xl text-center shadow-sm backdrop-blur-sm transition-all duration-200 hover:shadow-md hover:translate-y-[-2px]">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Calories</p>
                <p className="font-bold text-xl text-red-600 dark:text-red-400">{recipe.macros.calories}</p>
              </div>
              <div className="bg-blue-50/80 dark:bg-blue-900/20 p-4 rounded-xl text-center shadow-sm backdrop-blur-sm transition-all duration-200 hover:shadow-md hover:translate-y-[-2px]">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Protein</p>
                <p className="font-bold text-xl text-blue-600 dark:text-blue-400">{recipe.macros.protein || recipe.macros.proteinGrams}g</p>
              </div>
              <div className="bg-yellow-50/80 dark:bg-yellow-900/20 p-4 rounded-xl text-center shadow-sm backdrop-blur-sm transition-all duration-200 hover:shadow-md hover:translate-y-[-2px]">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Carbs</p>
                <p className="font-bold text-xl text-yellow-600 dark:text-yellow-400">{recipe.macros.carbs || recipe.macros.carbsGrams}g</p>
              </div>
              <div className="bg-green-50/80 dark:bg-green-900/20 p-4 rounded-xl text-center shadow-sm backdrop-blur-sm transition-all duration-200 hover:shadow-md hover:translate-y-[-2px]">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Fat</p>
                <p className="font-bold text-xl text-green-600 dark:text-green-400">{recipe.macros.fat || recipe.macros.fatGrams}g</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper functions
const getDifficultyColor = (difficulty: string = 'MEDIUM'): string => {
  switch(difficulty.toUpperCase()) {
    case 'EASY': return 'bg-green-500/80';
    case 'MEDIUM': return 'bg-blue-500/80';
    case 'HARD': return 'bg-red-500/80';
    default: return 'bg-gray-500/80';
  }
};

const formatDifficulty = (difficulty: string = 'MEDIUM'): string => {
  return difficulty.charAt(0) + difficulty.slice(1).toLowerCase();
};

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
    carbs: 0,
    fat: 0
  });
  const [showMacros, setShowMacros] = useState(false);
  const [totalTimeMinutes, setTotalTimeMinutes] = useState<number | undefined>(undefined);
  const [showTime, setShowTime] = useState(false);
  const [servingSuggestions, setServingSuggestions] = useState<string>('');
  const [showServingSuggestions, setShowServingSuggestions] = useState(false);
  const [recipeImage, setRecipeImage] = useState<File | null>(null);
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  
  // Split recipe details into instructions
  const instructionsArray = useMemo(() => {
    if (!recipeDetails) return [];
    
    return recipeDetails
      .split(/\n+/)
      .map(line => line.trim())
      .filter(line => line.length > 0);
  }, [recipeDetails]);
  
  // UI state
  const [apiError, setApiError] = useState<string | null>(null);

  // Initialize animations - with proper cleanup
  useEffect(() => {
    document.title = isEditing ? 'Edit Recipe | SavorAI' : 'Create Recipe | SavorAI';
    
    AOS.init({ 
      duration: 800, 
      once: true,
      easing: 'ease-out-cubic',
      delay: 50,
      disable: 'mobile'
    });
    
    return () => {
      document.querySelectorAll('[data-aos]').forEach(el => {
        el.removeAttribute('data-aos');
        el.removeAttribute('data-aos-delay');
        el.removeAttribute('data-aos-duration');
      });
      document.title = 'SavorAI';
    };
  }, [isEditing]);

  // Replace dynamic style injection with static styles
  useEffect(() => {
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
    
    return () => {
      const styleEl = document.getElementById('recipe-create-animations');
      if (styleEl && styleEl.parentNode) {
        styleEl.parentNode.removeChild(styleEl);
      }
    };
  }, []);

  // Fetch recipe data if in edit mode
  useEffect(() => {
    if (isEditing && id) {
      const fetchRecipe = async () => {
        setIsLoading(true);
        try {
          const response = await recipeService.getRecipeById(id);
          const recipeData = response.data;
          
          setMealName(recipeData.title || recipeData.mealName || '');
          setIngredients(recipeData.ingredients || recipeData.ingredientsUsed || []);
          
          // Handle different formats of recipe instructions
          if (recipeData.instructions) {
            setRecipeDetails(recipeData.instructions);
          } else if (typeof recipeData.recipeDetails === 'string') {
            setRecipeDetails(recipeData.recipeDetails);
          } else if (recipeData.recipeDetails && typeof recipeData.recipeDetails === 'object') {
            const details = recipeData.recipeDetails;
            let formattedDetails = '';
            
            if (details.instructions && Array.isArray(details.instructions)) {
              formattedDetails += details.instructions.join('\n');
            }
            
            setRecipeDetails(formattedDetails);
          }
          
          // Handle different formats of recipe macros
          if (recipeData.macros) {
            setMacros({
              calories: recipeData.macros.calories || 0,
              protein: recipeData.macros.protein || recipeData.macros.proteinGrams || 0,
              carbs: recipeData.macros.carbs || recipeData.macros.carbsGrams || 0,
              fat: recipeData.macros.fat || recipeData.macros.fatGrams || 0
            });
            setShowMacros(true);
          }
          
          // Set cooking time
          if (recipeData.totalTimeMinutes) {
            setTotalTimeMinutes(recipeData.totalTimeMinutes);
            setShowTime(true);
          } else if (recipeData.prepTimeMinutes) {
            setTotalTimeMinutes(recipeData.prepTimeMinutes);
            setShowTime(true);
          }

          // Set serving suggestions if available
          if (recipeData.servingSuggestions) {
            setServingSuggestions(recipeData.servingSuggestions);
            setShowServingSuggestions(true);
          }

          // Set difficulty if available
          if (recipeData.difficulty) {
            setDifficulty(recipeData.difficulty as 'EASY' | 'MEDIUM' | 'HARD');
          }

          // Set image URL if exists
          if (recipeData.imageUrl) {
            setExistingImageUrl(recipeData.imageUrl);
          }
        } catch (error: any) {
          console.error('Failed to fetch recipe for editing:', error);
          // Provide more detailed error info for debugging
          if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('Error response data:', error.response.data);
            console.error('Error response status:', error.response.status);
            console.error('Error response headers:', error.response.headers);
            setApiError(`Failed to load recipe data. Server error: ${error.response.status}. ${error.response.data?.message || ''}`);
          } else if (error.request) {
            // The request was made but no response was received
            console.error('Error request:', error.request);
            setApiError('Failed to load recipe data. No response received from server.');
          } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Error message:', error.message);
            setApiError(`Failed to load recipe data: ${error.message}`);
          }
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchRecipe();
    }
  }, [isEditing, id]);

  // Clear errors efficiently with early return
  const clearError = (field: keyof IFormErrors) => {
    if (!errors[field]) return;
    
    const newErrors = {...errors};
    delete newErrors[field];
    setErrors(newErrors);
  };

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

  // Toggle preview mode with validation
  const togglePreviewMode = () => {
    // Validate before letting users enter preview mode
    if (!previewMode) {
      const validationErrors = validateForm({
        mealName,
        ingredientsUsed: ingredients,
        recipeDetails,
        totalTimeMinutes,
        macros,
        showMacros,
        difficulty,
        servingSuggestions
      });
      
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return false;
      }
    }
    
    setPreviewMode(!previewMode);
    setErrors({});
    
    return true;
  };
  
  // Form validation with better error descriptions
  const validateForm = (data: {
    mealName: string;
    ingredientsUsed?: string[];
    recipeDetails: string;
    totalTimeMinutes?: number;
    macros?: IMacros;
    showMacros?: boolean;
    difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
    servingSuggestions?: string;
  }) => {
    const newErrors: IFormErrors = {};
    
    if (!data.mealName.trim()) {
      newErrors.mealName = 'Please enter a name for your recipe';
    }
    
    if (!data.recipeDetails.trim()) {
      newErrors.recipeDetails = 'Please add cooking instructions';
    }
    
    if (!data.ingredientsUsed || data.ingredientsUsed.length === 0) {
      newErrors.ingredientsUsed = 'Please add at least one ingredient';
    }
    
    if (data.totalTimeMinutes !== undefined && data.totalTimeMinutes <= 0) {
      newErrors.totalTimeMinutes = 'Cooking time must be a positive number';
    }
    
    return newErrors;
  };

  // Optimized handle submit function with better error handling
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create data object from form state
    const data = { 
      mealName, 
      ingredientsUsed: ingredients, 
      recipeDetails, 
      totalTimeMinutes: showTime ? totalTimeMinutes : undefined,
      macros: showMacros ? macros : undefined,
      difficulty,
      servingSuggestions: showServingSuggestions ? servingSuggestions : undefined
    };
    
    // Validate form data
    const validationErrors = validateForm(data);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsLoading(true);
    setApiError(null);
    
    try {
      // Build request object with optional fields
      const requestObj = {
        title: mealName,
        ingredients: ingredients,
        instructions: recipeDetails,
        difficulty,
        ...(showTime && totalTimeMinutes !== undefined && { totalTimeMinutes }),
        ...(showMacros && macros && { 
          macros: {
            calories: macros.calories,
            proteinGrams: macros.protein,
            carbsGrams: macros.carbs, 
            fatGrams: macros.fat
          } 
        }),
        ...(showServingSuggestions && servingSuggestions && { servingSuggestions }),
        ...(isEditing && existingImageUrl && !recipeImage && { imageUrl: existingImageUrl })
      };
      
      // Create FormData for image upload if needed
      const formData = new FormData();
      formData.append('recipe', new Blob([JSON.stringify(requestObj)], { type: 'application/json' }));
      
      if (recipeImage) {
        formData.append('image', recipeImage);
      }
      
      // Save or update recipe
      let response;
      if (isEditing) {
        response = recipeImage
          ? await recipeService.updateRecipe(id!, formData)
          : await recipeService.updateRecipeSimple(id!, requestObj);
      } else {
        response = await recipeService.createRecipe(formData);
      }
      
      // Show success and navigate
      setSuccessMessage(isEditing ? 'Recipe updated successfully!' : 'Recipe created successfully!');
      setTimeout(() => navigate('/recipe/my-recipes'), 1500);
    } catch (error: any) {
      // Handle API errors with clear user feedback
      if (error.response) {
        if (error.response.status === 404) {
          setApiError(`Could not find the recipe endpoint. Please try again later.`);
        } else if (error.response.status === 500) {
          setApiError(`Server error. Please try again later.`);
        } else {
          setApiError(`Error: ${error.response.data?.message || 'Could not save recipe'}`);
        }
      } else if (error.request) {
        setApiError('No response from server. Please check your connection and try again.');
      } else {
        setApiError(`Error: ${error.message || 'Could not save recipe'}`);
      }
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-10 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 min-h-screen">
      {previewMode ? (
        <div className="mb-8 max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => setPreviewMode(false)}
              className="flex items-center px-5 py-2.5 rounded-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-800 transition-all duration-200 shadow-sm border border-gray-100 dark:border-gray-700"
            >
              <FaArrowLeft className="mr-2" />
              Back to Edit
            </button>
            <h2 className="text-3xl font-semibold text-center text-gray-800 dark:text-white">Recipe Preview</h2>
            <div className="w-24"></div>
          </div>
          
          <RecipePreviewComponent
            recipe={{
              mealName,
              ingredientsUsed: ingredients,
              recipeDetails,
              totalTimeMinutes: showTime ? totalTimeMinutes : undefined,
              macros: showMacros ? {
                calories: macros.calories,
                proteinGrams: macros.protein,
                carbsGrams: macros.carbs,
                fatGrams: macros.fat
              } : undefined,
              difficulty,
              imageUrl: existingImageUrl || undefined,
              servingSuggestions: showServingSuggestions ? servingSuggestions : undefined
            }}
            previewImage={recipeImage || undefined}
            isOwnRecipe={true}
          />
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-10 max-w-4xl mx-auto">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center px-5 py-2.5 rounded-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-800 transition-all duration-200 shadow-sm border border-gray-100 dark:border-gray-700"
            >
              <FaArrowLeft className="mr-2" />
              Back
            </button>
            <h1 className="text-3xl font-semibold text-center text-gray-800 dark:text-white">
              {isEditing ? 'Edit Recipe' : 'Create New Recipe'}
            </h1>
            <div className="w-24"></div>
          </div>

          {/* Notifications */}
          {(Object.keys(errors).length > 0 || apiError || successMessage) && (
            <div className="max-w-4xl mx-auto">
              {Object.keys(errors).length > 0 && (
                <div
                  className="mb-8 p-6 bg-red-50/90 dark:bg-red-900/20 rounded-2xl text-red-800 dark:text-red-200 animate-slide-in-right shadow-sm backdrop-blur-sm border border-red-100 dark:border-red-800/20"
                  role="alert"
                >
                  <div className="flex items-start">
                    <FaExclamationCircle className="h-6 w-6 mr-3 mt-0.5 text-red-500" />
                    <div>
                      <h3 className="text-base font-medium mb-2">Please fix these issues:</h3>
                      <ul className="list-disc ml-5 space-y-1.5 text-sm">
                        {Object.entries(errors).map(([field, message]) => (
                          <li key={field}>{message}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {apiError && (
                <div
                  className="mb-8 p-6 bg-red-50/90 dark:bg-red-900/20 rounded-2xl text-red-800 dark:text-red-200 animate-slide-in-right shadow-sm backdrop-blur-sm border border-red-100 dark:border-red-800/20"
                  role="alert"
                >
                  <div className="flex items-start">
                    <FaExclamationCircle className="h-6 w-6 mr-3 mt-0.5 text-red-500" />
                    <div>
                      <p>{apiError}</p>
                    </div>
                  </div>
                </div>
              )}

              {successMessage && (
                <div
                  className="mb-8 p-6 bg-green-50/90 dark:bg-green-900/20 rounded-2xl text-green-800 dark:text-green-200 animate-slide-in-right shadow-sm backdrop-blur-sm border border-green-100 dark:border-green-800/20"
                  role="alert"
                >
                  <div className="flex items-center">
                    <FaCheckCircle className="h-6 w-6 mr-3 text-green-500" />
                    <p>{successMessage}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-end gap-4 mb-8 sticky top-4 z-10 max-w-4xl mx-auto">
            <button
              type="button"
              onClick={togglePreviewMode}
              disabled={isLoading}
              className="flex items-center bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-700 dark:text-gray-200 px-6 py-3 rounded-xl font-medium hover:bg-white dark:hover:bg-gray-800 transition-all duration-200 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <FaEye className="mr-2" />
              Preview
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex items-center bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-sm"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {isEditing ? 'Updating...' : 'Creating...'}
                </div>
              ) : (
                <>
                  <FaCheck className="mr-2" />
                  {isEditing ? 'Update Recipe' : 'Create Recipe'}
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="lg:col-span-2 space-y-8">
              {/* Basic Info */}
              <FormSection
                icon={<FaUtensils className="text-blue-500 dark:text-blue-400 text-xl" />}
                title="Basic Information"
                color="blue"
              >
                <TextInput
                  label="Recipe Name"
                  id="mealName"
                  value={mealName}
                  setValue={setMealName}
                  placeholder="Enter the name of your recipe"
                  error={errors.mealName}
                  onErrorClear={() => clearError('mealName')}
                />
                
                {/* Time Field - Single Total Time */}
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-base font-medium text-gray-700 dark:text-gray-300">
                      Total Cooking Time
                    </label>
                    <div>
                      <label className="inline-flex items-center cursor-pointer">
                        <span className="mr-3 text-sm text-gray-700 dark:text-gray-300">
                          {showTime ? 'Remove' : 'Add'}
                        </span>
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={showTime}
                            onChange={() => setShowTime(!showTime)}
                            className="sr-only peer"
                          />
                          <div className="w-12 h-6 bg-gray-200 dark:bg-gray-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500 dark:peer-checked:bg-blue-600"></div>
                        </div>
                      </label>
                    </div>
                  </div>
                  
                  {showTime && (
                    <div className="border-0 rounded-xl p-5 bg-blue-50/50 dark:bg-blue-900/10 shadow-sm">
                      <div className="flex items-center">
                        <FaClock className="text-blue-500 mr-3 text-xl" />
                        <label className="block text-base font-medium text-gray-700 dark:text-gray-300 mr-3">
                          Total Time:
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={totalTimeMinutes || ''}
                          onChange={(e) => setTotalTimeMinutes(parseInt(e.target.value) || undefined)}
                          className="w-24 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                          placeholder="mins"
                        />
                        <span className="ml-3 text-sm text-gray-600 dark:text-gray-400">minutes</span>
                      </div>
                    </div>
                  )}
                </div>
              </FormSection>

              {/* Ingredients */}
              <FormSection
                icon={<FaListUl className="text-green-500 dark:text-green-400 text-xl" />}
                title="Ingredients"
                color="green"
              >
                <div className="p-1">
                  <CreateIngredientsInput
                    ingredientsUsed={ingredients}
                    setIngredientsUsed={setIngredients}
                    onAddIngredient={handleAddIngredient}
                    onRemoveIngredient={handleRemoveIngredient}
                    error={errors.ingredientsUsed}
                  />
                </div>
              </FormSection>

              {/* Instructions */}
              <FormSection
                icon={<FaRegLightbulb className="text-amber-500 dark:text-amber-400 text-xl" />}
                title="Cooking Instructions"
                color="amber"
              >
                <TextArea
                  label="Recipe Instructions"
                  id="recipeDetails"
                  value={recipeDetails}
                  setValue={setRecipeDetails}
                  placeholder="Provide step-by-step instructions for your recipe. Each instruction on a new line."
                  error={errors.recipeDetails}
                  onErrorClear={() => clearError('recipeDetails')}
                />
                
                {/* Add instruction count and estimator */}
                {instructionsArray.length > 0 && (
                  <div className="mt-3 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-xl">
                    <span className="font-medium">
                      {instructionsArray.length} {instructionsArray.length === 1 ? 'step' : 'steps'}
                    </span>
                  </div>
                )}
              </FormSection>

              {/* Serving Suggestions */}
              <FormSection 
                icon={<FaRegLightbulb className="text-teal-500 dark:text-teal-400 text-xl" />} 
                title="Serving Suggestions" 
                color="teal"
              >
                <div className="flex items-center justify-between mb-5">
                  <p className="text-base text-gray-600 dark:text-gray-400">
                    Add tips for serving or pairing your recipe
                  </p>
                  <div>
                    <label className="inline-flex items-center cursor-pointer">
                      <span className="mr-3 text-sm text-gray-700 dark:text-gray-300">
                        {showServingSuggestions ? 'Remove' : 'Add'}
                      </span>
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={showServingSuggestions}
                          onChange={() => setShowServingSuggestions(!showServingSuggestions)}
                          className="sr-only peer"
                        />
                        <div className="w-12 h-6 bg-gray-200 dark:bg-gray-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500 dark:peer-checked:bg-teal-600"></div>
                      </div>
                    </label>
                  </div>
                </div>
                
                {showServingSuggestions && (
                  <div className="border-0 rounded-xl p-5 bg-teal-50/50 dark:bg-teal-900/10 shadow-sm">
                    <textarea
                      value={servingSuggestions}
                      onChange={(e) => setServingSuggestions(e.target.value)}
                      className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                      placeholder="Add serving suggestions or chef's tips (e.g., 'Serve with a side of garlic bread')"
                      rows={3}
                    />
                  </div>
                )}
              </FormSection>
            </div>

            <div className="space-y-8">
              {/* Recipe Image */}
              <FormSection 
                icon={<FaImage className="text-indigo-500 dark:text-indigo-400 text-xl" />} 
                title="Recipe Image" 
                color="indigo"
              >
                <div className="w-full">
                  <label className="block text-base font-medium text-gray-700 dark:text-gray-200 mb-3">
                    {existingImageUrl ? "Current Image (Upload new to replace)" : "Upload Recipe Image"}
                  </label>
                  {existingImageUrl && !recipeImage && (
                    <div className="mb-6 flex flex-col items-center">
                      <div className="h-48 w-full max-w-sm overflow-hidden rounded-xl shadow-md mb-3 relative group">
                        <img 
                          src={existingImageUrl} 
                          alt="Current recipe" 
                          className="h-full w-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Current image
                      </p>
                    </div>
                  )}
                  <div 
                    className="mt-2 flex justify-center px-6 pt-6 pb-6 border-2 border-dashed rounded-xl
                      border-indigo-200 dark:border-indigo-700
                      hover:border-indigo-500 dark:hover:border-indigo-400 transition-all duration-200 relative
                      bg-indigo-50/50 dark:bg-indigo-900/10"
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          const file = e.target.files[0];
                          if (file.size <= 5 * 1024 * 1024) {
                            setRecipeImage(file);
                          } else {
                            setApiError("Image size must be less than 5MB");
                          }
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    
                    {recipeImage ? (
                      <div className="flex flex-col items-center py-2">
                        <div className="h-48 w-full max-w-sm overflow-hidden rounded-xl shadow-md mb-4 relative">
                          <img 
                            src={URL.createObjectURL(recipeImage)} 
                            alt="Recipe preview" 
                            className="h-full w-full object-cover"
                            onLoad={(e) => {
                              const target = e.target as HTMLImageElement;
                              if (target.src.startsWith('blob:')) {
                                URL.revokeObjectURL(target.src);
                              }
                            }}
                          />
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                          {recipeImage.name} ({(recipeImage.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            setRecipeImage(null);
                          }}
                          className="mt-2 px-5 py-2 text-sm text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-xl transition-all duration-200 shadow-sm"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2 text-center py-8">
                        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-full h-16 w-16 flex items-center justify-center mx-auto">
                          <FaUpload className="h-8 w-8 text-indigo-500 dark:text-indigo-400" />
                        </div>
                        <div className="flex flex-col items-center text-sm text-gray-600 dark:text-gray-400">
                          <p className="mt-2 text-base font-medium text-indigo-600 dark:text-indigo-400">Click to {existingImageUrl ? "replace" : "select"} an image</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            PNG, JPG, GIF up to 5MB
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </FormSection>
              
              {/* Nutritional Information */}
              <FormSection 
                icon={<FaChartBar className="text-purple-500 dark:text-purple-400 text-xl" />} 
                title="Nutritional Information" 
                color="purple"
              >
                <MacrosInput
                  macros={macros}
                  setMacros={setMacros}
                  showMacros={showMacros}
                  setShowMacros={setShowMacros}
                />
              </FormSection>

              {/* Recipe Difficulty */}
              <FormSection 
                icon={<FaInfoCircle className="text-blue-500 dark:text-blue-400 text-xl" />} 
                title="Recipe Difficulty" 
                color="blue"
              >
                <div className="mb-4">
                  <p className="text-base text-gray-600 dark:text-gray-400 mb-6">
                    Select the difficulty level:
                  </p>
                  <div className="grid grid-cols-3 gap-4">
                    <button
                      type="button"
                      onClick={() => setDifficulty('EASY')}
                      className={`px-4 py-4 rounded-xl text-center font-medium transition-all duration-200 ${
                        difficulty === 'EASY'
                          ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md scale-105'
                          : 'bg-white dark:bg-gray-800 text-green-700 dark:text-green-400 border border-gray-200 dark:border-gray-700 hover:bg-green-50 dark:hover:bg-green-900/20'
                      }`}
                    >
                      Easy
                    </button>
                    <button
                      type="button"
                      onClick={() => setDifficulty('MEDIUM')}
                      className={`px-4 py-4 rounded-xl text-center font-medium transition-all duration-200 ${
                        difficulty === 'MEDIUM'
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md scale-105'
                          : 'bg-white dark:bg-gray-800 text-blue-700 dark:text-blue-400 border border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                      }`}
                    >
                      Medium
                    </button>
                    <button
                      type="button"
                      onClick={() => setDifficulty('HARD')}
                      className={`px-4 py-4 rounded-xl text-center font-medium transition-all duration-200 ${
                        difficulty === 'HARD'
                          ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md scale-105'
                          : 'bg-white dark:bg-gray-800 text-red-700 dark:text-red-400 border border-gray-200 dark:border-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20'
                      }`}
                    >
                      Hard
                    </button>
                  </div>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-4 p-5 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl">
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2 mt-1">•</span>
                      <span><strong>Easy:</strong> Simple recipes with basic techniques</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2 mt-1">•</span>
                      <span><strong>Medium:</strong> More involved recipes with several steps</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-500 mr-2 mt-1">•</span>
                      <span><strong>Hard:</strong> Complex recipes requiring advanced skills</span>
                    </li>
                  </ul>
                </div>
              </FormSection>
              
              {/* Recipe Tips */}
              <FormSection 
                icon={<FaInfoCircle className="text-teal-500 dark:text-teal-400 text-xl" />} 
                title="Recipe Tips" 
                color="teal"
              >
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-5 p-5 bg-teal-50/50 dark:bg-teal-900/10 rounded-xl">
                  <div className="flex items-start gap-3 group">
                    <div className="p-2.5 bg-white dark:bg-gray-800 rounded-full shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-200">
                      <FaCheck className="text-teal-500" />
                    </div>
                    <div>
                      <p className="font-medium text-teal-600 dark:text-teal-400 mb-1 text-base">Clear Instructions</p>
                      <p>Write your steps in the order they should be performed.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 group">
                    <div className="p-2.5 bg-white dark:bg-gray-800 rounded-full shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-200">
                      <FaCheck className="text-teal-500" />
                    </div>
                    <div>
                      <p className="font-medium text-teal-600 dark:text-teal-400 mb-1 text-base">Be Specific</p>
                      <p>Include amounts, cooking times, and temperatures where needed.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 group">
                    <div className="p-2.5 bg-white dark:bg-gray-800 rounded-full shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-200">
                      <FaCheck className="text-teal-500" />
                    </div>
                    <div>
                      <p className="font-medium text-teal-600 dark:text-teal-400 mb-1 text-base">Add Context</p>
                      <p>Include helpful tips like "until golden brown" or "until tender."</p>
                    </div>
                  </div>
                </div>
              </FormSection>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RecipeCreate;
