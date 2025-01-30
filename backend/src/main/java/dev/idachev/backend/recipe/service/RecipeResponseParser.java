package dev.idachev.backend.recipe.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import dev.idachev.backend.exception.ParseException;
import dev.idachev.backend.web.dto.GeneratedMealResponse;
import dev.idachev.backend.web.dto.NutritionalInformation;
import dev.idachev.backend.web.dto.RecipeDetails;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Parses responses from OpenAI APIs into application-specific DTOs.
 */
@Component
public class RecipeResponseParser {
    private static final Logger LOGGER = LoggerFactory.getLogger(RecipeResponseParser.class);

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
            // Parse the raw response to JsonNode
            JsonNode rootNode = objectMapper.readTree(response);

            // Navigate to choices[0].message.content
            JsonNode choicesNode = rootNode.path("choices");
            if (!choicesNode.isArray() || choicesNode.isEmpty()) {
                throw new ParseException("No choices found in the OpenAI response.");
            }

            JsonNode messageNode = choicesNode.get(0).path("message");
            if (messageNode.isMissingNode()) {
                throw new ParseException("Message node not found in the OpenAI response.");
            }

            JsonNode contentNode = messageNode.path("content");
            if (contentNode.isMissingNode() || contentNode.asText().isBlank()) {
                throw new ParseException("Content field is missing or blank in the OpenAI response.");
            }

            String content = contentNode.asText();

            // Parse the content JSON string
            JsonNode contentJson = objectMapper.readTree(content);

            // Extract fields
            String mealName = extractField(contentJson, "mealName");
            List<String> ingredientsUsed = extractStringList(contentJson, "ingredientsUsed");
            JsonNode recipeDetailsNode = contentJson.path("recipeDetails");
            if (recipeDetailsNode.isMissingNode()) {
                throw new ParseException("Recipe details not found in the response.");
            }

            // Parse RecipeDetails
            RecipeDetails recipeDetails = parseRecipeDetails(recipeDetailsNode);

            // imageUrl will be handled separately, not parsed here

            return new GeneratedMealResponse(
                    mealName,
                    ingredientsUsed,
                    recipeDetails,
                    null // Placeholder for imageUrl, to be set later
            );

        } catch (JsonProcessingException e) {
            LOGGER.error("Failed to parse recipe response JSON: {}", e.getMessage());
            throw new ParseException("Failed to parse recipe response JSON.", e);
        } catch (Exception e) {
            LOGGER.error("Failed to parse recipe response: {}", e.getMessage());
            throw new ParseException("Failed to parse recipe response.", e);
        }
    }

    /**
     * Parses the image generation response to extract the image URL.
     *
     * @param response Raw JSON response from OpenAI Image Generation API
     * @return Image URL
     * @throws ParseException If the image URL is missing or the response structure is invalid
     */
    public String parseImageResponse(String response) {
        try {
            JsonNode rootNode = objectMapper.readTree(response);
            JsonNode dataNode = rootNode.path("data");
            if (!dataNode.isArray() || dataNode.isEmpty()) {
                throw new ParseException("No image data found in the OpenAI response.");
            }

            JsonNode firstImageNode = dataNode.get(0);
            JsonNode urlNode = firstImageNode.path("url");
            if (urlNode.isMissingNode() || urlNode.asText().isBlank()) {
                throw new ParseException("Image URL is missing or blank in the response.");
            }

            return urlNode.asText();
        } catch (JsonProcessingException e) {
            LOGGER.error("Failed to parse image response JSON: {}", e.getMessage());
            throw new ParseException("Failed to parse image response JSON.", e);
        } catch (Exception e) {
            LOGGER.error("Failed to parse image response: {}", e.getMessage());
            throw new ParseException("Failed to parse image response.", e);
        }
    }

    // Existing Helper Methods...

    private String extractField(JsonNode node, String fieldName) throws ParseException {
        JsonNode fieldNode = node.path(fieldName);
        if (fieldNode.isMissingNode() || fieldNode.asText().isBlank()) {
            throw new ParseException("Missing or blank field: " + fieldName);
        }
        return fieldNode.asText();
    }

    private List<String> extractStringList(JsonNode node, String fieldName) throws ParseException {
        JsonNode arrayNode = node.path(fieldName);
        if (!arrayNode.isArray()) {
            throw new ParseException("Expected an array for field: " + fieldName);
        }
        List<String> list = new ArrayList<>();
        for (JsonNode element : arrayNode) {
            list.add(element.asText());
        }
        return list;
    }

    private RecipeDetails parseRecipeDetails(JsonNode node) throws ParseException {
        List<String> ingredientsList = extractStringList(node, "ingredientsList");
        List<String> equipmentNeeded = extractStringList(node, "equipmentNeeded");
        List<String> instructions = extractStringList(node, "instructions");
        List<String> servingSuggestions = extractStringList(node, "servingSuggestions");

        NutritionalInformation nutritionalInformation = null;
        JsonNode nutritionalInfoNode = node.path("nutritionalInformation");
        if (!nutritionalInfoNode.isMissingNode() && !nutritionalInfoNode.isNull()) {
            nutritionalInformation = parseNutritionalInformation(nutritionalInfoNode);
        }

        return new RecipeDetails(
                ingredientsList,
                equipmentNeeded,
                instructions,
                servingSuggestions,
                nutritionalInformation
        );
    }

    private NutritionalInformation parseNutritionalInformation(JsonNode node) throws ParseException {
        int calories = node.path("calories").asInt();
        String protein = node.path("protein").asText();
        String carbohydrates = node.path("carbohydrates").asText();
        String fat = node.path("fat").asText();

        return new NutritionalInformation(
                calories,
                protein,
                carbohydrates,
                fat
        );
    }
}
