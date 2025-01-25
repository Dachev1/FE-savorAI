package dev.idachev.backend.web;

import dev.idachev.backend.recipe.service.RecipeService;
import dev.idachev.backend.web.dto.GenerateMealRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/recipes")
public class RecipeController {

    private final RecipeService recipeService;

    @Autowired
    public RecipeController(RecipeService recipeService) {
        this.recipeService = recipeService;
    }

    @PostMapping("/generate-meal")
    public ResponseEntity<Map<String, Object>> generateMealFromIngredients(
            @Valid @RequestBody GenerateMealRequest request
    ) {
        Map<String, Object> generatedMeal = recipeService.generateMeal(request.ingredients());
        return ResponseEntity.ok(generatedMeal);
    }
}
