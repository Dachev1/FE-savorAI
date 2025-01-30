package dev.idachev.backend.recipe.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import dev.idachev.backend.web.dto.GeneratedMealResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class RecipeResponseParser {
    private static final Logger LOGGER = LoggerFactory.getLogger(RecipeResponseParser.class);

    // JSON Path Constants
    private static final String CHOICES_PATH = "choices";
    private static final String MESSAGE_PATH = "message";
    private static final String CONTENT_PATH = "content";
    private static final String DATA_PATH = "data";
    private static final String URL_PATH = "url";

    private final ObjectMapper objectMapper;

    @Autowired
    public RecipeResponseParser(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    /**
     * Parses the OpenAI recipe response into a structured meal response.
     *
     * @param response    Raw JSON response from OpenAI
     * @param ingredients Original ingredients used for the request
     * @return Parsed meal response
     * @throws ParseException If response structure is invalid or critical fields are missing
     */
    public GeneratedMealResponse parseRecipeResponse(String response, List<String> ingredients) {
        try {
            String content = extractContent(response);
            return new GeneratedMealResponse(
                    extractMealName(content),
                    ingredients,
                    extractRecipeDetails(content),
                    null // Image URL added later
            );
        } catch (ParseException e) {
            throw e; // Re-throw already contextualized exceptions
        } catch (Exception e) {
            LOGGER.error("Failed to parse recipe response: {}", response, e);
            throw new ParseException(RecipeServiceConstants.FAILED_PARSE_RECIPE, e);
        }
    }

    /**
     * Extracts the first image URL from the OpenAI image generation response.
     *
     * @param response Raw JSON response from OpenAI
     * @return Image URL
     * @throws ParseException If no valid URL found
     */
    public String extractImageUrl(String response) {
        try {
            JsonNode rootNode = objectMapper.readTree(response);
            JsonNode dataNode = validateJsonArray(rootNode, DATA_PATH, RecipeServiceConstants.MISSING_IMAGE_URL);

            JsonNode firstImageNode = dataNode.get(0);
            if (!firstImageNode.has(URL_PATH)) {
                throw new ParseException(RecipeServiceConstants.MISSING_IMAGE_URL);
            }

            return firstImageNode.path(URL_PATH).asText();
        } catch (ParseException e) {
            throw e;
        } catch (Exception e) {
            LOGGER.error("Failed to parse image response: {}", response, e);
            throw new ParseException(RecipeServiceConstants.FAILED_PARSE_IMAGE, e);
        }
    }

    // region Helper Methods

    private String extractContent(String response) throws Exception {
        JsonNode rootNode = objectMapper.readTree(response);
        JsonNode choicesNode = validateJsonArray(rootNode, CHOICES_PATH, RecipeServiceConstants.FAILED_PARSE_RECIPE);

        JsonNode messageNode = choicesNode.get(0).path(MESSAGE_PATH);
        if (!messageNode.has(CONTENT_PATH)) {
            throw new ParseException("Missing 'content' field in OpenAI response");
        }

        return messageNode.path(CONTENT_PATH).asText();
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
        if (parts.length < 2 || parts[1].isBlank()) {
            throw new ParseException(RecipeServiceConstants.MISSING_RECIPE_DETAILS);
        }
        return parts[1].trim();
    }

    private JsonNode validateJsonArray(JsonNode parentNode, String fieldName, String errorMessage) {
        JsonNode node = parentNode.path(fieldName);
        if (node.isMissingNode() || !node.isArray() || node.isEmpty()) {
            throw new ParseException(errorMessage);
        }
        return node;
    }

    // endregion

    public static class ParseException extends RuntimeException {
        public ParseException(String message, Throwable cause) {
            super(message, cause);
        }

        public ParseException(String message) {
            super(message);
        }
    }
}