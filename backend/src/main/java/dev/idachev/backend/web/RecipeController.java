package dev.idachev.backend.web;

import dev.idachev.backend.recipe.service.RecipeService;
import dev.idachev.backend.web.dto.GenerateMealRequest;
import dev.idachev.backend.web.dto.GeneratedMealResponse;
import dev.idachev.backend.web.dto.RecipeRequest;
import dev.idachev.backend.web.dto.RecipeResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
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

    public RecipeController(final RecipeService recipeService) {
        this.recipeService = recipeService;
    }

    @PostMapping("/generate-meal")
    @Operation(summary = "Generate a meal recipe based on ingredients",
            responses = {
                    @ApiResponse(responseCode = "201", description = "Meal generated successfully"),
                    @ApiResponse(responseCode = "400", description = "Invalid input")
            })
    public ResponseEntity<GeneratedMealResponse> generateMeal(@Valid @RequestBody GenerateMealRequest request) {
        GeneratedMealResponse response = recipeService.generateMeal(request.ingredients());
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
        log.info("Creating recipe: {}", request);
        RecipeResponse response = recipeService.createRecipe(request, imageFile);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * Retrieve recipe details by ID.
     */
    @GetMapping("/{id}")
    @Operation(summary = "Retrieve recipe details by ID",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Recipe retrieved successfully"),
                    @ApiResponse(responseCode = "404", description = "Recipe not found")
            })
    public ResponseEntity<RecipeResponse> getRecipe(@PathVariable UUID id) {
        log.info("Fetching recipe with id: {}", id);
        RecipeResponse recipeResponse = recipeService.findByIdAndBuildRecipeResponse(id);
        return ResponseEntity.ok(recipeResponse);
    }

    /**
     * Update an existing recipe.
     */
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Update an existing recipe",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Recipe updated successfully"),
                    @ApiResponse(responseCode = "400", description = "Invalid input"),
                    @ApiResponse(responseCode = "404", description = "Recipe not found")
            })
    public ResponseEntity<RecipeResponse> updateRecipe(@PathVariable UUID id,
                                                       @RequestPart("request") @Valid RecipeRequest request,
                                                       @RequestPart(value = "image", required = false) MultipartFile imageFile) {
        log.info("Updating recipe: {}", request);
        RecipeResponse recipeResponse = recipeService.updateRecipe(id, request, imageFile);
        return ResponseEntity.ok(recipeResponse);
    }
}
