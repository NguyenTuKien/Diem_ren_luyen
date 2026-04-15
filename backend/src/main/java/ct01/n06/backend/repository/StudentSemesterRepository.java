package ct01.n06.backend.repository;

import ct01.n06.backend.entity.SemesterEntity;
import ct01.n06.backend.entity.StudentEntity;
import ct01.n06.backend.entity.StudentSemesterEntity;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StudentSemesterRepository extends JpaRepository<StudentSemesterEntity, Long> {

  List<StudentSemesterEntity> findBySemester_IdAndStudent_IdIn(Long semesterId,
      Collection<String> studentIds);

  Optional<StudentSemesterEntity> findBySemester_IdAndStudent_Id(Long semesterId, String studentId);

  Optional<StudentSemesterEntity> findByStudentAndSemester(StudentEntity student, SemesterEntity semester);

  List<StudentSemesterEntity> findByStudent_ClassEntity_IdAndSemester_Id(Long classId,
      Long semesterId);

  @EntityGraph(attributePaths = {"semester"})
  List<StudentSemesterEntity> findByStudent_IdOrderBySemester_StartDateAsc(String studentId);
}
