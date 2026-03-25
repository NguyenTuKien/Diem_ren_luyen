package ct01.unipoint.backend.repository;

import ct01.unipoint.backend.entity.ActivityRecordEntity;
import ct01.unipoint.backend.entity.enums.ActivityRecordStatus;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ActivityRecordRepository extends JpaRepository<ActivityRecordEntity, Long> {

  long countByStudent_IdAndSemester_Id(Long studentId, Long semesterId);

  List<ActivityRecordEntity> findTop10ByStudent_IdOrderByCreatedAtDesc(Long studentId);

  List<ActivityRecordEntity> findBySemester_IdAndStudent_IdInAndEventIsNotNullAndStatus(
      Long semesterId,
      Collection<Long> studentIds,
      ActivityRecordStatus status
  );
}
