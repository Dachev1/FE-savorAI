package dev.idachev.backend.аllergen.repository;

import dev.idachev.backend.аllergen.model.Allergen;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface AllergyRepository extends JpaRepository<Allergen, UUID> {
}
