package dev.idachev.backend.web.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Nutritional information of the dish.")
public record NutritionalInformation(
        @Schema(description = "Calories in the dish.", example = "350") int calories,

        @Schema(description = "Protein content.", example = "40g") String protein,

        @Schema(description = "Carbohydrates content.", example = "5g") String carbohydrates,

        @Schema(description = "Fat content.", example = "18g") String fat) {
}
