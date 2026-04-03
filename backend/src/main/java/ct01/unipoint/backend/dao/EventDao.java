package ct01.unipoint.backend.dao;

import ct01.unipoint.backend.entity.EventEntity;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EventDao extends JpaRepository<EventEntity, Long> {

  long countBySemester_Id(Long semesterId);

  List<EventEntity> findTop5BySemester_IdAndStartTimeAfterOrderByStartTimeAsc(Long semesterId,
      LocalDateTime fromTime);

  Optional<EventEntity> findByTitleAndStartTime(String title, LocalDateTime startTime);
}
