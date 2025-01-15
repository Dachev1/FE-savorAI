package dev.idachev.backend.recipe.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import dev.idachev.backend.recipe.service.RecipeService;
import dev.idachev.backend.util.OpenAIClient;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class RecipeServiceImpl implements RecipeService {

    private final OpenAIClient openAIClient;
    private final ObjectMapper objectMapper;

    public RecipeServiceImpl(OpenAIClient openAIClient, ObjectMapper objectMapper) {
        this.openAIClient = openAIClient;
        this.objectMapper = objectMapper;
    }

    @Override
    public Map<String, Object> generateMeal(List<String> ingredients) {
        validateIngredients(ingredients);

        String prompt = createPrompt(ingredients);
        String aiResponse = openAIClient.getMealSuggestion(prompt);
        return parseRecipe(aiResponse, ingredients);
    }

    private void validateIngredients(List<String> ingredients) {
        if (ingredients == null || ingredients.isEmpty()) {
            throw new IllegalArgumentException("Ingredients list cannot be empty.");
        }
    }

    private String createPrompt(List<String> ingredients) {
        return "Generate a unique recipe using the following ingredients: " +
                String.join(", ", ingredients) +
                ". Provide a detailed step-by-step guide and a recipe name.";
    }

    private Map<String, Object> parseRecipe(String aiResponse, List<String> ingredients) {
        try {
            JsonNode rootNode = objectMapper.readTree(aiResponse);
            String content = rootNode.path("choices").get(0).path("message").path("content").asText();

            String[] lines = content.split("\n", 2);
            String mealName = lines[0].trim().replace("Recipe: ", "");
            String recipeDetails = lines.length > 1 ? lines[1].trim() : "";

            return Map.of(
                    "mealName", mealName,
                    "ingredientsUsed", ingredients,
                    "image", generateImage(mealName),
                    "recipeDetails", recipeDetails
            );
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse recipe from OpenAI response: " + e.getMessage());
        }
    }

    private String generateImage(String mealName) {
        try {
            String prompt = "A professional, high-quality photo of a delicious " + mealName + " dish.";
            String aiImageResponse = openAIClient.generateImage(prompt);

            JsonNode rootNode = objectMapper.readTree(aiImageResponse);
            return rootNode.path("data").get(0).path("url").asText();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate image: " + e.getMessage());
        }
    }
}
