package dev.idachev.backend.recipe.service;

import dev.idachev.backend.exception.InvalidIngredientsException;
import dev.idachev.backend.recipe.model.Recipe;
import dev.idachev.backend.recipe.repository.RecipeRepository;
import dev.idachev.backend.util.OpenAIClient;
import dev.idachev.backend.web.dto.GeneratedMealResponse;
import dev.idachev.backend.web.dto.RecipeRequest;
import dev.idachev.backend.web.dto.RecipeResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.regex.Pattern;

@Service
public class RecipeService {
    private static final Logger LOGGER = LoggerFactory.getLogger(RecipeService.class);
    private static final Pattern INGREDIENT_PATTERN = Pattern.compile(RecipeServiceConstants.VALID_INGREDIENT_REGEX);

    private final OpenAIClient openAIClient;
    private final RecipeResponseParser recipeResponseParser;
    private final RecipeRepository recipeRepository;

    @Autowired
    public RecipeService(OpenAIClient openAIClient, RecipeResponseParser recipeResponseParser, RecipeRepository recipeRepository) {
        this.openAIClient = openAIClient;
        this.recipeResponseParser = recipeResponseParser;
        this.recipeRepository = recipeRepository;
    }

    public GeneratedMealResponse generateMeal(List<String> ingredients) {
        LOGGER.debug("Generating meal for ingredients: {}", ingredients);
        validateIngredients(ingredients);

        // Step 1: Generate Recipe
        String recipePrompt = buildRecipePrompt(ingredients);
        String recipeResponse = openAIClient.getMealSuggestion(recipePrompt);
        GeneratedMealResponse mealResponse = recipeResponseParser.parseRecipeResponse(recipeResponse, ingredients);

        // Step 2: Generate Image based on meal name
        String imageUrl = generateMealImage(mealResponse.mealName());

        // Step 3: Update mealResponse with imageUrl
        return buildFinalResponse(mealResponse, imageUrl);
    }

    public RecipeResponse createRecipe(RecipeRequest request) {

        LOGGER.debug("Creating recipe for request: {}", request);

        // Validate ingredients
        validateIngredients(request.ingredientsUsed());

        Recipe createdRecipe = Recipe.builder()
                .title(request.mealName())
                .description(request.recipeDetails())
                .ingredients(request.ingredientsUsed())
                .aiGenerated(false) // This is a user-created recipe
                .imageUrl(request.imageUrl()) // Cam be null
                .build();

        Recipe savedRecipe = recipeRepository.save(createdRecipe);

        LOGGER.info("Recipe created with id: {}", savedRecipe.getId());

        return new RecipeResponse(
                savedRecipe.getId(),
                savedRecipe.getTitle(),
                savedRecipe.getIngredients(),
                savedRecipe.getDescription(),
                savedRecipe.getImageUrl(),
                savedRecipe.isAiGenerated()
        );
    }

    /**
     * Validates the list of ingredients.
     *
     * @param ingredients list of ingredients
     */
    private void validateIngredients(List<String> ingredients) {
        if (ingredients == null || ingredients.isEmpty()) {
            LOGGER.warn("Validation failed: Ingredients list is empty.");
            throw new InvalidIngredientsException(RecipeServiceConstants.INVALID_INGREDIENTS_MESSAGE);
        }

        ingredients.forEach(this::validateIngredientFormat);
    }

    /**
     * Validates the format of a single ingredient.
     *
     * @param ingredient the ingredient to validate
     */
    private void validateIngredientFormat(String ingredient) {
        if (ingredient == null || ingredient.isBlank()) {
            LOGGER.warn("Validation failed: Ingredient is null or blank.");
            throw new InvalidIngredientsException(RecipeServiceConstants.INVALID_INGREDIENTS_MESSAGE);
        }
        if (!INGREDIENT_PATTERN.matcher(ingredient).matches()) {
            LOGGER.warn("Validation failed: Invalid ingredient format - {}", ingredient);
            throw new InvalidIngredientsException(
                    String.format(RecipeServiceConstants.INVALID_INGREDIENT_FORMAT, ingredient)
            );
        }
    }

    /**
     * Builds the prompt for recipe generation.
     *
     * @param ingredients list of ingredients
     * @return formatted prompt string
     */
    private String buildRecipePrompt(List<String> ingredients) {
        return String.format(
                RecipeServiceConstants.RECIPE_PROMPT_TEMPLATE,
                String.join(", ", ingredients)
        );
    }

    /**
     * Generates an image URL for the meal based on the meal name.
     *
     * @param mealName the name of the meal
     * @return image URL
     */
    private String generateMealImage(String mealName) {
        if (mealName == null || mealName.isBlank()) {
            LOGGER.warn("Missing meal name for image generation.");
            return null;
        }

        String sanitizedMealName = sanitizeMealName(mealName);
        String imagePrompt = String.format(RecipeServiceConstants.IMAGE_PROMPT_FORMAT, sanitizedMealName);
        LOGGER.debug("Generating image with prompt: {}", imagePrompt);

        String imageResponse = openAIClient.generateImage(imagePrompt);
        return recipeResponseParser.parseImageResponse(imageResponse);
    }

    /**
     * Sanitizes the meal name by removing unwanted characters.
     *
     * @param mealName the original meal name
     * @return sanitized meal name
     */
    private String sanitizeMealName(String mealName) {
        return mealName.replaceAll("[^a-zA-Z0-9\\s-]", "").trim();
    }

    /**
     * Constructs the final response by combining meal details and image URL.
     *
     * @param mealResponse the initial meal response
     * @param imageUrl     the generated image URL
     * @return the final meal response
     */
    private GeneratedMealResponse buildFinalResponse(GeneratedMealResponse mealResponse, String imageUrl) {
        return new GeneratedMealResponse(
                mealResponse.mealName(),
                mealResponse.ingredientsUsed(),
                mealResponse.recipeDetails(),
                imageUrl
        );
    }
}
