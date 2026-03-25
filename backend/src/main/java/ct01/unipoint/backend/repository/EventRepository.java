package ct01.unipoint.backend.repository;

import ct01.unipoint.backend.entity.EventEntity;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EventRepository extends JpaRepository<EventEntity, Long> {

  long countBySemester_Id(Long semesterId);

  List<EventEntity> findTop5BySemester_IdAndStartTimeAfterOrderByStartTimeAsc(Long semesterId,
      LocalDateTime fromTime);
}
