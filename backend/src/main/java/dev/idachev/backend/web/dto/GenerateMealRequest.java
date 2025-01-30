package dev.idachev.backend.web.dto;

import dev.idachev.backend.recipe.service.RecipeServiceConstants;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record GenerateMealRequest(
        @NotEmpty(message = RecipeServiceConstants.INVALID_INGREDIENTS_MESSAGE)
        List<String> ingredients
) {
}