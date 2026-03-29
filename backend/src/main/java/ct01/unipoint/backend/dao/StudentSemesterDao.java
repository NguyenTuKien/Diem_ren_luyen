package ct01.unipoint.backend.dao;

import ct01.unipoint.backend.entity.SemesterEntity;
import ct01.unipoint.backend.entity.StudentEntity;
import ct01.unipoint.backend.entity.StudentSemesterEntity;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StudentSemesterDao extends JpaRepository<StudentSemesterEntity, Long> {

  Optional<StudentSemesterEntity> findByStudentAndSemester(StudentEntity student,
      SemesterEntity semester);

  Optional<StudentSemesterEntity> findByStudent_IdAndSemester_Id(Long studentId, Long semesterId);

  List<StudentSemesterEntity> findByStudent_ClassEntity_IdAndSemester_Id(Long classId,
      Long semesterId);
}

