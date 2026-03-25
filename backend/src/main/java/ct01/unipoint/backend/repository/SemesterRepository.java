package ct01.unipoint.backend.repository;

import ct01.unipoint.backend.entity.SemesterEntity;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SemesterRepository extends JpaRepository<SemesterEntity, Long> {

  Optional<SemesterEntity> findFirstByIsActiveTrueOrderByStartDateDesc();
}
