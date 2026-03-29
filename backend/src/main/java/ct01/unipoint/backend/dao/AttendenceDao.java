package ct01.unipoint.backend.dao;

import ct01.unipoint.backend.entity.AttendenceEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AttendenceDao extends JpaRepository<AttendenceEntity, Long> {
    Optional<AttendenceEntity> findByEventIdAndStudentId(Long eventId, String studentId);

    boolean existsByEventIdAndStudentId(Long eventId, String studentId);
}
