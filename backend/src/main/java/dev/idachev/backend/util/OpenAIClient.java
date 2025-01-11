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
    private static final String SYSTEM_MESSAGE = "You are a professional chef assistant. Generate a unique recipe for each request. Provide detailed step-by-step instructions and ensure the recipe is clear, creative, and complete.";

    private final WebClient webClient;
    private final Duration timeout;

    public OpenAIClient(
            @Value("${openai.api.key}") String apiKey,
            @Value("${openai.api.timeout:30}") int timeoutInSeconds) {

        Objects.requireNonNull(apiKey, "OpenAI API key is missing. Please configure it in application.yml.");

        this.webClient = WebClient.builder()
                .baseUrl(BASE_URL)
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();

        this.timeout = Duration.ofSeconds(timeoutInSeconds);
    }

    public String getMealSuggestion(String prompt) {
        Map<String, Object> requestBody = Map.of(
                "model", "gpt-4",
                "messages", List.of(
                        Map.of("role", "system", "content", SYSTEM_MESSAGE),
                        Map.of("role", "user", "content", prompt)
                ),
                "max_tokens", 500, // Increased to allow detailed instructions
                "temperature", 1.0, // Increased for more creativity and variety
                "top_p", 0.9, // Ensures responses are coherent
                "n", 1 // Ensures one response is generated at a time
        );

        try {
            return this.webClient.post()
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(this.timeout)
                    .block();
        } catch (WebClientResponseException e) {
            String errorDetails = String.format("OpenAI API error - Status: %d, Body: %s",
                    e.getRawStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException(errorDetails, e);
        } catch (Exception e) {
            throw new RuntimeException("Error fetching meal suggestion: " + e.getMessage(), e);
        }
    }
}
