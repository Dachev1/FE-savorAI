package dev.idachev.backend.web.dto;

import java.util.List;

public record GeneratedMealResponse(
        String mealName,
        List<String> ingredientsUsed,
        String recipeDetails,
        String imageUrl
) {}