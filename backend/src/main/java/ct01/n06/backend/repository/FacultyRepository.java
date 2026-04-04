package ct01.n06.backend.repository;

import ct01.n06.backend.entity.FacultyEntity;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FacultyRepository extends JpaRepository<FacultyEntity, Long> {
  Optional<FacultyEntity> findByCode(String code);
}

