package dev.idachev.backend.recipe.service;

public final class RecipeServiceConstants {
    private RecipeServiceConstants() {}

    // Prompts
    public static final String RECIPE_NAME_PREFIX = "Recipe Name: ";
    public static final String IMAGE_PROMPT_FORMAT = "A high-quality image of %s.";
    public static final String RECIPE_PROMPT_TEMPLATE = "Generate a unique recipe using: %s. Include a detailed guide and name.";

    // Validation
    public static final String INVALID_INGREDIENTS_MESSAGE = "Ingredients list cannot be empty.";
    public static final String INVALID_INGREDIENT_FORMAT = "Invalid ingredient format: '%s'";
    public static final String VALID_INGREDIENT_REGEX = "^[a-zA-Z0-9\\s%,()&-]+$";

    // Error messages
    public static final String FAILED_PARSE_RECIPE = "Failed to parse recipe from response";
    public static final String FAILED_PARSE_IMAGE = "Failed to parse image URL";
    public static final String MISSING_MEAL_NAME = "Meal name not found";
    public static final String MISSING_RECIPE_DETAILS = "Recipe details not found";
    public static final String MISSING_IMAGE_URL = "No image URL found";
    public static final String INVALID_MEAL_NAME = "Meal name required for image generation";
}