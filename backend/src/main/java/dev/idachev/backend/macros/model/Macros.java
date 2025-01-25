package dev.idachev.backend.macros.model;

import dev.idachev.backend.recipe.model.Recipe;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

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

    private Double calories;

    private Double protein;

    private Double carbs;

    private Double fat;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "recipe_id", unique = true)
    private Recipe recipe;
}
