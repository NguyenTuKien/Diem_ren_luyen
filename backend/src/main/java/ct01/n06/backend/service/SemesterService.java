package ct01.n06.backend.service;

import ct01.n06.backend.dto.request.CreateSemesterRequest;
import ct01.n06.backend.dto.request.UpdateSemesterRequest;
import ct01.n06.backend.dto.response.SemesterResponse;
import ct01.n06.backend.entity.SemesterEntity;
import java.util.List;

public interface SemesterService {

  List<SemesterEntity> getAllSemesters();

  List<SemesterResponse> getAllSemesterResponses();

  SemesterEntity getSemesterById(Long id);

  SemesterResponse createSemester(CreateSemesterRequest request);

  SemesterResponse updateSemester(Long id, UpdateSemesterRequest request);

  void deleteSemester(Long id);

  SemesterResponse toggleActive(Long id);
}
