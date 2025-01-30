package dev.idachev.backend.recipe.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import dev.idachev.backend.web.dto.GeneratedMealResponse;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class RecipeResponseParser {
    private static final String CHOICES_PATH = "choices";
    private static final String MESSAGE_PATH = "message";
    private static final String CONTENT_PATH = "content";
    private static final String DATA_PATH = "data";
    private static final String URL_PATH = "url";

    private final ObjectMapper objectMapper;

    public RecipeResponseParser(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public GeneratedMealResponse parseRecipeResponse(String response, List<String> ingredients) {
        try {
            final String content = extractContent(response);
            return new GeneratedMealResponse(
                    extractMealName(content),
                    ingredients,
                    extractRecipeDetails(content),
                    null
            );
        } catch (Exception e) {
            throw new ParseException(RecipeServiceConstants.FAILED_PARSE_RECIPE, e);
        }
    }

    public String extractImageUrl(String response) {
        try {
            JsonNode rootNode = objectMapper.readTree(response);
            JsonNode dataNode = rootNode.path(DATA_PATH);

            if (dataNode.isEmpty() || !dataNode.isArray()) {
                throw new ParseException(RecipeServiceConstants.MISSING_IMAGE_URL);
            }

            return dataNode.get(0).path(URL_PATH).asText();
        } catch (Exception e) {
            throw new ParseException(RecipeServiceConstants.FAILED_PARSE_IMAGE, e);
        }
    }

    private String extractContent(String response) throws Exception {
        JsonNode rootNode = objectMapper.readTree(response);
        JsonNode choicesNode = rootNode.path(CHOICES_PATH);

        if (choicesNode.isEmpty() || !choicesNode.isArray()) {
            throw new ParseException(RecipeServiceConstants.FAILED_PARSE_RECIPE);
        }

        return choicesNode.get(0)
                .path(MESSAGE_PATH)
                .path(CONTENT_PATH)
                .asText();
    }

    private String extractMealName(String content) {
        int prefixIndex = content.indexOf(RecipeServiceConstants.RECIPE_NAME_PREFIX);
        if (prefixIndex == -1) {
            throw new ParseException(RecipeServiceConstants.MISSING_MEAL_NAME);
        }

        int endIndex = content.indexOf("\n", prefixIndex);
        return content.substring(
                prefixIndex + RecipeServiceConstants.RECIPE_NAME_PREFIX.length(),
                endIndex != -1 ? endIndex : content.length()
        ).trim();
    }

    private String extractRecipeDetails(String content) {
        String[] parts = content.split("\n", 2);
        if (parts.length < 2) {
            throw new ParseException(RecipeServiceConstants.MISSING_RECIPE_DETAILS);
        }
        return parts[1].trim();
    }

    public static class ParseException extends RuntimeException {
        public ParseException(String message, Throwable cause) {
            super(message, cause);
        }

        public ParseException(String message) {
            super(message);
        }
    }
}