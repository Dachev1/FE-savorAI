package dev.idachev.backend.web.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GeneratedMealResponse {
    private String mealName;
    private List<String> ingredientsUsed;
    private String recipeDetails;
}
