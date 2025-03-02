export interface NutritionalInformation {
    calories: string;
    protein: string;
    carbohydrates: string;
    fat: string;
  }
  
  export interface RecipeDetails {
    ingredientsList: string[];
    equipmentNeeded: string[];
    instructions: string[];
    servingSuggestions: string[];
    nutritionalInformation: NutritionalInformation;
  }
  
  export interface RecipeResponse {
    id?: string;
    mealName: string;
    imageUrl?: string;
    ingredientsUsed: string[];
    recipeDetails: RecipeDetails | string;
    aiGenerated?: boolean;
    macros?: {
      calories?: number;
      protein?: number;
      carbs?: number;
      fat?: number;
    };
  }
  
  export type GeneratedMealResponse = RecipeResponse;
  