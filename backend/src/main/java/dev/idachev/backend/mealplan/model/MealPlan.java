package dev.idachev.backend.mealplan.model;

import dev.idachev.backend.user.model.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "meal_plans")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MealPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DietaryPreference dietaryPreference;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    @Column(length = 500)
    private String description;

    @ManyToOne
    @JoinColumn(nullable = false)
    private User user;
}
