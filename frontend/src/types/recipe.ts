export interface NutritionalInformation {
    calories: number;
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
    mealName: string;
    ingredientsUsed: string[];
    recipeDetails: RecipeDetails;
    imageUrl: string;
  }
  
  export type GeneratedMealResponse = RecipeResponse;
  