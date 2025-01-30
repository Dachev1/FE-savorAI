package dev.idachev.backend.config;

import io.swagger.v3.oas.models.ExternalDocumentation;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI springShopOpenAPI() {
        return new OpenAPI()
                .info(new Info().title("SavorAI API")
                        .description("API documentation for SavorAI meal generation service.")
                        .version("v1.0"))
                .externalDocs(new ExternalDocumentation()
                        .description("Project Repository")
                        .url("https://github.com/Dachev1/savorAI.githttps://github.com/Dachev1/savorAI.git"));
    }
}
