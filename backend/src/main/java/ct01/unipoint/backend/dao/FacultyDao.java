package ct01.unipoint.backend.dao;

import ct01.unipoint.backend.entity.FacultyEntity;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FacultyDao extends JpaRepository<FacultyEntity, Long> {
  Optional<FacultyEntity> findByCode(String code);
}

