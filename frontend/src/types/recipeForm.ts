export interface IFormErrors {
    mealName?: string;
    ingredientsUsed?: string;
    recipeDetails?: string;
  }
  
  export interface IMacros {
    calories: string;
    protein: string;
    carbs: string;
    fat: string;
  }
  
  export interface IRecipeFormData {
    mealName: string;
    ingredientsUsed: string[];
    recipeDetails: string;
    imageFile: File | null;
    macros?: IMacros;
  }
  
  export interface IRecipePayload {
    mealName: string;
    recipeDetails: string;
    ingredientsUsed: string[];
    macros?: IMacros;
  }
  