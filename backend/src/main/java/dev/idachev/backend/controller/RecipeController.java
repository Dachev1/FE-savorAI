package dev.idachev.backend.controller;

import dev.idachev.backend.service.RecipeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/recipes")
public class RecipeController {

    private final RecipeService recipeService;

    public RecipeController(RecipeService recipeService) {
        this.recipeService = recipeService;
    }

    @PostMapping("/generate-meal")
    public ResponseEntity<?> generateMeal(@RequestBody List<String> ingredients) {
        if (ingredients == null || ingredients.isEmpty()) {
            return ResponseEntity.badRequest().body("Ingredients list cannot be empty.");
        }
        return ResponseEntity.ok(recipeService.generateMeal(ingredients));
    }

}
