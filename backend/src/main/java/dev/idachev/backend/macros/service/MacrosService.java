package dev.idachev.backend.macros.service;

import dev.idachev.backend.macros.model.Macros;
import dev.idachev.backend.macros.dto.MacrosData;
import dev.idachev.backend.recipe.model.Recipe;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * Service for managing nutritional macros information.
 */
@Service
@Slf4j
public class MacrosService {

    /**
     * Creates a new Macros entity from MacrosData DTO.
     *
     * @param macros MacrosData containing nutritional information
     * @param recipe Recipe to associate with the macros
     * @return New Macros entity
     */
    public Macros createMacros(MacrosData macros, Recipe recipe) {
        if (macros == null) {
            return null;
        }
        
        log.debug("Creating macros for recipe: {}", recipe.getId());
        return Macros.builder()
                .calories(macros.calories())
                .protein(macros.protein())
                .carbs(macros.carbs())
                .fat(macros.fat())
                .recipe(recipe)
                .build();
    }

    /**
     * Updates an existing Macros entity with new data.
     *
     * @param existingMacros Existing Macros entity to update
     * @param newData MacrosData containing new nutritional information
     * @return Updated Macros entity
     */
    public Macros updateMacros(Macros existingMacros, MacrosData newData) {
        if (newData == null) {
            return existingMacros;
        }

        log.debug("Updating macros for recipe: {}", existingMacros.getRecipe().getId());
        existingMacros.setCalories(newData.calories());
        existingMacros.setProtein(newData.protein());
        existingMacros.setCarbs(newData.carbs());
        existingMacros.setFat(newData.fat());
        return existingMacros;
    }
}
