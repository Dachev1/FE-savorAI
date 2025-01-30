package dev.idachev.backend.web.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

@Schema(description = "Detailed information about the recipe.")
public record RecipeDetails(
        @Schema(description = "Detailed list of ingredients with quantities.", example = "[\"4 chicken breasts\", \"3 cloves garlic, minced\"]")
        List<String> ingredientsList,

        @Schema(description = "List of equipment needed.", example = "[\"Oven\", \"Baking Dish\", \"Knife\", \"Cutting Board\", \"Bowl\", \"Zester\", \"Garlic Press\"]")
        List<String> equipmentNeeded,

        @Schema(description = "Step-by-step instructions for preparing the dish.", example = "[\"Step 1: Preheat oven.\", \"Step 2: Marinate chicken.\"]")
        List<String> instructions,

        @Schema(description = "Suggestions for serving the dish.", example = "[\"Serve with steamed vegetables.\", \"Pair with white wine.\"]")
        List<String> servingSuggestions,

        @Schema(description = "Nutritional information of the dish.", example = "{ \"calories\": 350, \"protein\": \"40g\", \"carbohydrates\": \"5g\", \"fat\": \"18g\" }")
        NutritionalInformation nutritionalInformation) {
}
