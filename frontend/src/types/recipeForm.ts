export interface IFormErrors {
    mealName?: string;
    ingredientsUsed?: string;
    recipeDetails?: string;
    prepTimeMinutes?: string;
    [key: string]: string | undefined;
  }
  
  export interface IMacros {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  }
  
  export interface IRecipeFormData {
    mealName: string;
    recipeDetails: string;
    ingredientsUsed: string[];
    imageFile: File | null;
    prepTimeMinutes?: number;
    macros?: IMacros;
  }
  
  export interface IRecipePayload {
    mealName: string;
    recipeDetails: string;
    ingredientsUsed: string[];
    prepTimeMinutes?: number;
    macros?: IMacros;
  }
  