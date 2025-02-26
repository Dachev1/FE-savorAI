package dev.idachev.backend.recipe.service;

public final class RecipeConstants {

    private RecipeConstants() {}

    public static final String VALID_INGREDIENT_REGEX = "^[a-zA-Z0-9\\s,.-]{2,50}$";
    public static final String INVALID_INGREDIENTS_MESSAGE = "Ingredients list cannot be empty";
    public static final String INVALID_INGREDIENT_FORMAT = "Invalid ingredient format: %s";
}
