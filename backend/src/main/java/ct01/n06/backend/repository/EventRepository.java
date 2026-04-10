package ct01.n06.backend.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import ct01.n06.backend.entity.EventEntity;

@Repository
public interface EventRepository extends JpaRepository<EventEntity, Long> {

    Optional<EventEntity> findByTitleAndStartTime(String title, LocalDateTime startTime);

    long countBySemester_Id(Long semesterId);

    long countByCreatedBy_Id(String userId);

    List<EventEntity> findTop5BySemester_IdAndStartTimeAfterOrderByStartTimeAsc(Long semesterId,
        LocalDateTime currentTime);

    List<EventEntity> findTop5ByCreatedBy_IdAndStartTimeAfterOrderByStartTimeAsc(
        String userId,
        LocalDateTime currentTime
    );

    List<EventEntity> findTop5ByStartTimeAfterOrderByStartTimeAsc(LocalDateTime currentTime);

    // Used by EventServiceImpl to page events ordered by creation time desc
    Page<EventEntity> findAllByOrderByCreatedAtDesc(Pageable pageable);
}


