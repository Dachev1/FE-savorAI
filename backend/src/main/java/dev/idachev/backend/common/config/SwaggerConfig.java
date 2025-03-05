package dev.idachev.backend.common.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.ExternalDocumentation;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * Configuration for Swagger/OpenAPI documentation.
 */
@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI savorAiOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("SavorAI API")
                        .description("API documentation for SavorAI meal generation service. " +
                                "This service provides endpoints for generating recipes based on ingredients " +
                                "and managing user recipes.")
                        .version("v1.0")
                        .contact(new Contact()
                                .name("SavorAI Team")
                                .email("contact@savorai.com"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")))
                .servers(List.of(
                        new Server()
                                .url("/")
                                .description("Default Server URL")))
                .components(new Components()
                        .addSecuritySchemes("bearer-jwt", 
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("JWT Authorization header using the Bearer scheme.")))
                .externalDocs(new ExternalDocumentation()
                        .description("Project Repository")
                        .url("https://github.com/Dachev1/savorAI"));
    }
}
