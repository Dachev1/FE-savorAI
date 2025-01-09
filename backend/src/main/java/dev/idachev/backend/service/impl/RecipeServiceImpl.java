package dev.idachev.backend.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import dev.idachev.backend.service.RecipeService;
import dev.idachev.backend.util.OpenAIClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class RecipeServiceImpl implements RecipeService {

    private final OpenAIClient openAIClient;
    private final ObjectMapper objectMapper;
    private final WebClient webClient;
    private final String unsplashApiKey;

    public RecipeServiceImpl(
            OpenAIClient openAIClient,
            ObjectMapper objectMapper,
            WebClient.Builder webClientBuilder,
            @Value("${unsplash.api.key}") String unsplashApiKey) {
        this.openAIClient = openAIClient;
        this.objectMapper = objectMapper;
        this.webClient = webClientBuilder.baseUrl("https://api.unsplash.com").build();
        this.unsplashApiKey = unsplashApiKey;
    }

    @Override
    public Map<String, Object> generateMeal(List<String> ingredients) {
        if (ingredients == null || ingredients.isEmpty()) {
            throw new IllegalArgumentException("Ingredients list cannot be empty.");
        }

        String prompt = "Generate a recipe using the following ingredients: " + String.join(", ", ingredients);
        String aiResponse = openAIClient.getMealSuggestion(prompt);

        String recipeContent;
        String mealName;
        String realImageUrl;
        try {
            JsonNode root = objectMapper.readTree(aiResponse);
            recipeContent = root.path("choices").get(0).path("message").path("content").asText();
            mealName = recipeContent.split("\n")[0].replace("Recipe: ", "").trim();
            recipeContent = recipeContent.substring(recipeContent.indexOf("\n") + 1).trim();
            realImageUrl = fetchRealImage(ingredients);
        } catch (Exception e) {
            throw new RuntimeException("Error parsing OpenAI response: " + e.getMessage(), e);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("mealName", mealName);
        response.put("ingredientsUsed", ingredients);
        response.put("image", realImageUrl);
        response.put("recipeDetails", recipeContent);

        return response;
    }

    private String fetchRealImage(List<String> ingredients) {
        String searchQuery = String.join(", ", ingredients);
        String searchUrl = "/search/photos";

        try {
            JsonNode response = webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path(searchUrl)
                            .queryParam("query", searchQuery)
                            .queryParam("client_id", unsplashApiKey)
                            .build())
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .block();

            return response.path("results").get(0).path("urls").path("regular").asText();
        } catch (Exception e) {
            return "https://example.com/default-recipe.jpg";
        }
    }
}
