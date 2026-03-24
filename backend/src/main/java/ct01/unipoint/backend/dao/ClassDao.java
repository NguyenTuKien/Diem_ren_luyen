package ct01.unipoint.backend.dao;

import ct01.unipoint.backend.entity.ClassEntity;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ClassDao extends JpaRepository<ClassEntity, Long> {
  Optional<ClassEntity> findByClassCode(String classCode);
}

