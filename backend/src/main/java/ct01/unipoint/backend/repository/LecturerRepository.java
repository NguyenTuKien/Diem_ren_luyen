package ct01.unipoint.backend.repository;

import ct01.unipoint.backend.entity.LecturerEntity;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LecturerRepository extends JpaRepository<LecturerEntity, Long> {

  @EntityGraph(attributePaths = {"facultyEntity"})
  Optional<LecturerEntity> findByUserEntityId(Long userId);
}
