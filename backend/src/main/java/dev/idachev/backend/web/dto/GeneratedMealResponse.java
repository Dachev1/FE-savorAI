package dev.idachev.backend.web.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

@Schema(description = "Response containing details of the generated meal recipe.")
public record GeneratedMealResponse(
        @Schema(description = "Name of the generated meal.", example = "Grilled Chicken with Rice and Broccoli") String mealName,

        @Schema(description = "List of ingredients used in the meal.", example = "[\"chicken\", \"rice\", \"broccoli\"]") List<String> ingredientsUsed,

        @Schema(description = "Detailed recipe instructions.") RecipeDetails recipeDetails,

        @Schema(description = "URL to the generated image of the meal.", example = "https://example.com/images/meal.jpg") String imageUrl) {
}
