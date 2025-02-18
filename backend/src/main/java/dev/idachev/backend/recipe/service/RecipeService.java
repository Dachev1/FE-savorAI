package dev.idachev.backend.recipe.service;

import dev.idachev.backend.cloudinary.CloudinaryService;
import dev.idachev.backend.exception.InvalidIngredientsException;
import dev.idachev.backend.exception.RecipeNotFoundException;
import dev.idachev.backend.macros.model.Macros;
import dev.idachev.backend.macros.service.MacrosService;
import dev.idachev.backend.recipe.model.Recipe;
import dev.idachev.backend.recipe.repository.RecipeRepository;
import dev.idachev.backend.util.OpenAIClient;
import dev.idachev.backend.web.dto.GeneratedMealResponse;
import dev.idachev.backend.web.dto.RecipeRequest;
import dev.idachev.backend.web.dto.RecipeResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
@Slf4j
public class RecipeService {

    private static final Pattern INGREDIENT_PATTERN = Pattern.compile(RecipeServiceConstants.VALID_INGREDIENT_REGEX);

    private final OpenAIClient openAIClient;
    private final RecipeResponseParser recipeResponseParser;
    private final RecipeRepository recipeRepository;
    private final CloudinaryService cloudinaryService;
    private final MacrosService macrosService;

    @Autowired
    public RecipeService(OpenAIClient openAIClient,
                         RecipeResponseParser recipeResponseParser,
                         RecipeRepository recipeRepository,
                         CloudinaryService cloudinaryService,
                         MacrosService macrosService) {
        this.openAIClient = openAIClient;
        this.recipeResponseParser = recipeResponseParser;
        this.recipeRepository = recipeRepository;
        this.cloudinaryService = cloudinaryService;
        this.macrosService = macrosService;
    }

    /**
     * Generates a meal recipe based on a list of ingredients.
     */
    public GeneratedMealResponse generateMeal(List<String> ingredients) {
        log.debug("Generating meal for ingredients: {}", ingredients);
        validateIngredients(ingredients);

        String recipePrompt = buildRecipePrompt(ingredients);
        String recipeResponse = openAIClient.getMealSuggestion(recipePrompt);
        GeneratedMealResponse mealResponse = recipeResponseParser.parseRecipeResponse(recipeResponse, ingredients);
        String imageUrl = generateMealImage(mealResponse.mealName());

        return buildFinalResponse(mealResponse, imageUrl);
    }

    /**
     * Creates a new recipe.
     */
    public RecipeResponse createRecipe(RecipeRequest request, MultipartFile imageFile) {
        validateIngredients(request.ingredientsUsed());
        String imageUrl = processImageFile(imageFile);

        Recipe recipe = Recipe.builder()
                .title(request.mealName())
                .description(request.recipeDetails())
                .ingredients(request.ingredientsUsed())
                .imageUrl(imageUrl)
                .aiGenerated(false)
                .build();

        if (request.macros() != null) {
            Macros macros = macrosService.createMacros(request.macros(), recipe);
            recipe.setMacros(macros);
        }

        Recipe savedRecipe = recipeRepository.save(recipe);
        return buildRecipeResponse(savedRecipe);
    }

    /**
     * Updates an existing recipe.
     */
    public RecipeResponse updateRecipe(UUID id, RecipeRequest request, MultipartFile imageFile) {
        validateIngredients(request.ingredientsUsed());
        Recipe recipe = recipeRepository.findById(id)
                .orElseThrow(() -> new RecipeNotFoundException("Recipe not found with id: " + id));

        log.info("Updating recipe with id: {}", id);
        recipe.setTitle(request.mealName());
        recipe.setDescription(request.recipeDetails());
        recipe.setIngredients(request.ingredientsUsed());

        if (imageFile != null && !imageFile.isEmpty()) {
            String imageUrl = processImageFile(imageFile);
            recipe.setImageUrl(imageUrl);
        }

        if (request.macros() != null) {
            if (recipe.getMacros() != null) {
                Macros updatedMacros = macrosService.updateMacros(recipe.getMacros(), request.macros());
                recipe.setMacros(updatedMacros);
            } else {
                Macros newMacros = macrosService.createMacros(request.macros(), recipe);
                recipe.setMacros(newMacros);
            }
        }

        Recipe updatedRecipe = recipeRepository.save(recipe);
        return buildRecipeResponse(updatedRecipe);
    }

    /**
     * Retrieves a recipe by ID and builds the response.
     */
    public RecipeResponse findByIdAndBuildRecipeResponse(UUID id) {
        Recipe recipe = recipeRepository.findById(id)
                .orElseThrow(() -> new RecipeNotFoundException("Recipe not found with id: " + id));
        return buildRecipeResponse(recipe);
    }

    // Validate ingredients list and each ingredient format.
    private void validateIngredients(List<String> ingredients) {
        if (ingredients == null || ingredients.isEmpty()) {
            log.warn("Ingredients list is empty.");
            throw new InvalidIngredientsException(RecipeServiceConstants.INVALID_INGREDIENTS_MESSAGE);
        }
        ingredients.forEach(this::validateIngredientFormat);
    }

    private void validateIngredientFormat(String ingredient) {
        if (ingredient == null || ingredient.isBlank()) {
            log.warn("Ingredient is null or blank.");
            throw new InvalidIngredientsException(RecipeServiceConstants.INVALID_INGREDIENTS_MESSAGE);
        }
        if (!INGREDIENT_PATTERN.matcher(ingredient).matches()) {
            log.warn("Invalid ingredient format: {}", ingredient);
            throw new InvalidIngredientsException(
                    String.format(RecipeServiceConstants.INVALID_INGREDIENT_FORMAT, ingredient)
            );
        }
    }

    private String buildRecipePrompt(List<String> ingredients) {
        return String.format(RecipeServiceConstants.RECIPE_PROMPT_TEMPLATE, String.join(", ", ingredients));
    }

    private String generateMealImage(String mealName) {
        if (mealName == null || mealName.isBlank()) {
            log.warn("Missing meal name for image generation.");
            return null;
        }
        String sanitizedMealName = sanitizeMealName(mealName);
        String imagePrompt = String.format(RecipeServiceConstants.IMAGE_PROMPT_FORMAT, sanitizedMealName);
        log.debug("Generating image with prompt: {}", imagePrompt);

        String imageResponse = openAIClient.generateImage(imagePrompt);
        return recipeResponseParser.parseImageResponse(imageResponse);
    }

    private String sanitizeMealName(String mealName) {
        return mealName.replaceAll("[^a-zA-Z0-9\\s-]", "").trim();
    }

    private GeneratedMealResponse buildFinalResponse(GeneratedMealResponse mealResponse, String imageUrl) {
        return new GeneratedMealResponse(
                mealResponse.mealName(),
                mealResponse.ingredientsUsed(),
                mealResponse.recipeDetails(),
                imageUrl
        );
    }

    private String processImageFile(MultipartFile imageFile) {
        return (imageFile != null && !imageFile.isEmpty())
                ? cloudinaryService.uploadImage(imageFile)
                : null;
    }

    private RecipeResponse buildRecipeResponse(Recipe savedRecipe) {
        return new RecipeResponse(
                savedRecipe.getId(),
                savedRecipe.getTitle(),
                savedRecipe.getIngredients(),
                savedRecipe.getDescription(),
                savedRecipe.getImageUrl(),
                savedRecipe.isAiGenerated()
        );
    }
}
