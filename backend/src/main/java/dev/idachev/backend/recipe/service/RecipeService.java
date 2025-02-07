package dev.idachev.backend.recipe.service;

import dev.idachev.backend.cloudinary.CloudinaryService;
import dev.idachev.backend.exception.InvalidIngredientsException;
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
import java.util.regex.Pattern;

@Service
@Slf4j
public class RecipeService {

    private static final Pattern INGREDIENT_PATTERN = Pattern.compile(RecipeServiceConstants.VALID_INGREDIENT_REGEX);

    private final OpenAIClient openAIClient;
    private final RecipeResponseParser recipeResponseParser;
    private final RecipeRepository recipeRepository;
    private final CloudinaryService cloudinaryService;

    @Autowired
    public RecipeService(OpenAIClient openAIClient,
                         RecipeResponseParser recipeResponseParser,
                         RecipeRepository recipeRepository,
                         CloudinaryService cloudinaryService) {
        this.openAIClient = openAIClient;
        this.recipeResponseParser = recipeResponseParser;
        this.recipeRepository = recipeRepository;
        this.cloudinaryService = cloudinaryService;
    }

    /**
     * Generates a meal suggestion based on the provided ingredients.
     *
     * @param ingredients List of ingredients.
     * @return A GeneratedMealResponse containing meal details and an image URL.
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
     * Creates and saves a recipe based on the provided request and optional image file.
     *
     * @param request   RecipeRequest containing meal details.
     * @param imageFile Optional image file for the recipe.
     * @return A RecipeResponse representing the saved recipe.
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

        Recipe savedRecipe = recipeRepository.save(recipe);
        return new RecipeResponse(
                savedRecipe.getId(),
                savedRecipe.getTitle(),
                savedRecipe.getIngredients(),
                savedRecipe.getDescription(),
                savedRecipe.getImageUrl(),
                savedRecipe.isAiGenerated()
        );
    }

    // --- Helper Methods ---

    /**
     * Validates that the ingredients list is not null, empty, and that each ingredient is well-formatted.
     *
     * @param ingredients List of ingredients.
     */
    private void validateIngredients(List<String> ingredients) {
        if (ingredients == null || ingredients.isEmpty()) {
            log.warn("Validation failed: Ingredients list is empty.");
            throw new InvalidIngredientsException(RecipeServiceConstants.INVALID_INGREDIENTS_MESSAGE);
        }
        ingredients.forEach(this::validateIngredientFormat);
    }

    /**
     * Validates the format of a single ingredient.
     *
     * @param ingredient Ingredient string.
     */
    private void validateIngredientFormat(String ingredient) {
        if (ingredient == null || ingredient.isBlank()) {
            log.warn("Validation failed: Ingredient is null or blank.");
            throw new InvalidIngredientsException(RecipeServiceConstants.INVALID_INGREDIENTS_MESSAGE);
        }
        if (!INGREDIENT_PATTERN.matcher(ingredient).matches()) {
            log.warn("Validation failed: Invalid ingredient format - {}", ingredient);
            throw new InvalidIngredientsException(
                    String.format(RecipeServiceConstants.INVALID_INGREDIENT_FORMAT, ingredient)
            );
        }
    }

    /**
     * Builds a recipe prompt using a constant template and the list of ingredients.
     *
     * @param ingredients List of ingredients.
     * @return Formatted recipe prompt string.
     */
    private String buildRecipePrompt(List<String> ingredients) {
        return String.format(
                RecipeServiceConstants.RECIPE_PROMPT_TEMPLATE,
                String.join(", ", ingredients)
        );
    }

    /**
     * Generates an image URL based on the provided meal name.
     *
     * @param mealName The name of the meal.
     * @return Generated image URL or null if the meal name is invalid.
     */
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

    /**
     * Removes unwanted characters from the meal name.
     *
     * @param mealName The original meal name.
     * @return A sanitized version of the meal name.
     */
    private String sanitizeMealName(String mealName) {
        return mealName.replaceAll("[^a-zA-Z0-9\\s-]", "").trim();
    }

    /**
     * Combines the generated meal response and image URL into the final response.
     *
     * @param mealResponse The initial generated meal response.
     * @param imageUrl     The generated image URL.
     * @return Finalized GeneratedMealResponse.
     */
    private GeneratedMealResponse buildFinalResponse(GeneratedMealResponse mealResponse, String imageUrl) {
        return new GeneratedMealResponse(
                mealResponse.mealName(),
                mealResponse.ingredientsUsed(),
                mealResponse.recipeDetails(),
                imageUrl
        );
    }

    /**
     * Processes the image file: if present and not empty, uploads the image and returns its URL.
     *
     * @param imageFile Multipart image file.
     * @return The URL of the uploaded image, or null if no file is provided.
     */
    private String processImageFile(MultipartFile imageFile) {
        if (imageFile != null && !imageFile.isEmpty()) {
            return cloudinaryService.uploadImage(imageFile);
        }
        return null;
    }
}
