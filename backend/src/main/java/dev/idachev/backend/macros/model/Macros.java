package dev.idachev.backend.macros.model;

import dev.idachev.backend.recipe.model.Recipe;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

/**
 * Entity representing nutritional macros information for a recipe.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "macros")
public class Macros {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    /**
     * Total calories in the recipe.
     */
    private Integer calories;

    /**
     * Protein content in grams.
     */
    private Double protein;

    /**
     * Carbohydrate content in grams.
     */
    private Double carbs;

    /**
     * Fat content in grams.
     */
    private Double fat;

    /**
     * Recipe associated with these macros.
     */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipe_id", nullable = false)
    private Recipe recipe;
}
