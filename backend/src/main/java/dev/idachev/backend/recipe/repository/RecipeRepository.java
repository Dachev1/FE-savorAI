package dev.idachev.backend.recipe.repository;

import dev.idachev.backend.recipe.model.Recipe;
import dev.idachev.backend.user.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RecipeRepository extends JpaRepository<Recipe, UUID> {
    List<Recipe> findByCreatedBy(User user);
}
