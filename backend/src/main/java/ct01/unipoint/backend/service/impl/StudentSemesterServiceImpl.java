package ct01.unipoint.backend.service.impl;

import ct01.unipoint.backend.dao.StudentSemesterDao;
import ct01.unipoint.backend.entity.StudentSemesterEntity;
import ct01.unipoint.backend.exception.business.ResourceNotFoundException;
import ct01.unipoint.backend.service.StudentSemesterService;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class StudentSemesterServiceImpl implements StudentSemesterService {

  private final StudentSemesterDao dao;

  @Override
  public Optional<StudentSemesterEntity> findByStudentAndSemester(final String studentId,
      final Long semesterId) {
    return this.dao.findBySemester_IdAndStudent_Id(semesterId, studentId);
  }

  @Override
  public StudentSemesterEntity getById(final Long id) {
    return this.dao.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Evaluation Record"));
  }

  @Override
  public StudentSemesterEntity save(final StudentSemesterEntity entity) {
    return this.dao.save(entity);
  }

  @Override
  public List<StudentSemesterEntity> findByClassAndSemester(final Long classId,
      final Long semesterId) {
    return this.dao.findByStudent_ClassEntity_IdAndSemester_Id(classId, semesterId);
  }
}