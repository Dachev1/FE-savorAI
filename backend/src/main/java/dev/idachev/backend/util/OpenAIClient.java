package dev.idachev.backend.util;

import dev.idachev.backend.util.property.OpenAIClientProperty;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Component
public class OpenAIClient {

    private static final Logger LOGGER = LoggerFactory.getLogger(OpenAIClient.class);

    private final WebClient webClient;
    private final Duration apiRequestTimeout;

    // These now come from the property object
    private final String chatCompletionApiUrl;
    private final String imageGenerationApiUrl;
    private final String systemPromptMessage;
    private final String modelName;
    private final int maxTokens;
    private final double temperature;
    private final double topP;
    private final int choicesCount;

    private final int imageCount;
    private final String imageSize;

    public OpenAIClient(final OpenAIClientProperty property) {
        Objects.requireNonNull(property, "OpenAIClientProperty cannot be null.");
        Objects.requireNonNull(property.getApiKey(), "OpenAI API key is missing. Configure it in application.yml or env variables.");

        if (property.getApiKey().isBlank()) {
            throw new IllegalArgumentException("OpenAI API key is blank. Configure it in application.yml or environment variables.");
        }

        this.webClient = WebClient.builder()
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + property.getApiKey())
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();

        this.apiRequestTimeout = Duration.ofSeconds(property.getApiTimeout());

        // Pulling in fields from your property object
        this.chatCompletionApiUrl = property.getBaseUrl();
        this.imageGenerationApiUrl = property.getImageGenerationUrl();
        this.systemPromptMessage = property.getSystemMessage();
        this.modelName = property.getModelName();
        this.maxTokens = property.getMaxTokens();
        this.temperature = property.getTemperature();
        this.topP = property.getTopP();
        this.choicesCount = property.getChoicesCount();

        this.imageCount = property.getImageCount();
        this.imageSize = property.getImageSize();
    }

    public String getMealSuggestion(final String prompt) {
        Map<String, Object> requestPayload = buildChatCompletionRequest(prompt);
        return executePostRequest(chatCompletionApiUrl, requestPayload, "Error fetching meal suggestion");
    }

    public String generateImage(final String prompt) {
        Map<String, Object> requestPayload = Map.of(
                "prompt", prompt,
                "n", imageCount,
                "size", imageSize
        );
        return executePostRequest(imageGenerationApiUrl, requestPayload, "Error generating image");
    }

    private Map<String, Object> buildChatCompletionRequest(final String prompt) {
        return Map.of(
                "model", modelName,
                "messages", List.of(
                        Map.of("role", "system", "content", systemPromptMessage),
                        Map.of("role", "user", "content", prompt)
                ),
                "max_tokens", maxTokens,
                "temperature", temperature,
                "top_p", topP,
                "n", choicesCount
        );
    }

    private String executePostRequest(
            final String url,
            final Map<String, Object> requestBody,
            final String errorMessage
    ) {
        try {
            return webClient.post()
                    .uri(url)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(apiRequestTimeout)
                    .block();
        } catch (WebClientResponseException e) {
            LOGGER.error("API Error - Status: {}, Body: {}", e.getRawStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException(
                    String.format("%s - Status: %d, Body: %s",
                            errorMessage,
                            e.getRawStatusCode(),
                            e.getResponseBodyAsString()
                    ),
                    e
            );
        } catch (Exception e) {
            throw new RuntimeException(errorMessage + ": " + e.getMessage(), e);
        }
    }
}
