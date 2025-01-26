package dev.idachev.backend.web;

import dev.idachev.backend.recipe.service.RecipeService;
import dev.idachev.backend.web.dto.GenerateMealRequest;
import dev.idachev.backend.web.dto.GeneratedMealResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/recipes")
public class RecipeController {

    private final RecipeService recipeService;

    @Autowired
    public RecipeController(RecipeService recipeService) {
        this.recipeService = recipeService;
    }

    @PostMapping("/generate-meal")
    public ResponseEntity<GeneratedMealResponse> generateMealFromIngredients(
            @Valid @RequestBody GenerateMealRequest request
    ) {
        GeneratedMealResponse generatedMeal = recipeService.generateMeal(request.getIngredients());
        return ResponseEntity.ok(generatedMeal);
    }
}
