package dev.idachev.backend.favourite.model;

import dev.idachev.backend.recipe.model.Recipe;
import dev.idachev.backend.user.model.User;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "favorite_recipes")
public class FavoriteRecipe {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "recipe_id")
    private Recipe recipe;

    @ElementCollection
    @CollectionTable(name = "favorite_recipe_ingredients", joinColumns = @JoinColumn(name = "favorite_id"))
    @Column(name = "ingredient")
    private List<String> customIngredients = new ArrayList<>();
}
