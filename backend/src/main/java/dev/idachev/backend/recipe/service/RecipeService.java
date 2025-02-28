package dev.idachev.backend.recipe.service;

import com.fasterxml.jackson.databind.JsonNode;
import dev.idachev.backend.ai.OpenAIService;
import dev.idachev.backend.cloudinary.CloudinaryService;
import dev.idachev.backend.exception.AIGenerationException;
import dev.idachev.backend.exception.InvalidIngredientsException;
import dev.idachev.backend.exception.RecipeNotFoundException;
import dev.idachev.backend.macros.model.Macros;
import dev.idachev.backend.macros.repository.MacrosRepository;
import dev.idachev.backend.macros.service.MacrosService;
import dev.idachev.backend.recipe.model.Recipe;
import dev.idachev.backend.recipe.repository.RecipeRepository;
import dev.idachev.backend.web.dto.GeneratedMealResponse;
import dev.idachev.backend.web.dto.RecipeRequest;
import dev.idachev.backend.web.dto.RecipeResponse;
import dev.idachev.backend.web.mapper.RecipeMapper;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;
import java.util.regex.Pattern;

@Slf4j
@Service
public class RecipeService {

    private static final Pattern INGREDIENT_PATTERN = Pattern.compile(RecipeConstants.VALID_INGREDIENT_REGEX);

    private final RecipeRepository recipeRepository;
    private final CloudinaryService cloudinaryService;
    private final OpenAIService openAIService;
    private final RecipeMapper recipeMapper;
    private final MacrosService macrosService;
    private final MacrosRepository macrosRepository;

    @Autowired
    public RecipeService(RecipeRepository recipeRepository, CloudinaryService cloudinaryService, OpenAIService openAIService, RecipeMapper recipeMapper, MacrosService macrosService, MacrosRepository macrosRepository) {
        this.recipeRepository = recipeRepository;
        this.cloudinaryService = cloudinaryService;
        this.openAIService = openAIService;
        this.recipeMapper = recipeMapper;
        this.macrosService = macrosService;
        this.macrosRepository = macrosRepository;
    }

    public GeneratedMealResponse generateMeal(List<String> ingredients) {

        validateIngredients(ingredients);

        JsonNode recipeJson = openAIService.generateRecipeJson(ingredients);
        String mealName = recipeJson.get("mealName").asText();
        String imageUrl = generateAndUploadImage(mealName);

        return recipeMapper.toGeneratedMealResponse(recipeJson, ingredients, imageUrl);
    }

    public RecipeResponse findByIdAndBuildRecipeResponse(UUID id) {

        Recipe recipe = recipeRepository.findById(id)
                .orElseThrow(() -> new RecipeNotFoundException("Recipe not found with id: " + id));

        return buildRecipeResponseWithMacros(recipe);
    }

    @Transactional
    public RecipeResponse updateRecipe(UUID id, @Valid RecipeRequest request, MultipartFile imageFile) {

        Recipe recipe = recipeRepository.findById(id)
                .orElseThrow(() -> new RecipeNotFoundException("Recipe not found with id: " + id));

        validateIngredients(request.ingredientsUsed());

        recipe.setTitle(request.mealName());
        recipe.setDescription(request.recipeDetails());
        recipe.setIngredients(request.ingredientsUsed());

        if (imageFile != null && !imageFile.isEmpty()) {

            String imageUrl = cloudinaryService.uploadImage(imageFile);
            recipe.setImageUrl(imageUrl);
        }

        // Handle macros update
        if (recipe.getMacros() != null) {
            if (request.macros() != null) {
                // Update existing macros
                macrosService.updateMacros(recipe.getMacros(), request.macros());
            } else {
                // Remove macros if null is provided
                Macros macrosToRemove = recipe.getMacros();
                recipe.setMacros(null);
                macrosRepository.delete(macrosToRemove);
            }
        } else if (request.macros() != null) {
            // Create new macros
            Macros newMacros = macrosService.createMacros(request.macros(), recipe);
            recipe.setMacros(newMacros);
        }

        Recipe updatedRecipe = recipeRepository.save(recipe);

        return buildRecipeResponseWithMacros(updatedRecipe);
    }

    @Transactional
    public RecipeResponse createRecipe(RecipeRequest request, MultipartFile imageFile) {

        validateIngredients(request.ingredientsUsed());

        Recipe recipe = Recipe.builder()
                .title(request.mealName())
                .description(request.recipeDetails())
                .ingredients(request.ingredientsUsed())
                .imageUrl(processImageFile(imageFile))
                .aiGenerated(false)
                .build();

        // Save recipe first to get an ID
        Recipe savedRecipe = recipeRepository.save(recipe);
        
        // Handle macros creation if provided
        if (request.macros() != null) {
            Macros macros = macrosService.createMacros(request.macros(), savedRecipe);
            savedRecipe.setMacros(macros);
            savedRecipe = recipeRepository.save(savedRecipe);
        }

        return buildRecipeResponseWithMacros(savedRecipe);
    }

    private void validateIngredients(List<String> ingredients) {

        if (ingredients == null || ingredients.isEmpty()) {
            throw new InvalidIngredientsException(RecipeConstants.INVALID_INGREDIENTS_MESSAGE);
        }

        for (String ingredient : ingredients) {

            if (!INGREDIENT_PATTERN.matcher(ingredient).matches()) {

                throw new InvalidIngredientsException(
                        String.format(RecipeConstants.INVALID_INGREDIENT_FORMAT, ingredient)
                );
            }
        }
    }

    private String processImageFile(MultipartFile imageFile) {

        if (imageFile != null && !imageFile.isEmpty()) {

            return cloudinaryService.uploadImage(imageFile);
        }

        return null;
    }

    private RecipeResponse buildRecipeResponseWithMacros(Recipe recipe) {
        return recipeMapper.toRecipeResponseWithMacros(recipe);
    }

    private String generateAndUploadImage(String mealName) {

        try {
            String imageUrl = openAIService.generateRecipeImage(mealName);

            return cloudinaryService.uploadImageFromUrl(imageUrl);
        } catch (Exception e) {

            log.error("Failed to generate image for meal: {}", mealName, e);

            throw new AIGenerationException("Failed to generate image: " + e.getMessage(), e);
        }
    }
}
