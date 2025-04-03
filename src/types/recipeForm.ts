export interface IFormErrors {
    mealName?: string;
    ingredientsUsed?: string;
    recipeDetails?: string;
    prepTimeMinutes?: string;
    [key: string]: string | undefined;
  }
  
  export interface IMacros {
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
  }
  
  export interface IRecipeFormData {
    mealName: string;
    imageUrl: string;
    ingredientsUsed: string[];
    recipeDetails: string;
    prepTimeMinutes?: number;
    showPrepTime?: boolean;
    macros?: IMacros | null;
    showMacros?: boolean;
  }
  
  export interface IRecipePayload {
    mealName: string;
    recipeDetails: string;
    ingredientsUsed: string[];
    prepTimeMinutes?: number;
    macros?: IMacros;
  }
  