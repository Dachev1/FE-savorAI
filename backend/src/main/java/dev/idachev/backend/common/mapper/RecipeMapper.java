package dev.idachev.backend.common.mapper;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import dev.idachev.backend.common.exception.MappingException;
import dev.idachev.backend.macros.model.Macros;
import dev.idachev.backend.macros.dto.MacrosData;
import dev.idachev.backend.recipe.model.Recipe;
import dev.idachev.backend.recipe.dto.GeneratedMealResponse;
import dev.idachev.backend.recipe.dto.RecipeDetails;
import dev.idachev.backend.recipe.dto.RecipeResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Mapper for converting between recipe-related entities and DTOs.
 */
@Slf4j
@Component
public class RecipeMapper {

    private final ObjectMapper objectMapper;

    @Autowired
    public RecipeMapper(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    /**
     * Converts a JSON node to a GeneratedMealResponse.
     *
     * @param recipeNode JSON node containing recipe data
     * @param originalIngredients List of original ingredients
     * @param imageUrl URL of the recipe image
     * @return GeneratedMealResponse containing the recipe data
     * @throws MappingException if mapping fails
     */
    public GeneratedMealResponse toGeneratedMealResponse(final JsonNode recipeNode, final List<String> originalIngredients, final String imageUrl) {
        try {
            log.debug("Mapping JSON node to GeneratedMealResponse");
            // Map the JSON node to RecipeDetails using Jackson.
            RecipeDetails details = objectMapper.treeToValue(recipeNode, RecipeDetails.class);
            String mealName = recipeNode.path("mealName").asText();

            return new GeneratedMealResponse(mealName, originalIngredients, details, imageUrl);
        } catch (Exception e) {
            log.error("Failed to map generated meal response", e);
            throw new MappingException("Failed to map recipe response", e);
        }
    }

    /**
     * Converts a Recipe entity to a RecipeResponse DTO, including macros data if available.
     *
     * @param recipe Recipe entity to convert
     * @return RecipeResponse containing the recipe data
     */
    public RecipeResponse toRecipeResponseWithMacros(Recipe recipe) {
        log.debug("Mapping Recipe entity to RecipeResponse: {}", recipe.getId());
        MacrosData macrosData = null;

        if (recipe.getMacros() != null) {
            Macros macros = recipe.getMacros();
            macrosData = new MacrosData(
                    macros.getCalories(),
                    macros.getProtein(),
                    macros.getCarbs(),
                    macros.getFat()
            );
        }

        return new RecipeResponse(
                recipe.getId(),
                recipe.getTitle(),
                recipe.getIngredients(),
                recipe.getDescription(),
                recipe.getImageUrl(),
                recipe.isAiGenerated(),
                recipe.getPrepTimeMinutes(),
                macrosData
        );
    }
}
