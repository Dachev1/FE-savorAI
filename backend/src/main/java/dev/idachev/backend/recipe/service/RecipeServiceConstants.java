package dev.idachev.backend.recipe.service;

public final class RecipeServiceConstants {
    private RecipeServiceConstants() {
        // Prevent instantiation
    }

    public static final String RECIPE_NAME_PREFIX = "Recipe Name: ";
    public static final String IMAGE_PROMPT_FORMAT = "A high-quality image of %s.";
    public static final String RECIPE_PROMPT_TEMPLATE = "Generate a unique recipe using the following ingredients: %s. Provide a detailed step-by-step guide and a recipe name.";
    public static final String INVALID_INGREDIENTS_MESSAGE = "Ingredients list cannot be empty.";
    public static final String FAILED_PARSE_RECIPE_MESSAGE = "Failed to parse recipe from response.";
    public static final String FAILED_PARSE_IMAGE_URL_MESSAGE = "Failed to parse image URL from response.";
    public static final String MEAL_NAME_NOT_FOUND_MESSAGE = "Meal name not found in the response.";
    public static final String RECIPE_DETAILS_NOT_FOUND_MESSAGE = "Recipe details not found in the response.";
    public static final String NO_IMAGE_URL_FOUND_MESSAGE = "No image URL found in the response.";
}
