package ct01.unipoint.backend.service.interfaces;

import ct01.unipoint.backend.entity.StudentSemesterEntity;
import java.util.List;
import java.util.Optional;

public interface StudentSemesterService {

  Optional<StudentSemesterEntity> findByStudentAndSemester(Long studentId, Long semesterId);

  StudentSemesterEntity getById(Long id);

  StudentSemesterEntity save(StudentSemesterEntity entity);

  List<StudentSemesterEntity> findByClassAndSemester(Long classId, Long semesterId);
}