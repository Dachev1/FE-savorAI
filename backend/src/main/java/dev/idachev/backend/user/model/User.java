package dev.idachev.backend.user.model;

import dev.idachev.backend.favourite.model.FavoriteRecipe;
import dev.idachev.backend.recipe.model.Recipe;
import dev.idachev.backend.аllergen.model.Allergen;
import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    private boolean isActive = true;

    private boolean emailVerified = false;

    private String avatarPath;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "user_allergies",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "allergen_id")
    )
    private Set<Allergen> allergies = new HashSet<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<FavoriteRecipe> favoriteRecipes = new HashSet<>();

    @OneToMany(mappedBy = "createdBy", cascade = CascadeType.ALL)
    private Set<Recipe> createdRecipes = new HashSet<>();
}
