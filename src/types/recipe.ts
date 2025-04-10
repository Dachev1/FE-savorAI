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
  
  export interface Macros {
    calories?: number;
    protein?: number;
    proteinGrams?: number;
    carbs?: number;
    carbsGrams?: number;
    fat?: number;
    fatGrams?: number;
  }
  
  export interface RecipeResponse {
    id?: string;
    mealName: string;
    title?: string;
    imageUrl?: string;
    ingredientsUsed: string[];
    ingredients?: string[];
    recipeDetails: RecipeDetails | string;
    description?: string;
    instructions?: string;
    aiGenerated?: boolean;
    totalTimeMinutes?: number;
    difficulty?: string;
    macros?: Macros;
    author?: {
      id?: string;
      username?: string;
    };
    upvotes?: number;
    downvotes?: number;
    userVote?: 'UPVOTE' | 'DOWNVOTE' | null;
    createdAt?: string;
    updatedAt?: string;
  }
  
  export type GeneratedMealResponse = RecipeResponse;
  