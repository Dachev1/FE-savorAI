package dev.idachev.backend.infrastructure.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import dev.idachev.backend.common.exception.AIGenerationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.image.ImagePrompt;
import org.springframework.ai.openai.OpenAiChatClient;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.ai.openai.OpenAiImageClient;
import org.springframework.ai.openai.OpenAiImageOptions;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

/**
 * Service for interacting with OpenAI APIs for recipe generation and image creation.
 */
@Slf4j
@Service
public class OpenAIService {

    private static final int IMAGE_GENERATION_TIMEOUT_SECONDS = 30;
    private static final String IMAGE_PROMPT_TEMPLATE = 
            "Professional food photography of %s, on a beautiful plate, restaurant quality, high resolution";

    @Value("${spring.ai.openai.chat.model}")
    private String chatModel;

    @Value("${spring.ai.openai.chat.temperature}")
    private float temperature;

    @Value("${spring.ai.openai.chat.max-tokens}")
    private int maxTokens;

    @Value("${spring.ai.openai.image.options.model}")
    private String imageModel;

    @Value("${spring.ai.openai.image.options.quality}")
    private String imageQuality;

    @Value("${spring.ai.openai.image.options.width}")
    private int width;

    @Value("${spring.ai.openai.image.options.height}")
    private int height;

    private final OpenAiChatClient chatClient;
    private final OpenAiImageClient imageClient;
    private final ObjectMapper objectMapper;

    @Autowired
    public OpenAIService(OpenAiChatClient chatClient, OpenAiImageClient imageClient, ObjectMapper objectMapper) {
        this.chatClient = chatClient;
        this.imageClient = imageClient;
        this.objectMapper = objectMapper;
    }

    /**
     * Generates a recipe in JSON format based on the provided ingredients.
     *
     * @param ingredients List of ingredients to use in the recipe
     * @return JsonNode containing the generated recipe
     * @throws AIGenerationException if recipe generation fails
     */
    public JsonNode generateRecipeJson(final List<String> ingredients) {
        try {
            log.debug("Generating recipe for ingredients: {}", ingredients);
            String promptText = String.format(PromptTemplates.RECIPE_PROMPT, String.join(", ", ingredients));
            String responseContent = fetchAIResponse(promptText);
            return parseJsonContent(responseContent);
        } catch (Exception e) {
            log.error("Failed to generate recipe JSON for ingredients: {}", ingredients, e);
            throw new AIGenerationException("Failed to generate recipe. Please try again later.", e);
        }
    }

    /**
     * Generates a recipe image based on the meal name.
     *
     * @param mealName Name of the meal to generate an image for
     * @return URL of the generated image
     * @throws AIGenerationException if image generation fails
     */
    public String generateRecipeImage(final String mealName) {
        try {
            log.debug("Generating image for meal: {}", mealName);
            String imagePromptText = String.format(IMAGE_PROMPT_TEMPLATE, mealName);
            
            CompletableFuture<String> future = CompletableFuture.supplyAsync(() -> 
                imageClient.call(new ImagePrompt(
                    imagePromptText,
                    OpenAiImageOptions.builder()
                        .withModel(imageModel)
                        .withQuality(imageQuality)
                        .withWidth(width)
                        .withHeight(height)
                        .build()))
                .getResult().getOutput().getUrl()
            );
            
            return future.get(IMAGE_GENERATION_TIMEOUT_SECONDS, TimeUnit.SECONDS);
        } catch (TimeoutException e) {
            log.error("Image generation timed out for meal: {}", mealName, e);
            throw new AIGenerationException("Image generation timed out. Please try again later.", e);
        } catch (Exception e) {
            log.error("Failed to generate image for meal: {}", mealName, e);
            throw new AIGenerationException("Failed to generate image: " + e.getMessage(), e);
        }
    }

    /**
     * Fetches a response from the OpenAI chat API.
     *
     * @param promptText The prompt text to send to the API
     * @return The response content from the API
     */
    private String fetchAIResponse(final String promptText) {
        Prompt prompt = new Prompt(promptText,
                OpenAiChatOptions.builder()
                        .withModel(chatModel)
                        .withTemperature(temperature)
                        .withMaxTokens(maxTokens)
                        .build()
        );

        ChatResponse response = chatClient.call(prompt);
        return response.getResult().getOutput().getContent();
    }

    /**
     * Parses JSON content from a string, cleaning up any markdown formatting.
     *
     * @param content The content to parse
     * @return JsonNode representing the parsed content
     * @throws Exception if parsing fails
     */
    private JsonNode parseJsonContent(final String content) throws Exception {
        String cleanedContent = content.replaceAll("```json\\s*|```\\s*$", "").trim();
        return objectMapper.readTree(cleanedContent);
    }
}
