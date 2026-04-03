package ct01.unipoint.backend.service.interfaces;

import ct01.unipoint.backend.dto.response.ClassResponse;
import ct01.unipoint.backend.entity.ClassEntity;
import java.util.List;

public interface ClassService {

  ClassEntity getClassById(Long id);

  List<ClassResponse> getAllClasses();
}