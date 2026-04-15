package ct01.n06.backend.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
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

  @EntityGraph(attributePaths = {"event", "criteria", "semester"})
  Page<RecordEntity> findByStudent_IdOrderByCreatedAtDesc(String studentId, Pageable pageable);

  @EntityGraph(attributePaths = {"event", "criteria", "semester"})
  Page<RecordEntity> findByStudent_IdAndSemester_IdOrderByCreatedAtDesc(
      String studentId,
      Long semesterId,
      Pageable pageable
  );

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

  long countDistinctStudent_IdBySemester_IdAndStudent_IdInAndEventIsNotNullAndStatus(
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

  @Query("""
      select r.student.id as studentId, count(r.id) as joinedCount
      from RecordEntity r
      where r.semester.id = :semesterId
        and r.student.id in :studentIds
        and r.event is not null
        and r.status = :status
      group by r.student.id
      """)
  List<StudentJoinedCountProjection> countEventJoinsBySemesterAndStudentIdsAndStatus(
      @Param("semesterId") Long semesterId,
      @Param("studentIds") Collection<String> studentIds,
      @Param("status") RecordStatus status
  );

  interface EventAttendeeCountProjection {
    Long getEventId();

    long getAttendeeCount();
  }

  interface StudentJoinedCountProjection {
    String getStudentId();

    long getJoinedCount();
  }
}
