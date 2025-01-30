package dev.idachev.backend.recipe.service;

public class RecipeServiceConstants {
    public static final String INVALID_INGREDIENTS_MESSAGE = "Ingredients list cannot be empty.";
    public static final String INVALID_INGREDIENT_FORMAT = "Invalid ingredient format: '%s'";

    public static final String VALID_INGREDIENT_REGEX = "^[a-zA-Z0-9\\s-]+$";

    public static final String IMAGE_PROMPT_FORMAT = "A high-resolution, appetizing image of %s, styled beautifully on a plate.";
    public static final String RECIPE_PROMPT_TEMPLATE = "Generate a detailed recipe based on the following ingredients: %s";
}
