package ct01.n06.backend.service;

import ct01.n06.backend.dto.student.StudentDashboardResponse;
import ct01.n06.backend.entity.StudentEntity;
import ct01.n06.backend.entity.UserEntity;
import java.util.List;

public interface StudentService {
  StudentEntity getStudentByUser(UserEntity userEntity);

  StudentDashboardResponse getDashboard(String userId);

  StudentEntity getStudentByUsername(String username);

  List<StudentEntity> getStudentsByClassId(Long classId);
}