package ct01.unipoint.backend.service.interfaces;

import ct01.unipoint.backend.entity.StudentEntity;
import java.util.List;

public interface StudentService {

  StudentEntity getStudentByUsername(String username);

  List<StudentEntity> getStudentsByClassId(Long classId);
}