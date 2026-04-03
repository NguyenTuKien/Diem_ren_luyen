package ct01.unipoint.backend.dao;

import ct01.unipoint.backend.entity.SemesterEntity;
import ct01.unipoint.backend.entity.StudentEntity;
import ct01.unipoint.backend.entity.StudentSemesterEntity;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StudentSemesterDao extends JpaRepository<StudentSemesterEntity, Long> {

  List<StudentSemesterEntity> findBySemester_IdAndStudent_IdIn(Long semesterId,
      Collection<String> studentIds);

  Optional<StudentSemesterEntity> findBySemester_IdAndStudent_Id(Long semesterId, String studentId);

  Optional<StudentSemesterEntity> findByStudentAndSemester(StudentEntity student, SemesterEntity semester);
}
