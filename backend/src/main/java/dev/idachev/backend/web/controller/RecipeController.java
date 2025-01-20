package dev.idachev.backend.web.controller;

import dev.idachev.backend.recipe.service.RecipeService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/recipes")
public class RecipeController {

    private final RecipeService recipeService;

    public RecipeController(RecipeService recipeService) {
        this.recipeService = recipeService;
    }

    @PostMapping("/generate-meal")
    public ResponseEntity<Map<String, Object>> generateMealFromIngredients(
            @RequestBody Map<String, List<String>> request
    ) {
        try {
            List<String> ingredients = request.get("ingredients");
            Map<String, Object> generatedMeal = recipeService.generateMeal(ingredients);
            return ResponseEntity.ok(generatedMeal);

        } catch (IllegalArgumentException e) {
            // Return a 400 for validation-related issues
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("error", e.getMessage()));

        } catch (Exception e) {
            // Catch unexpected errors
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}
