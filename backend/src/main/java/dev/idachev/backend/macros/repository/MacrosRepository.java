package dev.idachev.backend.macros.repository;


import dev.idachev.backend.macros.model.Macros;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface MacrosRepository extends JpaRepository<Macros, UUID> {

}
