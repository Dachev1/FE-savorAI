package dev.idachev.backend.util.property;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "openai")
public class OpenAIClientProperty {
    private String apiKey;
    private int apiTimeout;
    private String baseUrl;
    private String imageGenerationUrl;
    private String systemMessage;
}
