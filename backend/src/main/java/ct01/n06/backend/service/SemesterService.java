package ct01.n06.backend.service;

import ct01.n06.backend.entity.SemesterEntity;
import java.util.List;

public interface SemesterService {
  List<SemesterEntity> getAllSemesters();

  SemesterEntity getSemesterById(Long id);
}

