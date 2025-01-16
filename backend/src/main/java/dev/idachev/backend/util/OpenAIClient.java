package dev.idachev.backend.util;

import dev.idachev.backend.util.property.OpenAIClientProperty;
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

    private final WebClient webClient;
    private final Duration requestTimeout;
    private final String chatCompletionUrl;
    private final String imageGenerationUrl;
    private final String systemMessage;

    public OpenAIClient(final OpenAIClientProperty property) {
        Objects.requireNonNull(property, "OpenAIClientProperty cannot be null.");
        Objects.requireNonNull(property.getApiKey(), "OpenAI API key is missing. Please configure it in application.yml or environment variables.");

        if (property.getApiKey().isBlank()) {
            throw new IllegalArgumentException("OpenAI API key is blank. Please configure it in application.yml.");
        }

        this.webClient = WebClient.builder()
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + property.getApiKey())
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();

        this.requestTimeout = Duration.ofSeconds(property.getApiTimeout());
        this.chatCompletionUrl = property.getBaseUrl();
        this.imageGenerationUrl = property.getImageGenerationUrl();
        this.systemMessage = property.getSystemMessage();
    }

    public String getMealSuggestion(final String prompt) {
        Map<String, Object> chatRequest = buildChatCompletionRequest(prompt);
        return performPostRequest(chatCompletionUrl, chatRequest, "Error fetching meal suggestion");
    }

    public String generateImage(final String prompt) {
        Map<String, Object> imageRequest = Map.of(
                "prompt", prompt,
                "n", 1,
                "size", "256x256"
        );
        return performPostRequest(imageGenerationUrl, imageRequest, "Error generating image");
    }

    private Map<String, Object> buildChatCompletionRequest(final String prompt) {
        return Map.of(
                "model", "gpt-4",
                "messages", List.of(
                        Map.of("role", "system", "content", systemMessage),
                        Map.of("role", "user", "content", prompt)
                ),
                "max_tokens", 2000,
                "temperature", 1.0,
                "top_p", 0.9,
                "n", 1
        );
    }

    private String performPostRequest(final String url, final Map<String, Object> requestBody, final String errorMessage) {
        try {
            return webClient.post()
                    .uri(url)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(requestTimeout)
                    .block();
        } catch (WebClientResponseException e) {
            System.err.printf("API Error - Status: %d, Body: %s%n", e.getRawStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException(
                    String.format("%s - Status: %d, Body: %s", errorMessage, e.getRawStatusCode(), e.getResponseBodyAsString()),
                    e
            );
        } catch (Exception e) {
            throw new RuntimeException(errorMessage + ": " + e.getMessage(), e);
        }
    }
}
