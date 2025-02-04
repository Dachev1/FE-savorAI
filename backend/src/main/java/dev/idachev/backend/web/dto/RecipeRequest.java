package dev.idachev.backend.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record RecipeRequest(
        @NotBlank(message = "Meal name is required")
        String mealName,

        @NotEmpty(message = "At least one ingredient is required")
        @NotBlank(message = "Ingredient cannot be blank")
        List<String> ingredientsUsed,

        @NotBlank(message = "Recipe details are required")
        String recipeDetails,

        // The image URL is optional (or you could later change this to a MultipartFile if needed)
        String imageUrl
        ) {}


