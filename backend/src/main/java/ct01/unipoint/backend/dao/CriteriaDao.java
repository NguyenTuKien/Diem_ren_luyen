package ct01.unipoint.backend.dao;

import ct01.unipoint.backend.entity.CriteriaEntity;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CriteriaDao extends JpaRepository<CriteriaEntity, Long> {
  Optional<CriteriaEntity> findByCode(String code);
}
