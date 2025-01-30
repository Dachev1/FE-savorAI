package dev.idachev.backend.util;

import dev.idachev.backend.util.property.OpenAIClientProperty;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
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

//    private static final Logger LOGGER = LoggerFactory.getLogger(OpenAIClient.class);

    private final WebClient webClient;
    private final Duration apiRequestTimeout;

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

    @Autowired
    public OpenAIClient(final OpenAIClientProperty property) {
        Objects.requireNonNull(property, "OpenAIClientProperty cannot be null.");
        Objects.requireNonNull(property.getApiKey(), "OpenAI API key is missing. Configure it in application.yml or environment variables.");

        if (property.getApiKey().isBlank()) {
            throw new IllegalArgumentException("OpenAI API key is blank. Configure it in application.yml or environment variables.");
        }

        this.webClient = WebClient.builder()
                .baseUrl(property.getBaseUrl())
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + property.getApiKey())
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();

        this.apiRequestTimeout = Duration.ofSeconds(property.getApiTimeout());

        this.chatCompletionApiUrl = property.getChatCompletionEndpoint();
        this.imageGenerationApiUrl = property.getImageGenerationEndpoint();
        this.systemPromptMessage = property.getSystemMessage();
        this.modelName = property.getModelName();
        this.maxTokens = property.getMaxTokens();
        this.temperature = property.getTemperature();
        this.topP = property.getTopP();
        this.choicesCount = property.getChoicesCount();

        this.imageCount = property.getImageCount();
        this.imageSize = property.getImageSize();
    }

    /**
     * Retrieves a meal suggestion based on the provided prompt.
     *
     * @param prompt the prompt for meal suggestion
     * @return the raw response from OpenAI API
     */
    public String getMealSuggestion(final String prompt) {
        Map<String, Object> requestPayload = buildChatCompletionRequest(prompt);
        String response = executePostRequest(chatCompletionApiUrl, requestPayload, "Error fetching meal suggestion");
//        LOGGER.debug("Raw OpenAI Recipe Response: {}", response); // Log the raw response
        return response;
    }

    /**
     * Generates an image based on the provided prompt.
     *
     * @param prompt the prompt for image generation
     * @return the raw response from OpenAI API
     */
    public String generateImage(final String prompt) {
        Map<String, Object> requestPayload = Map.of(
                "prompt", prompt,
                "n", imageCount,
                "size", imageSize
        );
        String response = executePostRequest(imageGenerationApiUrl, requestPayload, "Error generating image");
//        LOGGER.debug("Raw OpenAI Image Response: {}", response); // Log the raw response
        return response;
    }

    /**
     * Builds the request payload for chat completion.
     *
     * @param prompt the user prompt
     * @return a map representing the request payload
     */
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

    /**
     * Executes a POST request to the specified URL with the given payload.
     *
     * @param url          the endpoint URL
     * @param requestBody  the request payload
     * @param errorMessage the error message in case of failure
     * @return the response body as a string
     * @throws RuntimeException if the API call fails
     */
    private String executePostRequest(
            final String url,
            final Map<String, Object> requestBody,
            final String errorMessage
    ) {
        try {
//            LOGGER.debug("Sending POST request to {} with payload {}", url, requestBody);
            return webClient.post()
                    .uri(url)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(apiRequestTimeout)
                    .block();
        } catch (WebClientResponseException e) {
//            LOGGER.error("API Error - Status: {}, Body: {}", e.getRawStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException(
                    String.format("%s - Status: %d, Body: %s",
                            errorMessage,
                            e.getRawStatusCode(),
                            e.getResponseBodyAsString()
                    ),
                    e
            );
        } catch (Exception e) {
//            LOGGER.error("Unexpected error during API call", e);
            throw new RuntimeException(errorMessage + ": " + e.getMessage(), e);
        }
    }
}
