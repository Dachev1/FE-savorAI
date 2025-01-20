package dev.idachev.backend.recipe.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import dev.idachev.backend.util.OpenAIClient;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class RecipeService {

    private final OpenAIClient openAIClient;
    private final ObjectMapper objectMapper;

    public RecipeService(OpenAIClient openAIClient, ObjectMapper objectMapper) {
        this.openAIClient = openAIClient;
        this.objectMapper = objectMapper;
    }

    public Map<String, Object> generateMeal(List<String> ingredients) {
        validateIngredientsNotEmpty(ingredients);
        String prompt = buildMealSuggestionPrompt(ingredients);

        String openAiResponse = openAIClient.getMealSuggestion(prompt);
        return extractRecipeFromAiResponse(openAiResponse, ingredients);
    }

    private void validateIngredientsNotEmpty(List<String> ingredients) {
        if (ingredients == null || ingredients.isEmpty()) {
            throw new IllegalArgumentException("Ingredients list cannot be empty.");
        }
    }

    private String buildMealSuggestionPrompt(List<String> ingredients) {
        return "Generate a unique recipe using the following ingredients: " +
                String.join(", ", ingredients) +
                ". Provide a detailed step-by-step guide and a recipe name.";
    }

    private Map<String, Object> extractRecipeFromAiResponse(String response, List<String> ingredients) {
        try {
            JsonNode rootNode = objectMapper.readTree(response);
            String content = rootNode
                    .path("choices")
                    .get(0)
                    .path("message")
                    .path("content")
                    .asText();

            String[] lines = content.split("\n", 2);
            String mealName = lines[0].trim().replace("Recipe: ", "");
            String recipeDetails = (lines.length > 1) ? lines[1].trim() : "";

            return Map.of(
                    "mealName", mealName,
                    "ingredientsUsed", ingredients,
                    "imageUrl", generateMealImageUrl(mealName),
                    "recipeDetails", recipeDetails
            );
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse recipe from OpenAI response: " + e.getMessage(), e);
        }
    }

    private String generateMealImageUrl(String mealName) {
        try {
            String prompt = "A professional, high-quality photo of a delicious " + mealName + " dish.";
            String aiImageResponse = openAIClient.generateImage(prompt);

            JsonNode rootNode = objectMapper.readTree(aiImageResponse);
            return rootNode.path("data").get(0).path("url").asText();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate image: " + e.getMessage(), e);
        }
    }
}
