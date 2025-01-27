package dev.idachev.backend.recipe.service;

import dev.idachev.backend.web.dto.GeneratedMealResponse;

import java.util.List;

public interface IRecipeService {

    GeneratedMealResponse generateMeal(List<String> ingredients);
}
