package dev.idachev.backend.web;

import dev.idachev.backend.recipe.model.Recipe;
import dev.idachev.backend.recipe.service.RecipeService;
import dev.idachev.backend.web.dto.GenerateMealRequest;
import dev.idachev.backend.web.dto.GeneratedMealResponse;
import dev.idachev.backend.web.dto.RecipeRequest;
import dev.idachev.backend.web.dto.RecipeResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/recipes")
@Slf4j
public class RecipeController {

    private final RecipeService recipeService;

    @Autowired
    public RecipeController(RecipeService recipeService) {
        this.recipeService = recipeService;
    }


    @PostMapping("/generate-meal")
    @Operation(summary = "Generate a meal recipe based on ingredients",
            responses = {
                    @ApiResponse(responseCode = "201", description = "Meal generated successfully"),
                    @ApiResponse(responseCode = "400", description = "Invalid input")
            })
    public ResponseEntity<GeneratedMealResponse> generateMeal(@Valid @RequestBody GenerateMealRequest request) {

        log.info("Received request to generate meal with ingredients: {}", request.ingredients());

        GeneratedMealResponse response = recipeService.generateMeal(request.ingredients());
        // after creating to show to new post of the user
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }


    @PostMapping(value = "/create-meal", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Create a new recipe",
            responses = {
                    @ApiResponse(responseCode = "201", description = "Recipe created successfully"),
                    @ApiResponse(responseCode = "400", description = "Invalid input")
            })
    public ResponseEntity<RecipeResponse> createRecipe(@RequestPart("request") @Valid RecipeRequest request,
                                                       @RequestPart(value = "image", required = false) MultipartFile imageFile) {

        log.info("Received request to create recipe: {}", request);

        RecipeResponse response = recipeService.createRecipe(request, imageFile);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
}
