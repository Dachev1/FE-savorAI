package dev.idachev.backend.recipe.dto;

import dev.idachev.backend.macros.dto.MacrosData;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Min;
import java.util.List;

public record RecipeRequest(
        @NotBlank(message = "Meal name is required")
        String mealName,

        @NotEmpty(message = "At least one ingredient is required")
        List<@NotBlank(message = "Ingredient cannot be blank") String> ingredientsUsed,

        @NotBlank(message = "Recipe details are required")
        String recipeDetails,

        // Optional preparation time in minutes (can be null)
        @Min(value = 1, message = "Preparation time must be at least 1 minute")
        Integer prepTimeMinutes,

        // Optional macros field (can be null)
        MacrosData macros
) {}
