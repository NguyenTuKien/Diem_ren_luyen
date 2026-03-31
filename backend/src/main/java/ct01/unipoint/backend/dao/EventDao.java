package ct01.unipoint.backend.dao;

import ct01.unipoint.backend.entity.EventEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface EventDao extends JpaRepository<EventEntity, Long> {

    Optional<EventEntity> findByTitleAndStartTime(String title, LocalDateTime startTime);

    long countBySemester_Id(Long semesterId);

    List<EventEntity> findTop5BySemester_IdAndStartTimeAfterOrderByStartTimeAsc(Long semesterId,
        LocalDateTime currentTime);
}