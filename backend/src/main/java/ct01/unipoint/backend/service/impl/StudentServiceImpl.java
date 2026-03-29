package ct01.unipoint.backend.service.impl;

import ct01.unipoint.backend.dao.StudentDao;
import ct01.unipoint.backend.entity.StudentEntity;
import ct01.unipoint.backend.exception.business.ResourceNotFoundException;
import ct01.unipoint.backend.service.interfaces.StudentService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class StudentServiceImpl implements StudentService {

  private final StudentDao studentDao;

  @Override
  public StudentEntity getStudentByUsername(final String username) {
    return this.studentDao.findByUserEntity_Username(username)
        .orElseThrow(() -> new ResourceNotFoundException("Student profile for user: " + username));
  }

  @Override
  public List<StudentEntity> getStudentsByClassId(final Long classId) {
    return this.studentDao.findByClassEntity_Id(classId);
  }
}