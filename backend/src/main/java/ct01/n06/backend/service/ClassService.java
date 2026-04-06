package ct01.n06.backend.service;

import ct01.n06.backend.dto.response.ClassResponse;
import ct01.n06.backend.entity.ClassEntity;
import java.util.List;

public interface ClassService {

  ClassEntity getClassById(Long id);

  List<ClassResponse> getAllClasses();
}

