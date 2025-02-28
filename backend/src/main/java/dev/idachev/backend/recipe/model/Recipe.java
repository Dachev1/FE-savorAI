package dev.idachev.backend.recipe.model;

import dev.idachev.backend.favourite.model.FavoriteRecipe;
import dev.idachev.backend.macros.model.Macros;
import dev.idachev.backend.user.model.User;
import dev.idachev.backend.аllergen.model.Allergen;
import jakarta.persistence.*;
import lombok.*;

import java.util.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "recipes")
public class Recipe {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @ElementCollection
    private List<String> ingredients = new ArrayList<>();

    private boolean aiGenerated;

    private String imageUrl;

    //TODO THIS COLUMN CANNOT BE NULL(FOR NOW IS NULL FOR TESTING)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id")
    private User createdBy;

    @OneToOne(mappedBy = "recipe", cascade = CascadeType.ALL, orphanRemoval = true)
    private Macros macros;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "recipe_allergies",
            joinColumns = @JoinColumn(name = "recipe_id"),
            inverseJoinColumns = @JoinColumn(name = "allergen_id")
    )
    private Set<Allergen> allergies = new HashSet<>();

    @OneToMany(mappedBy = "recipe", cascade = CascadeType.ALL)
    private Set<FavoriteRecipe> favoritedBy = new HashSet<>();
}
