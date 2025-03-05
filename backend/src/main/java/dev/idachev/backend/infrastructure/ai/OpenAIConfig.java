package dev.idachev.backend.infrastructure.ai;

import org.springframework.ai.openai.OpenAiChatClient;
import org.springframework.ai.openai.OpenAiImageClient;
import org.springframework.ai.openai.api.OpenAiApi;
import org.springframework.ai.openai.api.OpenAiImageApi;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenAIConfig {

    @Value("${spring.ai.openai.api-key}")
    private String apiKey;

    @Bean
    public OpenAiApi openAiApi() {
        return new OpenAiApi(apiKey);
    }

    @Bean
    public OpenAiImageApi openAiImageApi() {
        return new OpenAiImageApi(apiKey);
    }

    @Bean
    public OpenAiChatClient openAiChatClient(final OpenAiApi openAiApi) {
        return new OpenAiChatClient(openAiApi);
    }

    @Bean
    public OpenAiImageClient openAiImageClient(final OpenAiImageApi openAiImageApi) {
        return new OpenAiImageClient(openAiImageApi);
    }
}
