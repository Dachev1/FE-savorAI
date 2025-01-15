package dev.idachev.backend.feedback.model;

import dev.idachev.backend.user.model.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "feedbacks")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 1000)
    private String message;

    @Column(nullable = false)
    private int rating;

    @ManyToOne
    @JoinColumn(nullable = false)
    private User user;
}
