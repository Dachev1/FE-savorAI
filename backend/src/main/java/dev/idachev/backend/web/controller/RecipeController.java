package dev.idachev.backend.web.controller;

import dev.idachev.backend.recipe.service.RecipeService;
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
    public ResponseEntity<?> generateMeal(@RequestBody Map<String, List<String>> request) {
        List<String> ingredients = request.get("ingredients");

        if (ingredients == null || ingredients.isEmpty()) {
            return ResponseEntity.badRequest().body("Ingredients list cannot be empty.");
        }

        try {
            Map<String, Object> recipe = recipeService.generateMeal(ingredients);
            return ResponseEntity.ok(recipe);
        } catch (RuntimeException e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }
}
