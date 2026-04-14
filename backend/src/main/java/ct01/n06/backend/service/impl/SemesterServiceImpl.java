package ct01.n06.backend.service.impl;

import ct01.n06.backend.dto.request.CreateSemesterRequest;
import ct01.n06.backend.dto.request.UpdateSemesterRequest;
import ct01.n06.backend.dto.response.SemesterResponse;
import ct01.n06.backend.entity.SemesterEntity;
import ct01.n06.backend.exception.business.ResourceNotFoundException;
import ct01.n06.backend.repository.SemesterRepository;
import ct01.n06.backend.service.SemesterService;
import java.util.List;
import java.util.stream.Collectors;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@AllArgsConstructor
public class SemesterServiceImpl implements SemesterService {

  private final SemesterRepository semesterRepository;

  @Override
  public List<SemesterEntity> getAllSemesters() {
    return semesterRepository.findAll();
  }

  @Override
  public List<SemesterResponse> getAllSemesterResponses() {
    return semesterRepository.findAll().stream()
        .map(this::toResponse)
        .collect(Collectors.toList());
  }

  @Override
  public SemesterEntity getSemesterById(final Long id) {
    return this.semesterRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Semester ID: " + id));
  }

  @Override
  @Transactional
  public SemesterResponse createSemester(final CreateSemesterRequest request) {
    final SemesterEntity entity = SemesterEntity.builder()
        .name(request.getName())
        .startDate(request.getStartDate())
        .endDate(request.getEndDate())
        .isActive(request.getIsActive() != null ? request.getIsActive() : false)
        .evaluationStartDate(request.getEvaluationStartDate())
        .evaluationEndDate(request.getEvaluationEndDate())
        .build();
    return toResponse(semesterRepository.save(entity));
  }

  @Override
  @Transactional
  public SemesterResponse updateSemester(final Long id, final UpdateSemesterRequest request) {
    final SemesterEntity entity = getSemesterById(id);
    if (request.getName() != null)                entity.setName(request.getName());
    if (request.getStartDate() != null)           entity.setStartDate(request.getStartDate());
    if (request.getEndDate() != null)             entity.setEndDate(request.getEndDate());
    if (request.getIsActive() != null)            entity.setIsActive(request.getIsActive());
    if (request.getEvaluationStartDate() != null) entity.setEvaluationStartDate(request.getEvaluationStartDate());
    if (request.getEvaluationEndDate() != null)   entity.setEvaluationEndDate(request.getEvaluationEndDate());
    return toResponse(semesterRepository.save(entity));
  }

  @Override
  @Transactional
  public void deleteSemester(final Long id) {
    final SemesterEntity entity = getSemesterById(id);
    semesterRepository.delete(entity);
  }

  @Override
  @Transactional
  public SemesterResponse toggleActive(final Long id) {
    final SemesterEntity entity = getSemesterById(id);
    entity.setIsActive(!Boolean.TRUE.equals(entity.getIsActive()));
    return toResponse(semesterRepository.save(entity));
  }

  private SemesterResponse toResponse(final SemesterEntity e) {
    return SemesterResponse.builder()
        .id(e.getId())
        .name(e.getName())
        .startDate(e.getStartDate())
        .endDate(e.getEndDate())
        .isActive(e.getIsActive())
        .evaluationStartDate(e.getEvaluationStartDate())
        .evaluationEndDate(e.getEvaluationEndDate())
        .build();
  }
}