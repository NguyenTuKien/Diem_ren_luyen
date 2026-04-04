package ct01.n06.backend.repository;

import ct01.n06.backend.entity.SemesterEntity;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SemesterRepository extends JpaRepository<SemesterEntity, Long> {

  Optional<SemesterEntity> findFirstByIsActiveTrueOrderByStartDateDesc();

  Optional<SemesterEntity> findByName(String name);
}
