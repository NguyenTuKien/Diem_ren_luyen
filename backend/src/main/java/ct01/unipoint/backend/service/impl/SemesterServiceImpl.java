package ct01.unipoint.backend.service.impl;

import ct01.unipoint.backend.dao.SemesterDao;
import ct01.unipoint.backend.entity.SemesterEntity;
import ct01.unipoint.backend.exception.business.ResourceNotFoundException;
import ct01.unipoint.backend.service.interfaces.SemesterService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SemesterServiceImpl implements SemesterService {

  private final SemesterDao semesterDao;

  @Override
  public List<SemesterEntity> getAllSemesters() {
    return this.semesterDao.findAll();
  }

  @Override
  public SemesterEntity getSemesterById(final Long id) {
    return this.semesterDao.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Semester ID: " + id));
  }
}