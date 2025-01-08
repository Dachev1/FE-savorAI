package dev.idachev.backend.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.ClientResponse;

import java.time.Duration;
import java.util.Map;

@Component
public class OpenAIClient {

    private final WebClient webClient;

    public OpenAIClient(@Value("${openai.api.key}") String apiKey) {
        this.webClient = WebClient.builder()
                .baseUrl("https://api.openai.com/v1/completions")
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    public String getMealSuggestion(String prompt) {
        Map<String, Object> requestBody = Map.of(
                "model", "text-davinci-003",
                "prompt", prompt,
                "max_tokens", 1000,
                "temperature", 0.7
        );

        try {
            return this.webClient.post()
                    .bodyValue(requestBody)
                    .retrieve()
                    .onStatus(
                            HttpStatusCode::is4xxClientError,
                            ClientResponse::createException
                    )
                    .onStatus(
                            HttpStatusCode::is5xxServerError,
                            ClientResponse::createException
                    )
                    .bodyToMono(String.class)
                    .timeout(Duration.ofSeconds(10))
                    .block();
        } catch (Exception e) {
            throw new RuntimeException("Error fetching meal suggestion: " + e.getMessage(), e);
        }
    }
}
