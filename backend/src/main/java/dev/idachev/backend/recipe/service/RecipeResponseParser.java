package dev.idachev.backend.recipe.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import dev.idachev.backend.exception.ParseException;
import dev.idachev.backend.web.dto.GeneratedMealResponse;
import dev.idachev.backend.web.dto.NutritionalInformation;
import dev.idachev.backend.web.dto.RecipeDetails;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Parses responses from OpenAI APIs into application-specific DTOs.
 */
@Component
@Slf4j
public class RecipeResponseParser {

    private final ObjectMapper objectMapper;

    @Autowired
    public RecipeResponseParser(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    /**
     * Parses the OpenAI recipe response into a structured {@link GeneratedMealResponse}.
     *
     * @param response    Raw JSON response from OpenAI.
     * @param ingredients Original ingredients used for the request.
     * @return Parsed meal response.
     * @throws ParseException If the response structure is invalid or critical fields are missing.
     */
    public GeneratedMealResponse parseRecipeResponse(String response, List<String> ingredients) {
        try {
            // Parse the raw response into a JSON tree.
            JsonNode rootNode = objectMapper.readTree(response);

            // Extract the message content from choices[0].message.content
            String content = extractMessageContent(rootNode);

            // Parse the content string into a JSON tree.
            JsonNode contentJson = objectMapper.readTree(content);

            // Extract necessary fields from the content.
            String mealName = extractField(contentJson, "mealName");
            List<String> ingredientsUsed = extractStringList(contentJson, "ingredientsUsed");
            RecipeDetails recipeDetails = parseRecipeDetails(contentJson.path("recipeDetails"));

            // imageUrl will be provided later in the workflow.
            return new GeneratedMealResponse(
                    mealName,
                    ingredientsUsed,
                    recipeDetails,
                    null
            );
        } catch (JsonProcessingException e) {
            log.error("Failed to parse recipe response JSON: {}", e.getMessage());
            throw new ParseException("Failed to parse recipe response JSON.", e);
        } catch (Exception e) {
            log.error("Failed to parse recipe response: {}", e.getMessage());
            throw new ParseException("Failed to parse recipe response.", e);
        }
    }

    /**
     * Parses the image generation response to extract the image URL.
     *
     * @param response Raw JSON response from the OpenAI Image Generation API.
     * @return The extracted image URL.
     * @throws ParseException If the image URL is missing or the response structure is invalid.
     */
    public String parseImageResponse(String response) {
        try {
            JsonNode rootNode = objectMapper.readTree(response);
            JsonNode dataNode = rootNode.path("data");
            if (!dataNode.isArray() || dataNode.isEmpty()) {
                throw new ParseException("No image data found in the OpenAI response.");
            }

            JsonNode firstImageNode = dataNode.get(0);
            String imageUrl = extractField(firstImageNode, "url");
            return imageUrl;
        } catch (JsonProcessingException e) {
            log.error("Failed to parse image response JSON: {}", e.getMessage());
            throw new ParseException("Failed to parse image response JSON.", e);
        } catch (Exception e) {
            log.error("Failed to parse image response: {}", e.getMessage());
            throw new ParseException("Failed to parse image response.", e);
        }
    }

    // --- Helper Methods ---

    /**
     * Extracts the content of the message from the root JSON node.
     *
     * @param rootNode Root JSON node from the OpenAI response.
     * @return The content string.
     * @throws ParseException if required nodes are missing or blank.
     */
    private String extractMessageContent(JsonNode rootNode) throws ParseException {
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

        return contentNode.asText();
    }

    /**
     * Extracts a required field as text from the given JSON node.
     *
     * @param node      JSON node to search.
     * @param fieldName Name of the field to extract.
     * @return The text value of the field.
     * @throws ParseException if the field is missing or blank.
     */
    private String extractField(JsonNode node, String fieldName) throws ParseException {
        JsonNode fieldNode = node.path(fieldName);
        if (fieldNode.isMissingNode() || fieldNode.asText().isBlank()) {
            throw new ParseException("Missing or blank field: " + fieldName);
        }
        return fieldNode.asText();
    }

    /**
     * Extracts a list of strings from a JSON array field.
     *
     * @param node      JSON node to search.
     * @param fieldName Name of the array field.
     * @return A list of strings.
     * @throws ParseException if the field is not an array.
     */
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

    /**
     * Parses the recipe details node into a {@link RecipeDetails} object.
     *
     * @param node JSON node containing recipe details.
     * @return A populated RecipeDetails object.
     * @throws ParseException if required fields are missing.
     */
    private RecipeDetails parseRecipeDetails(JsonNode node) throws ParseException {
        if (node.isMissingNode()) {
            throw new ParseException("Recipe details not found in the response.");
        }

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

    /**
     * Parses the nutritional information from a JSON node.
     *
     * @param node JSON node containing nutritional information.
     * @return A populated NutritionalInformation object.
     * @throws ParseException if required fields are missing.
     */
    private NutritionalInformation parseNutritionalInformation(JsonNode node) throws ParseException {
        int calories = node.path("calories").asInt();
        String protein = extractField(node, "protein");
        String carbohydrates = extractField(node, "carbohydrates");
        String fat = extractField(node, "fat");

        return new NutritionalInformation(calories, protein, carbohydrates, fat);
    }
}
