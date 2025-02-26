package dev.idachev.backend.recipe.service;

import com.fasterxml.jackson.databind.JsonNode;
import dev.idachev.backend.ai.OpenAIService;
import dev.idachev.backend.cloudinary.CloudinaryService;
import dev.idachev.backend.exception.AIGenerationException;
import dev.idachev.backend.exception.InvalidIngredientsException;
import dev.idachev.backend.recipe.model.Recipe;
import dev.idachev.backend.recipe.repository.RecipeRepository;
import dev.idachev.backend.web.dto.GeneratedMealResponse;
import dev.idachev.backend.web.dto.RecipeRequest;
import dev.idachev.backend.web.dto.RecipeResponse;
import dev.idachev.backend.web.mapper.RecipeMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.regex.Pattern;

@Slf4j
@Service
public class RecipeService {

    private static final Pattern INGREDIENT_PATTERN = Pattern.compile(RecipeConstants.VALID_INGREDIENT_REGEX);

    private final RecipeRepository recipeRepository;
    private final CloudinaryService cloudinaryService;
    private final OpenAIService openAIService;
    private final RecipeMapper recipeMapper;

    @Autowired
    public RecipeService(RecipeRepository recipeRepository, CloudinaryService cloudinaryService, OpenAIService openAIService, RecipeMapper recipeMapper) {
        this.recipeRepository = recipeRepository;
        this.cloudinaryService = cloudinaryService;
        this.openAIService = openAIService;
        this.recipeMapper = recipeMapper;
    }

    public GeneratedMealResponse generateMeal(List<String> ingredients) {

        validateIngredients(ingredients);

        JsonNode recipeJson = openAIService.generateRecipeJson(ingredients);
        String mealName = recipeJson.get("mealName").asText();
        String imageUrl = generateAndUploadImage(mealName);

        return recipeMapper.toGeneratedMealResponse(recipeJson, ingredients, imageUrl);
    }

    public RecipeResponse createRecipe(RecipeRequest request, MultipartFile imageFile) {

        validateIngredients(request.ingredientsUsed());

        Recipe recipe = Recipe.builder()
                .title(request.mealName())
                .description(request.recipeDetails())
                .ingredients(request.ingredientsUsed())
                .imageUrl(processImageFile(imageFile))
                .aiGenerated(false)
                .build();
        
        return buildRecipeResponse(recipeRepository.save(recipe));
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

    private RecipeResponse buildRecipeResponse(Recipe recipe) {
        return new RecipeResponse(
                recipe.getId(),
                recipe.getTitle(),
                recipe.getIngredients(),
                recipe.getDescription(),
                recipe.getImageUrl(),
                recipe.isAiGenerated()
        );
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
