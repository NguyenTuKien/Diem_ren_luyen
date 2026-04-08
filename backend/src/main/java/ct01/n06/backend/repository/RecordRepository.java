package ct01.n06.backend.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import ct01.n06.backend.entity.EventEntity;
import ct01.n06.backend.entity.RecordEntity;
import ct01.n06.backend.entity.SemesterEntity;
import ct01.n06.backend.entity.StudentEntity;
import ct01.n06.backend.entity.enums.RecordStatus;

@Repository
public interface RecordRepository extends JpaRepository<RecordEntity, Long> {

  long countByStudent_IdAndSemester_Id(String studentId, Long semesterId);

  List<RecordEntity> findTop10ByStudent_IdOrderByCreatedAtDesc(String studentId);

  List<RecordEntity> findBySemester_IdAndStudent_IdInAndEventIsNotNullAndStatus(
      Long semesterId,
      Collection<String> studentIds,
      RecordStatus status
  );

  long countBySemester_IdAndStudent_IdInAndEventIsNotNullAndStatus(
      Long semesterId,
      Collection<String> studentIds,
      RecordStatus status
  );

  Optional<RecordEntity> findByStudentAndSemesterAndEvent(
      StudentEntity student,
      SemesterEntity semester,
      EventEntity event
  );

  List<RecordEntity> findByStudent_IdAndSemester_IdAndStatus(String studentId, Long semesterId,
      RecordStatus status);

  long countDistinctStudent_IdByEvent_IdAndStatus(Long eventId, RecordStatus status);

  @Query("""
      select r.event.id as eventId, count(distinct r.student.id) as attendeeCount
      from RecordEntity r
      where r.event.id in :eventIds and r.status = :status
      group by r.event.id
      """)
  List<EventAttendeeCountProjection> countDistinctStudentsByEventIdsAndStatus(
      @Param("eventIds") Collection<Long> eventIds,
      @Param("status") RecordStatus status
  );

  interface EventAttendeeCountProjection {
    Long getEventId();

    long getAttendeeCount();
  }
}
