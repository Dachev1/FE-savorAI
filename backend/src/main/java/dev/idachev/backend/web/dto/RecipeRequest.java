package dev.idachev.backend.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record RecipeRequest(
        @NotBlank(message = "Meal name is required")
        String mealName,

        @NotEmpty(message = "At least one ingredient is required")
        List<@NotBlank(message = "Ingredient cannot be blank") String> ingredientsUsed,

        @NotBlank(message = "Recipe details are required")
        String recipeDetails,

        // Optional macros field (can be null)
        MacrosData macros
) {}
