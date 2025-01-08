package dev.idachev.backend.service.impl;

import dev.idachev.backend.service.RecipeService;
import dev.idachev.backend.util.OpenAIClient;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class RecipeServiceImpl implements RecipeService {

    private final OpenAIClient openAIClient;

    public RecipeServiceImpl(OpenAIClient openAIClient) {
        this.openAIClient = openAIClient;
    }

    @Override
    public Map<String, Object> generateMeal(List<String> ingredients) {
        String prompt = "Generate a recipe using the following ingredients: " + String.join(", ", ingredients);
        String aiResponse = openAIClient.getMealSuggestion(prompt);

        Map<String, Object> response = new HashMap<>();
        response.put("mealName", "Mock Meal");
        response.put("ingredientsUsed", ingredients);
        response.put("image", "https://example.com/mock-image.jpg");
        response.put("recipeDetails", aiResponse);

        return response;
    }
}
