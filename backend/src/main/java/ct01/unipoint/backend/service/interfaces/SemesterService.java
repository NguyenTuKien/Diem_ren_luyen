package ct01.unipoint.backend.service.interfaces;

import ct01.unipoint.backend.entity.SemesterEntity;
import java.util.List;

public interface SemesterService {

  List<SemesterEntity> getAllSemesters();

  SemesterEntity getSemesterById(Long id);
}