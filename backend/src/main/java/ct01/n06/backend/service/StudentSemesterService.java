package ct01.n06.backend.service;

import ct01.n06.backend.entity.StudentSemesterEntity;
import java.util.List;
import java.util.Optional;

public interface StudentSemesterService {

  Optional<StudentSemesterEntity> findByStudentAndSemester(String studentId, Long semesterId);

  StudentSemesterEntity getById(Long id);

  StudentSemesterEntity save(StudentSemesterEntity entity);

  List<StudentSemesterEntity> findByClassAndSemester(Long classId, Long semesterId);
}

