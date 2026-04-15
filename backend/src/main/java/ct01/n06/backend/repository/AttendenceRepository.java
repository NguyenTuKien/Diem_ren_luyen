package ct01.n06.backend.repository;

import ct01.n06.backend.entity.AttendenceEntity;
import ct01.n06.backend.dto.event.AttendeeResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AttendenceRepository extends JpaRepository<AttendenceEntity, Long> {
    Optional<AttendenceEntity> findByEventIdAndStudentId(Long eventId, String studentId);

    boolean existsByEventIdAndStudentId(Long eventId, String studentId);

    java.util.List<AttendenceEntity> findTop10ByStudentIdOrderByCreatedAtDesc(String studentId);

    @Query(
            value = """
                    select new ct01.n06.backend.dto.event.AttendeeResponse(
                        s.id,
                        s.studentCode,
                        s.fullName,
                        c.classCode
                    )
                    from AttendenceEntity a
                    join a.student s
                    left join s.classEntity c
                    where a.event.id = :eventId
                    order by s.id asc
                    """,
            countQuery = """
                    select count(a.id)
                    from AttendenceEntity a
                    where a.event.id = :eventId
                    """
    )
    Page<AttendeeResponse> findAttendeeResponsesByEventId(@Param("eventId") Long eventId, Pageable pageable);
}
