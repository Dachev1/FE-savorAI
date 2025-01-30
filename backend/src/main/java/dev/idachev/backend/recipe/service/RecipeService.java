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
public class RecipeService {
    private static final Logger LOGGER = LoggerFactory.getLogger(RecipeService.class);
    private static final Pattern INGREDIENT_PATTERN = Pattern.compile(RecipeServiceConstants.VALID_INGREDIENT_REGEX);

    private final OpenAIClient openAIClient;
    private final RecipeResponseParser recipeResponseParser;

    @Autowired
    public RecipeService(OpenAIClient openAIClient, RecipeResponseParser recipeResponseParser) {
        this.openAIClient = openAIClient;
        this.recipeResponseParser = recipeResponseParser;
    }

    public GeneratedMealResponse generateMeal(List<String> ingredients) {
        LOGGER.debug("Generating meal for ingredients: {}", ingredients);
        validateIngredients(ingredients);

        final String recipePrompt = buildRecipePrompt(ingredients);
        final String recipeResponse = openAIClient.getMealSuggestion(recipePrompt);
        final GeneratedMealResponse mealResponse = recipeResponseParser.parseRecipeResponse(recipeResponse, ingredients);

        return buildFinalResponse(mealResponse, generateMealImage(mealResponse.mealName()));
    }

    private void validateIngredients(List<String> ingredients) {
        if (ingredients == null || ingredients.isEmpty()) {
            throw new InvalidIngredientsException(RecipeServiceConstants.INVALID_INGREDIENTS_MESSAGE);
        }

        ingredients.forEach(this::validateIngredientFormat);
    }

    private void validateIngredientFormat(String ingredient) {
        if (ingredient == null || ingredient.isBlank()) {
            throw new InvalidIngredientsException(RecipeServiceConstants.INVALID_INGREDIENTS_MESSAGE);
        }
        if (!INGREDIENT_PATTERN.matcher(ingredient).matches()) {
            throw new InvalidIngredientsException(
                    String.format(RecipeServiceConstants.INVALID_INGREDIENT_FORMAT, ingredient)
            );
        }
    }

    private String generateMealImage(String mealName) {
        if (mealName == null || mealName.isBlank()) {
            LOGGER.warn("Missing meal name for image generation");
            return null;
        }

        final String sanitizedMealName = mealName.replaceAll("[^a-zA-Z0-9\\s-]", "");
        final String imagePrompt = String.format(RecipeServiceConstants.IMAGE_PROMPT_FORMAT, sanitizedMealName);

        return recipeResponseParser.extractImageUrl(openAIClient.generateImage(imagePrompt));
    }

    private String buildRecipePrompt(List<String> ingredients) {
        return String.format(
                RecipeServiceConstants.RECIPE_PROMPT_TEMPLATE,
                String.join(", ", ingredients)
        );
    }

    private GeneratedMealResponse buildFinalResponse(GeneratedMealResponse mealResponse, String imageUrl) {
        return new GeneratedMealResponse(
                mealResponse.mealName(),
                mealResponse.ingredientsUsed(),
                mealResponse.recipeDetails(),
                imageUrl
        );
    }
}