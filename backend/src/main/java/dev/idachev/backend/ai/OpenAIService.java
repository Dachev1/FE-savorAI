package dev.idachev.backend.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import dev.idachev.backend.exception.AIGenerationException;
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

@Slf4j
@Service
public class OpenAIService {

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
    public OpenAIService(final OpenAiChatClient chatClient, final OpenAiImageClient imageClient, final ObjectMapper objectMapper) {
        this.chatClient = chatClient;
        this.imageClient = imageClient;
        this.objectMapper = objectMapper;
    }

    public JsonNode generateRecipeJson(final List<String> ingredients) {

        try {

            String promptText = String.format(PromptTemplates.RECIPE_PROMPT, String.join(", ", ingredients));
            String responseContent = fetchAIResponse(promptText);

            return parseJsonContent(responseContent);
        } catch (Exception e) {

            log.error("Failed to generate recipe JSON for ingredients: {}", ingredients, e);

            throw new AIGenerationException("Failed to generate recipe. Please try again later.", e);
        }
    }

    /**
     * Generates a recipe image synchronously and blocks until the image is generated.
     */
    public String generateRecipeImage(final String mealName) {

        try {
            String imagePromptText = String.format("Professional food photography of %s, on a beautiful plate, restaurant quality, high resolution", mealName);

            return imageClient.call(new ImagePrompt(
                            imagePromptText,
                            OpenAiImageOptions.builder()
                                    .withModel(imageModel)
                                    .withQuality(imageQuality)
                                    .withWidth(width)
                                    .withHeight(height)
                                    .build()))
                    .getResult().getOutput().getUrl();

        } catch (Exception e) {

            log.error("Failed to generate image for meal: {}", mealName, e);

            throw new AIGenerationException("Failed to generate image: " + e.getMessage(), e);
        }
    }

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

    private JsonNode parseJsonContent(final String content) throws Exception {

        String cleanedContent = content.replaceAll("```json\\s*|```\\s*$", "").trim();

        return objectMapper.readTree(cleanedContent);
    }
}
