package ct01.unipoint.backend.dao;

import ct01.unipoint.backend.entity.SemesterEntity;
import ct01.unipoint.backend.entity.StudentSemesterEntity;
import ct01.unipoint.backend.entity.StudentEntity;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StudentSemesterDao extends JpaRepository<StudentSemesterEntity, Long> {
  Optional<StudentSemesterEntity> findByStudentAndSemester(StudentEntity student, SemesterEntity semester);
}

