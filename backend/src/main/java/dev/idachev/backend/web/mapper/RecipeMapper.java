package dev.idachev.backend.web.mapper;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import dev.idachev.backend.exception.MappingException;
import dev.idachev.backend.web.dto.GeneratedMealResponse;
import dev.idachev.backend.web.dto.RecipeDetails;
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
}
