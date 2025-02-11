package dev.idachev.backend.macros.service;

import dev.idachev.backend.macros.model.Macros;
import dev.idachev.backend.recipe.model.Recipe;
import dev.idachev.backend.web.dto.MacrosData;
import org.springframework.stereotype.Service;

@Service
public class MacrosService {

    public Macros createMacros(MacrosData macros, Recipe recipe) {

        if (macros == null) {
            return null;
        }
        return Macros.builder()
                .calories(macros.calories())
                .protein(macros.protein())
                .carbs(macros.carbs())
                .fat(macros.fat())
                .recipe(recipe)
                .build();
    }
}
