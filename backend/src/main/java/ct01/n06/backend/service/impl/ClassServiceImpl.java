package ct01.n06.backend.service.impl;

import ct01.n06.backend.dto.response.ClassResponse;
import ct01.n06.backend.entity.ClassEntity;
import ct01.n06.backend.exception.business.ResourceNotFoundException;
import ct01.n06.backend.repository.ClassRepository;
import ct01.n06.backend.service.ClassService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ClassServiceImpl implements ClassService {

  private final ClassRepository classRepository;

  @Override
  public ClassEntity getClassById(final Long id) {
    return this.classRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Class ID: " + id));
  }

  @Override
  public java.util.List<ClassResponse> getAllClasses() {
    return this.classRepository.findAll().stream()
        .map(c -> ClassResponse.builder()
            .id(c.getId())
            .classCode(c.getClassCode())
            .build())
        .toList();
  }
}