package ct01.unipoint.backend.dao;

import ct01.unipoint.backend.entity.EventEntity;
import ct01.unipoint.backend.entity.RecordEntity;
import ct01.unipoint.backend.entity.SemesterEntity;
import ct01.unipoint.backend.entity.StudentEntity;
import ct01.unipoint.backend.entity.enums.RecordStatus;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RecordDao extends JpaRepository<RecordEntity, Long> {

  long countByStudent_IdAndSemester_Id(String studentId, Long semesterId);

  List<RecordEntity> findTop10ByStudent_IdOrderByCreatedAtDesc(String studentId);

  List<RecordEntity> findBySemester_IdAndStudent_IdInAndEventIsNotNullAndStatus(
      Long semesterId,
      Collection<String> studentIds,
      RecordStatus status
  );

  Optional<RecordEntity> findByStudentAndSemesterAndEvent(
      StudentEntity student,
      SemesterEntity semester,
      EventEntity event
  );
}
