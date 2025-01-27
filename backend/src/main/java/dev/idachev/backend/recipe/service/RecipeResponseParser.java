package dev.idachev.backend.recipe.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import dev.idachev.backend.web.dto.GeneratedMealResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class RecipeResponseParser {

    private final ObjectMapper objectMapper;

    @Autowired
    public RecipeResponseParser(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public GeneratedMealResponse parseRecipeResponse(String response, List<String> ingredients) {
        try {
            JsonNode rootNode = objectMapper.readTree(response);
            String content = rootNode
                    .path("choices")
                    .get(0)
                    .path("message")
                    .path("content")
                    .asText();

            String mealName = extractMealName(content);
            String recipeDetails = extractRecipeDetails(content);

            return new GeneratedMealResponse(
                    mealName,
                    ingredients,
                    recipeDetails,
                    null
            );
        } catch (Exception e) {
            throw new RuntimeException(RecipeServiceConstants.FAILED_PARSE_RECIPE_MESSAGE, e);
        }
    }

    public String extractImageUrl(String response) {
        try {
            JsonNode rootNode = objectMapper.readTree(response);
            JsonNode dataNode = rootNode.path("data");
            if (dataNode.isArray() && dataNode.size() > 0) {
                return dataNode.get(0).path("url").asText();
            }
            throw new RuntimeException(RecipeServiceConstants.NO_IMAGE_URL_FOUND_MESSAGE);
        } catch (Exception e) {
            throw new RuntimeException(RecipeServiceConstants.FAILED_PARSE_IMAGE_URL_MESSAGE, e);
        }
    }

    private String extractMealName(String content) {
        String prefix = RecipeServiceConstants.RECIPE_NAME_PREFIX;
        int startIndex = content.indexOf(prefix);
        if (startIndex == -1) {
            throw new RuntimeException(RecipeServiceConstants.MEAL_NAME_NOT_FOUND_MESSAGE);
        }
        int endIndex = content.indexOf("\n", startIndex);
        if (endIndex == -1) {
            endIndex = content.length();
        }
        return content.substring(startIndex + prefix.length(), endIndex).trim();
    }

    private String extractRecipeDetails(String content) {
        String[] parts = content.split("\n", 2);
        if (parts.length < 2) {
            throw new RuntimeException(RecipeServiceConstants.RECIPE_DETAILS_NOT_FOUND_MESSAGE);
        }
        return parts[1].trim();
    }
}
