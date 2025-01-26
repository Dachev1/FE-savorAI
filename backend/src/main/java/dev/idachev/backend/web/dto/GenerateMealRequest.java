package dev.idachev.backend.web.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class GenerateMealRequest {
        @NotEmpty(message = "Ingredients list cannot be empty.")
        private List<String> ingredients;
}
