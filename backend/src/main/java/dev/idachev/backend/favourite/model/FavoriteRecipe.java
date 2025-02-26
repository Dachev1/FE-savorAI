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
@Table(name = "favorite_recipes", 
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "recipe_id"}))
public class FavoriteRecipe {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipe_id", nullable = false)
    private Recipe recipe;

    @ElementCollection
    private List<String> customIngredients = new ArrayList<>();
}
