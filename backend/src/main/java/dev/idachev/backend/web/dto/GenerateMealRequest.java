package dev.idachev.backend.web.dto;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public record GenerateMealRequest(
        @NotEmpty(message = "Ingredients list cannot be empty.")
        List<String> ingredients
) {}