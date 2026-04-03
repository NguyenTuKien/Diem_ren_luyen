package ct01.unipoint.backend.dao;

import ct01.unipoint.backend.entity.SemesterEntity;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SemesterDao extends JpaRepository<SemesterEntity, Long> {

  Optional<SemesterEntity> findFirstByIsActiveTrueOrderByStartDateDesc();

  Optional<SemesterEntity> findByName(String name);

  Optional<SemesterEntity> findFirstByIsActiveTrueOrderByStartDateDesc();
}
