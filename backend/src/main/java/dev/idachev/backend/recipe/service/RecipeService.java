package dev.idachev.backend.recipe.service;

import com.fasterxml.jackson.databind.JsonNode;
import dev.idachev.backend.infrastructure.ai.OpenAIService;
import dev.idachev.backend.infrastructure.storage.CloudinaryService;
import dev.idachev.backend.common.exception.AIGenerationException;
import dev.idachev.backend.common.exception.InvalidIngredientsException;
import dev.idachev.backend.common.exception.RecipeNotFoundException;
import dev.idachev.backend.macros.model.Macros;
import dev.idachev.backend.macros.repository.MacrosRepository;
import dev.idachev.backend.macros.service.MacrosService;
import dev.idachev.backend.macros.dto.MacrosData;
import dev.idachev.backend.recipe.model.Recipe;
import dev.idachev.backend.recipe.repository.RecipeRepository;
import dev.idachev.backend.recipe.dto.GeneratedMealResponse;
import dev.idachev.backend.recipe.dto.RecipeRequest;
import dev.idachev.backend.recipe.dto.RecipeResponse;
import dev.idachev.backend.user.repository.UserRepository;
import dev.idachev.backend.common.mapper.RecipeMapper;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * Service for managing recipes, including generation, creation, updating, and retrieval.
 */
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
    private final UserRepository userRepository;

    @Autowired
    public RecipeService(
            RecipeRepository recipeRepository,
            CloudinaryService cloudinaryService,
            OpenAIService openAIService,
            RecipeMapper recipeMapper,
            MacrosService macrosService,
            MacrosRepository macrosRepository,
            UserRepository userRepository) {
        this.recipeRepository = recipeRepository;
        this.cloudinaryService = cloudinaryService;
        this.openAIService = openAIService;
        this.recipeMapper = recipeMapper;
        this.macrosService = macrosService;
        this.macrosRepository = macrosRepository;
        this.userRepository = userRepository;
    }

    /**
     * Generates a meal recipe based on the provided ingredients.
     *
     * @param ingredients List of ingredients to use in the recipe
     * @return GeneratedMealResponse containing the generated recipe
     * @throws InvalidIngredientsException if the ingredients are invalid
     * @throws AIGenerationException if recipe generation fails
     */
    public GeneratedMealResponse generateMeal(List<String> ingredients) {
        log.info("Generating meal with ingredients: {}", ingredients);
        validateIngredients(ingredients);

        JsonNode recipeJson = openAIService.generateRecipeJson(ingredients);
        String mealName = recipeJson.get("mealName").asText();
        String imageUrl = generateAndUploadImage(mealName);

        return recipeMapper.toGeneratedMealResponse(recipeJson, ingredients, imageUrl);
    }

    /**
     * Finds a recipe by ID and builds a response.
     *
     * @param id Recipe ID
     * @return RecipeResponse containing the recipe details
     * @throws RecipeNotFoundException if the recipe is not found
     */
    public RecipeResponse findByIdAndBuildRecipeResponse(UUID id) {
        log.info("Finding recipe with ID: {}", id);
        Recipe recipe = recipeRepository.findById(id)
                .orElseThrow(() -> new RecipeNotFoundException("Recipe not found with id: " + id));

        return buildRecipeResponseWithMacros(recipe);
    }

    /**
     * Updates an existing recipe.
     *
     * @param id Recipe ID
     * @param request Recipe update request
     * @param imageFile Optional new image file
     * @return RecipeResponse containing the updated recipe details
     * @throws RecipeNotFoundException if the recipe is not found
     */
    @Transactional
    public RecipeResponse updateRecipe(UUID id, @Valid RecipeRequest request, MultipartFile imageFile) {
        log.info("Updating recipe with ID: {}", id);
        Recipe recipe = recipeRepository.findById(id)
                .orElseThrow(() -> new RecipeNotFoundException("Recipe not found with id: " + id));

        validateIngredients(request.ingredientsUsed());

        recipe.setTitle(request.mealName());
        recipe.setDescription(request.recipeDetails());
        recipe.setIngredients(request.ingredientsUsed());
        recipe.setPrepTimeMinutes(request.prepTimeMinutes());

        if (imageFile != null && !imageFile.isEmpty()) {
            String imageUrl = cloudinaryService.uploadImage(imageFile);
            recipe.setImageUrl(imageUrl);
        }

        // Handle macros update
        updateRecipeMacros(recipe, request.macros());

        Recipe updatedRecipe = recipeRepository.save(recipe);
        return buildRecipeResponseWithMacros(updatedRecipe);
    }

    /**
     * Creates a new recipe.
     *
     * @param request Recipe creation request
     * @param imageFile Optional image file
     * @return RecipeResponse containing the created recipe details
     */
    @Transactional
    public RecipeResponse createRecipe(RecipeRequest request, MultipartFile imageFile) {
        log.info("Creating recipe: {}", request.mealName());
        validateIngredients(request.ingredientsUsed());

        Recipe recipe = Recipe.builder()
                .title(request.mealName())
                .description(request.recipeDetails())
                .ingredients(request.ingredientsUsed())
                .prepTimeMinutes(request.prepTimeMinutes())
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

    /**
     * Find all recipes in the system.
     *
     * @return A list of RecipeResponse objects
     */
    public List<RecipeResponse> findRecipesByCurrentUser() {
        log.info("Finding all recipes");
        List<Recipe> allRecipes = recipeRepository.findAll();
        
        return allRecipes.stream()
                .map(this::buildRecipeResponseWithMacros)
                .collect(Collectors.toList());
    }

    /**
     * Updates the macros for a recipe.
     *
     * @param recipe Recipe to update
     * @param macrosData Macros data to update with
     */
    private void updateRecipeMacros(Recipe recipe, MacrosData macrosData) {
        if (recipe.getMacros() != null) {
            if (macrosData != null) {
                // Update existing macros
                macrosService.updateMacros(recipe.getMacros(), macrosData);
            } else {
                // Remove macros if null is provided
                Macros macrosToRemove = recipe.getMacros();
                recipe.setMacros(null);
                macrosRepository.delete(macrosToRemove);
            }
        } else if (macrosData != null) {
            // Create new macros
            Macros newMacros = macrosService.createMacros(macrosData, recipe);
            recipe.setMacros(newMacros);
        }
    }

    /**
     * Validates that the ingredients list is not empty and contains valid ingredients.
     *
     * @param ingredients List of ingredients to validate
     * @throws InvalidIngredientsException if the ingredients are invalid
     */
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

    /**
     * Processes an image file by uploading it to Cloudinary.
     *
     * @param imageFile Image file to process
     * @return URL of the uploaded image
     */
    private String processImageFile(MultipartFile imageFile) {
        if (imageFile != null && !imageFile.isEmpty()) {
            log.debug("Processing image file: {}", imageFile.getOriginalFilename());
            return cloudinaryService.uploadImage(imageFile);
        }
        return null;
    }

    /**
     * Builds a recipe response with macros information.
     *
     * @param recipe Recipe entity
     * @return RecipeResponse containing the recipe details with macros
     */
    private RecipeResponse buildRecipeResponseWithMacros(Recipe recipe) {
        return recipeMapper.toRecipeResponseWithMacros(recipe);
    }

    /**
     * Generates an image for a meal and uploads it to Cloudinary.
     *
     * @param mealName Name of the meal to generate an image for
     * @return URL of the generated and uploaded image
     * @throws AIGenerationException if image generation fails
     */
    private String generateAndUploadImage(String mealName) {
        log.debug("Generating and uploading image for meal: {}", mealName);
        try {
            String imageUrl = openAIService.generateRecipeImage(mealName);
            return cloudinaryService.uploadImageFromUrl(imageUrl);
        } catch (Exception e) {
            log.error("Failed to generate image for meal: {}", mealName, e);
            throw new AIGenerationException("Failed to generate image: " + e.getMessage(), e);
        }
    }
}
