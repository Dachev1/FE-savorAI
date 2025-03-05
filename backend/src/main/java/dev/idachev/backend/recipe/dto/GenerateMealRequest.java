package dev.idachev.backend.recipe.dto;

import dev.idachev.backend.recipe.service.RecipeConstants;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

@Schema(description = "Request payload for generating a meal recipe.")
public record GenerateMealRequest(
        @Schema(description = "List of ingredients to generate the meal from.", example = "[\"chicken\", \"rice\", \"broccoli\"]")
        @NotEmpty(message = RecipeConstants.INVALID_INGREDIENTS_MESSAGE) List<String> ingredients) {
}
