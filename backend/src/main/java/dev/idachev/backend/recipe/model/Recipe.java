package dev.idachev.backend.recipe.model;

import dev.idachev.backend.allergy.model.Allergy;
import dev.idachev.backend.macros.model.Macros;
import dev.idachev.backend.user.model.User;
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

    @ManyToOne
    private User createdBy;

    @OneToOne(mappedBy = "recipe", cascade = CascadeType.ALL)
    private Macros macros;

    @ManyToMany
    private Set<Allergy> allergies = new HashSet<>();
}
