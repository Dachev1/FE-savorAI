package dev.idachev.backend.web;

import dev.idachev.backend.recipe.service.RecipeService;
import dev.idachev.backend.web.dto.GenerateMealRequest;
import dev.idachev.backend.web.dto.GeneratedMealResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/recipes")
public class RecipeController {

    private static final Logger LOGGER = LoggerFactory.getLogger(RecipeController.class);

    private final RecipeService recipeService;

    @Autowired
    public RecipeController(RecipeService recipeService) {
        this.recipeService = recipeService;
    }

    @Operation(summary = "Generate a meal recipe based on ingredients",
            responses = {
                    @ApiResponse(responseCode = "201", description = "Meal generated successfully"),
                    @ApiResponse(responseCode = "400", description = "Invalid input")
            })
    @PostMapping("/generate-meal")
    public ResponseEntity<GeneratedMealResponse> generateMeal(@Valid @RequestBody GenerateMealRequest request) {

        LOGGER.info("Received request to generate meal with ingredients: {}", request.ingredients());

        GeneratedMealResponse response = recipeService.generateMeal(request.ingredients());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
}
