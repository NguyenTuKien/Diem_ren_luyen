package ct01.unipoint.backend.service.impl;

import ct01.unipoint.backend.dao.ClassDao;
import ct01.unipoint.backend.entity.ClassEntity;
import ct01.unipoint.backend.exception.business.ResourceNotFoundException;
import ct01.unipoint.backend.service.interfaces.ClassService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ClassServiceImpl implements ClassService {

  private final ClassDao classDao;

  @Override
  public ClassEntity getClassById(final Long id) {
    return this.classDao.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Class ID: " + id));
  }

  @Override
  public java.util.List<ct01.unipoint.backend.dto.response.ClassResponse> getAllClasses() {
    return this.classDao.findAll().stream()
        .map(c -> ct01.unipoint.backend.dto.response.ClassResponse.builder()
            .id(c.getId())
            .classCode(c.getClassCode())
            .build())
        .toList();
  }
}