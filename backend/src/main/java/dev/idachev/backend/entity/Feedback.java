package dev.idachev.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "feedbacks")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Feedback extends BaseEntity {

    @Column( nullable = false, length = 1000)
    private String message;

    @Column(nullable = false)
    private int rating; // Rating out of 5

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}
