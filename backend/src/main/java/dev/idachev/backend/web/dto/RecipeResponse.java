package dev.idachev.backend.web.dto;

import java.util.List;
import java.util.UUID;

public record RecipeResponse(
        UUID id,
        String mealName,
        List<String> ingredientsUsed,
        String recipeDetails,
        String imageUrl,
        boolean aiGenerated,
        MacrosData macros
) {}
