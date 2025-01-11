package dev.idachev.backend.util;

import org.springframework.beans.factory.annotation.Value;
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

    private static final String BASE_URL = "https://api.openai.com/v1/chat/completions";
    private static final String IMAGE_GENERATION_URL = "https://api.openai.com/v1/images/generations";
    private static final String SYSTEM_MESSAGE = "You are a professional chef assistant. Generate a unique recipe for each request. Provide detailed step-by-step instructions and ensure the recipe is clear, creative, and complete.";

    private final WebClient webClient;
    private final Duration timeout;

    public OpenAIClient(
            @Value("${openai.api.key}") String apiKey,
            @Value("${openai.api.timeout:15}") int timeoutInSeconds) {

        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalArgumentException("OpenAI API key is missing. Please configure it in application.yml.");
        }

        this.webClient = WebClient.builder()
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();

        this.timeout = Duration.ofSeconds(timeoutInSeconds);
    }

    public String getMealSuggestion(String prompt) {
        Map<String, Object> requestBody = createChatRequestBody(prompt);

        return executePostRequest(BASE_URL, requestBody, "Error fetching meal suggestion");
    }

    public String generateImage(String prompt) {
        Map<String, Object> requestBody = Map.of(
                "prompt", prompt,
                "n", 1,
                "size", "256x256"
        );

        return executePostRequest(IMAGE_GENERATION_URL, requestBody, "Error generating image");
    }

    private Map<String, Object> createChatRequestBody(String prompt) {
        return Map.of(
                "model", "gpt-4",
                "messages", List.of(
                        Map.of("role", "system", "content", SYSTEM_MESSAGE),
                        Map.of("role", "user", "content", prompt)
                ),
                "max_tokens", 500,
                "temperature", 1.0,
                "top_p", 0.9,
                "n", 1
        );
    }

    private String executePostRequest(String url, Map<String, Object> requestBody, String errorMessage) {
        try {
            return this.webClient.post()
                    .uri(url)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(this.timeout)
                    .block();
        } catch (WebClientResponseException e) {
            logError(e);
            throw new RuntimeException(String.format("%s - Status: %d, Body: %s",
                    errorMessage, e.getRawStatusCode(), e.getResponseBodyAsString()), e);
        } catch (Exception e) {
            throw new RuntimeException(errorMessage + ": " + e.getMessage(), e);
        }
    }

    private void logError(WebClientResponseException e) {
        System.err.printf("API Error - Status: %d, Body: %s%n", e.getRawStatusCode(), e.getResponseBodyAsString());
    }
}
