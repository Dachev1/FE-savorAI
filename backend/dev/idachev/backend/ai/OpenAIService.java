package dev.idachev.backend.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import dev.idachev.backend.exception.AIGenerationException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.openai.OpenAiApi;
import org.springframework.ai.openai.api.chat.ChatCompletion;
import org.springframework.ai.openai.api.chat.ChatCompletionMessage;
import org.springframework.ai.openai.api.chat.ChatCompletionRequest;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class OpenAIService {
    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    public JsonNode generateRecipeJson(List<String> ingredients) {
        try {
            ChatCompletionRequest request = createChatCompletionRequest(ingredients);
            ChatCompletion response = restClient.post()
                .uri("/chat/completions")
                .body(request)
                .retrieve()
                .body(ChatCompletion.class);

            String content = response.getChoices().get(0).getMessage().getContent();
            
            // Remove markdown code block markers if present
            content = content.replaceAll("```json\\s*", "")
                           .replaceAll("```\\s*$", "")
                           .trim();

            return objectMapper.readTree(content);
        } catch (Exception e) {
            log.error("Failed to generate recipe", e);
            throw new AIGenerationException("Failed to generate recipe");
        }
    }

    private ChatCompletionRequest createChatCompletionRequest(List<String> ingredients) {
        String systemMessage = """
            You are a professional chef with expertise in creating delicious and nutritious recipes.
            Generate a detailed recipe with exact measurements, cooking steps, and nutritional information.
            Include a creative name for the dish that reflects its ingredients and style.
            Ensure all measurements are precise and instructions are clear and easy to follow.""";

        String userMessage = String.format("""
            Create a recipe using these ingredients: %s.
            Format the response as JSON with the following structure:
            {
                "mealName": "name of the dish",
                "ingredientsList": ["detailed ingredients with measurements"],
                "equipmentNeeded": ["required equipment"],
                "instructions": ["step by step instructions"],
                "servingSuggestions": ["serving suggestions"],
                "nutritionalInformation": {
                    "calories": number,
                    "protein": "amount in grams",
                    "carbohydrates": "amount in grams",
                    "fat": "amount in grams"
                }
            }
            """, String.join(", ", ingredients));

        return ChatCompletionRequest.builder()
            .model("gpt-3.5-turbo")
            .temperature(0.7)
            .messages(List.of(
                new ChatCompletionMessage(systemMessage, OpenAiApi.Role.SYSTEM),
                new ChatCompletionMessage(userMessage, OpenAiApi.Role.USER)
            ))
            .build();
    }
} 