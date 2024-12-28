package dev.idachev.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "ingredients")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ingredient extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String name;

    @Column(name = "calories_per_100g", nullable = false)
    private double calories;

    @Column(name = "is_vegan", nullable = false)
    private boolean isVegan;
}
