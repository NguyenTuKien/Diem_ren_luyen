package ct01.unipoint.backend.repository;

import ct01.unipoint.backend.entity.CriteriaEntity;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CriteriaRepository extends JpaRepository<CriteriaEntity, Long> {
  Optional<CriteriaEntity> findByCode(String code);
}
