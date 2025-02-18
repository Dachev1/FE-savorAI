package dev.idachev.backend.recipe.model;

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
public class Recipe {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @ElementCollection
    @CollectionTable(name = "recipe_ingredients", joinColumns = @JoinColumn(name = "recipe_id"))
    @Column(name = "ingredient")
    private List<String> ingredients = new ArrayList<>();

    private boolean aiGenerated;

    private String imageUrl;

    @ManyToOne
    @JoinColumn(name = "created_by")
    private User createdBy;

    @OneToOne(mappedBy = "recipe", cascade = CascadeType.ALL)
    private Macros macros;

    @ManyToMany
    @JoinTable(
            name = "recipe_allergens",
            joinColumns = @JoinColumn(name = "recipe_id"),
            inverseJoinColumns = @JoinColumn(name = "allergen_id")
    )
    private Set<Allergen> allergies = new HashSet<>();
}
