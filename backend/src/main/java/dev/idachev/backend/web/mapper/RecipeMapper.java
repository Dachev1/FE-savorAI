package dev.idachev.backend.web.mapper;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import dev.idachev.backend.exception.MappingException;
import dev.idachev.backend.macros.model.Macros;
import dev.idachev.backend.recipe.model.Recipe;
import dev.idachev.backend.web.dto.GeneratedMealResponse;
import dev.idachev.backend.web.dto.MacrosData;
import dev.idachev.backend.web.dto.RecipeDetails;
import dev.idachev.backend.web.dto.RecipeResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
public class RecipeMapper {

    private final ObjectMapper objectMapper;

    @Autowired
    public RecipeMapper(final ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public GeneratedMealResponse toGeneratedMealResponse(final JsonNode recipeNode, final List<String> originalIngredients, final String imageUrl) {

        try {
            // Map the JSON node to RecipeDetails using Jackson.
            RecipeDetails details = objectMapper.treeToValue(recipeNode, RecipeDetails.class);
            String mealName = recipeNode.path("mealName").asText();

            return new GeneratedMealResponse(mealName, originalIngredients, details, imageUrl);
        } catch (Exception e) {

            log.error("Failed to map generated meal response", e);

            throw new MappingException("Failed to map recipe response", e);
        }
    }

    public RecipeResponse toRecipeResponseWithMacros(Recipe recipe) {
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
                macrosData
        );
    }
}
