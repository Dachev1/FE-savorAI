package dev.idachev.backend.web.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

@Schema(description = "Contains details of a generated meal recipe")
public record GeneratedMealResponse(
        String mealName,
        List<String> ingredientsUsed,
        String recipeDetails,
        String imageUrl
) {}