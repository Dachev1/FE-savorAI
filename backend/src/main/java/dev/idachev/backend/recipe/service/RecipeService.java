package dev.idachev.backend.recipe.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import dev.idachev.backend.exception.InvalidIngredientsException;
import dev.idachev.backend.util.OpenAIClient;
import dev.idachev.backend.web.dto.GeneratedMealResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RecipeService {

    private final OpenAIClient openAIClient;
    private final ObjectMapper objectMapper;

    @Autowired
    public RecipeService(OpenAIClient openAIClient, ObjectMapper objectMapper) {
        this.openAIClient = openAIClient;
        this.objectMapper = objectMapper;
    }

    /**
     * Generates a meal based on the provided list of ingredients.
     *
     * @param ingredients the list of ingredients for meal generation
     * @return a GeneratedMealResponse containing the generated meal details and image URL
     */
    public GeneratedMealResponse generateMeal(List<String> ingredients) {
        validateIngredients(ingredients);
        String prompt = buildPrompt(ingredients);

        // Generate meal details
        String aiResponse = openAIClient.getMealSuggestion(prompt);
        GeneratedMealResponse mealResponse = parseRecipe(aiResponse, ingredients);

        // Generate image based on meal name
        String imagePrompt = "A high-quality image of " + mealResponse.mealName();
        String imageResponse = openAIClient.generateImage(imagePrompt);
        String imageUrl = parseImageResponse(imageResponse);

        // Return the response with imageUrl
        return new GeneratedMealResponse(
                mealResponse.mealName(),
                mealResponse.ingredientsUsed(),
                mealResponse.recipeDetails(),
                imageUrl
        );
    }

    private void validateIngredients(List<String> ingredients) {
        if (ingredients == null || ingredients.isEmpty()) {
            throw new InvalidIngredientsException("Ingredients list cannot be empty.");
        }
    }

    private String buildPrompt(List<String> ingredients) {
        return "Generate a unique recipe using the following ingredients: " +
                String.join(", ", ingredients) +
                ". Provide a detailed step-by-step guide and a recipe name.";
    }

    private GeneratedMealResponse parseRecipe(String response, List<String> ingredients) {
        try {
            JsonNode rootNode = objectMapper.readTree(response);
            String content = rootNode
                    .path("choices")
                    .get(0)
                    .path("message")
                    .path("content")
                    .asText();

            String[] lines = content.split("\n", 2);
            String mealName = lines[0].replace("Recipe: ", "").trim();
            String recipeDetails = (lines.length > 1) ? lines[1].trim() : "";

            return new GeneratedMealResponse(mealName, ingredients, recipeDetails, null);  // Temporarily set imageUrl as null
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse recipe from response.", e);
        }
    }

    private String parseImageResponse(String response) {
        try {
            JsonNode rootNode = objectMapper.readTree(response);
            JsonNode dataNode = rootNode.path("data");
            if (dataNode.isArray() && !dataNode.isEmpty()) {
                return dataNode.get(0).path("url").asText();
            }
            throw new RuntimeException("No image URL found in response.");
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse image URL from response.", e);
        }
    }
}
