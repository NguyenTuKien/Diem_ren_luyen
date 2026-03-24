package ct01.unipoint.backend.dao;

import ct01.unipoint.backend.entity.EventEntity;
import java.time.LocalDateTime;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EventDao extends JpaRepository<EventEntity, Long> {
  Optional<EventEntity> findByTitleAndStartTime(String title, LocalDateTime startTime);
}
