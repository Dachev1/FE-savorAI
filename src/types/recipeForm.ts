export interface IFormErrors {
    mealName?: string;
    ingredientsUsed?: string;
    recipeDetails?: string;
    totalTimeMinutes?: string;
    difficulty?: string;
    [key: string]: string | undefined;
  }
  
  export interface IMacros {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    proteinGrams?: number;
    carbsGrams?: number;
    fatGrams?: number;
  }
  
  export interface IRecipeFormData {
    mealName: string;
    imageUrl: string;
    ingredientsUsed: string[];
    recipeDetails: string;
    totalTimeMinutes?: number;
    showTotalTime?: boolean;
    macros?: IMacros | null;
    showMacros?: boolean;
    instructions: string;
    servingSuggestions: string;
    equipment: string;
    ingredients: string;
    imageFile: File | null;
    aiGenerated?: boolean;
    difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  }
  
  export interface IRecipePayload {
    mealName: string;
    recipeDetails: string;
    ingredientsUsed: string[];
    totalTimeMinutes?: number;
    macros?: IMacros;
    difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  }
  