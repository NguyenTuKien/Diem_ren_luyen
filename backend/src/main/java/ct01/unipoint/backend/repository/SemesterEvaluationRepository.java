package ct01.unipoint.backend.repository;

import ct01.unipoint.backend.entity.SemesterEvaluationEntity;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SemesterEvaluationRepository extends JpaRepository<SemesterEvaluationEntity, Long> {

  List<SemesterEvaluationEntity> findBySemester_IdAndStudent_IdIn(Long semesterId,
      Collection<Long> studentIds);

  Optional<SemesterEvaluationEntity> findBySemester_IdAndStudent_Id(Long semesterId, Long studentId);
}
