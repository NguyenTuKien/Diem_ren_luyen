package ct01.unipoint.backend.service.impl;

import ct01.unipoint.backend.repository.SemesterRepository;
import ct01.unipoint.backend.entity.SemesterEntity;
import ct01.unipoint.backend.exception.business.ResourceNotFoundException;
import ct01.unipoint.backend.service.SemesterService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class SemesterServiceImpl implements SemesterService {
    private final SemesterRepository semesterRepository;

    @Override
    public List<SemesterEntity> getAllSemesters() {
        return semesterRepository.findAll();
    }

  @Override
  public SemesterEntity getSemesterById(final Long id) {
    return this.semesterRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Semester ID: " + id));
  }
}