package dev.idachev.backend.recipe.dto;

import dev.idachev.backend.macros.dto.MacrosData;
import java.util.List;
import java.util.UUID;

public record RecipeResponse(
        UUID id,
        String mealName,
        List<String> ingredientsUsed,
        String recipeDetails,
        String imageUrl,
        boolean aiGenerated,
        Integer prepTimeMinutes,
        MacrosData macros
) {}
