package ct01.n06.backend.repository;

import ct01.n06.backend.entity.AttendenceEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AttendenceRepository extends JpaRepository<AttendenceEntity, Long> {
    Optional<AttendenceEntity> findByEventIdAndStudentId(Long eventId, String studentId);

    boolean existsByEventIdAndStudentId(Long eventId, String studentId);

    java.util.List<AttendenceEntity> findTop10ByStudentIdOrderByCreatedAtDesc(String studentId);

    Page<AttendenceEntity> findByEventIdOrderByStudentIdAsc(Long eventId, Pageable pageable);
}
