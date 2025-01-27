package dev.idachev.backend.recipe.service;

import dev.idachev.backend.exception.InvalidIngredientsException;
import dev.idachev.backend.util.OpenAIClient;
import dev.idachev.backend.web.dto.GeneratedMealResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.regex.Pattern;

@Service
public class RecipeService implements IRecipeService {

    private static final Logger LOGGER = LoggerFactory.getLogger(RecipeService.class);
    private static final Pattern VALID_INGREDIENT_PATTERN = Pattern.compile("^[a-zA-Z\\s]+$");

    private final OpenAIClient openAIClient;
    private final RecipeResponseParser recipeResponseParser;

    @Autowired
    public RecipeService(OpenAIClient openAIClient, RecipeResponseParser recipeResponseParser) {
        this.openAIClient = openAIClient;
        this.recipeResponseParser = recipeResponseParser;
    }

    /**
     * Generates a meal based on the provided list of ingredients.
     *
     * @param ingredients the list of ingredients for meal generation
     * @return a GeneratedMealResponse containing the generated meal details and image URL
     */
    @Override
    public GeneratedMealResponse generateMeal(List<String> ingredients) {
        LOGGER.info("Generating meal with ingredients: {}", ingredients);
        validateIngredients(ingredients);
        String recipePrompt = buildRecipePrompt(ingredients);

        LOGGER.debug("Recipe prompt: {}", recipePrompt);
        String recipeResponse = openAIClient.getMealSuggestion(recipePrompt);
        LOGGER.debug("Received recipe response: {}", recipeResponse);
        GeneratedMealResponse mealResponse = recipeResponseParser.parseRecipeResponse(recipeResponse, ingredients);

        String imagePrompt = buildImagePrompt(mealResponse.mealName());
        LOGGER.debug("Image prompt: {}", imagePrompt);
        String imageResponse = openAIClient.generateImage(imagePrompt);
        LOGGER.debug("Received image response: {}", imageResponse);
        String imageUrl = recipeResponseParser.extractImageUrl(imageResponse);

        LOGGER.info("Generated image URL: {}", imageUrl);
        GeneratedMealResponse finalResponse = buildGeneratedMealResponse(mealResponse, imageUrl);
        LOGGER.info("Meal generation completed: {}", finalResponse.mealName());

        return finalResponse;
    }

    private void validateIngredients(List<String> ingredients) {
        if (ingredients == null || ingredients.isEmpty()) {
            LOGGER.warn("Validation failed: Ingredients list is empty or null.");
            throw new InvalidIngredientsException(RecipeServiceConstants.INVALID_INGREDIENTS_MESSAGE);
        }

        for (String ingredient : ingredients) {
            if (ingredient == null || ingredient.trim().isEmpty()) {
                LOGGER.warn("Validation failed: Ingredient is null or empty.");
                throw new InvalidIngredientsException("Ingredient names cannot be null or empty.");
            }
            if (!VALID_INGREDIENT_PATTERN.matcher(ingredient).matches()) {
                LOGGER.warn("Validation failed: Ingredient '{}' contains invalid characters.", ingredient);
                throw new InvalidIngredientsException(
                        String.format("Ingredient '%s' contains invalid characters.", ingredient)
                );
            }
        }

        LOGGER.info("All ingredients validated successfully.");
    }

    private String buildRecipePrompt(List<String> ingredients) {
        return String.format(
                RecipeServiceConstants.RECIPE_PROMPT_TEMPLATE,
                String.join(", ", ingredients)
        );
    }

    private String buildImagePrompt(String mealName) {
        return String.format(RecipeServiceConstants.IMAGE_PROMPT_FORMAT, mealName);
    }

    private GeneratedMealResponse buildGeneratedMealResponse(GeneratedMealResponse mealResponse, String imageUrl) {
        return new GeneratedMealResponse(
                mealResponse.mealName(),
                mealResponse.ingredientsUsed(),
                mealResponse.recipeDetails(),
                imageUrl
        );
    }
}
