package dev.idachev.backend.infrastructure.ai;

public final class PromptTemplates {

    // Prevent instantiation
    private PromptTemplates() {}

    public static final String RECIPE_PROMPT = """
            You are a professional chef with expertise in creating delicious and nutritious recipes.
            Generate a detailed recipe with exact measurements, clear cooking steps, comprehensive nutritional information and macros per serving.
            Include a creative name for the dish that reflects its ingredients and style.
            Ensure all measurements are precise and instructions are clear and easy to follow.
            
            Create a recipe using these ingredients: %s.
            Format the response as JSON with the following structure:
            {
                "mealName": "name of the dish",
                "ingredientsList": ["detailed ingredients with measurements"],
                "equipmentNeeded": ["required equipment"],
                "instructions": ["step by step instructions"],
                "servingSuggestions": ["serving suggestions"],
                "nutritionalInformation": {
                    "calories": number,
                    "protein": "amount in grams",
                    "carbohydrates": "amount in grams",
                    "fat": "amount in grams",
                    "macrosPerServing": {
                        "protein": "amount in grams",
                        "carbohydrates": "amount in grams",
                        "fat": "amount in grams"
                    }
                }
            }""";
}
