package dev.idachev.backend.аllergen.model;

import dev.idachev.backend.recipe.model.Recipe;
import dev.idachev.backend.user.model.User;
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
@Table(name = "allergens")
public class Allergen {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String name;

    private String description;

    @ManyToMany(mappedBy = "allergies")
    private Set<User> users = new HashSet<>();

    @ManyToMany(mappedBy = "allergies")
    private Set<Recipe> recipes = new HashSet<>();
}
