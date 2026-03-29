package ct01.unipoint.backend.facade.impl;

import ct01.unipoint.backend.dto.request.LecturerReviewRequest;
import ct01.unipoint.backend.dto.response.EvaluationFormResponse;
import ct01.unipoint.backend.dto.response.StudentEvaluationSummaryResponse;
import ct01.unipoint.backend.entity.ClassEntity;
import ct01.unipoint.backend.entity.LecturerEntity;
import ct01.unipoint.backend.entity.StudentEntity;
import ct01.unipoint.backend.entity.StudentSemesterEntity;
import ct01.unipoint.backend.entity.enums.SemesterEvaluationStatus;
import ct01.unipoint.backend.exception.business.InvalidEvaluationStatusException;
import ct01.unipoint.backend.exception.business.UnauthorizedAccessException;
import ct01.unipoint.backend.facade.interfaces.LecturerEvaluationFacade;
import ct01.unipoint.backend.service.interfaces.ClassService;
import ct01.unipoint.backend.service.interfaces.LecturerService;
import ct01.unipoint.backend.service.interfaces.RecordService;
import ct01.unipoint.backend.service.interfaces.StudentSemesterService;
import ct01.unipoint.backend.service.interfaces.StudentService;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class LecturerEvaluationFacadeImpl implements LecturerEvaluationFacade {

  private final LecturerService lecturerService;
  private final ClassService classService;
  private final StudentSemesterService evaluationService;
  private final StudentService studentService;
  private final RecordService recordService;

  @Override
  @Transactional
  public void finalizeClassEvaluation(final String lecturerUsername, final Long classId,
      final Long semesterId) {
    final LecturerEntity lecturer = this.lecturerService.getLecturerByUsername(lecturerUsername);
    final ClassEntity classEntity = this.classService.getClassById(classId);

    this.verifyLecturerAuthority(lecturer, classEntity);

    final List<StudentSemesterEntity> evaluations = this.evaluationService.findByClassAndSemester(
        classId, semesterId);

    for (final StudentSemesterEntity eval : evaluations) {
      if (eval.getStatus() == SemesterEvaluationStatus.MONITOR_APPROVED) {
        eval.setStatus(SemesterEvaluationStatus.FINALIZED);
        this.evaluationService.save(eval);
      }
    }
  }

  @Transactional
  @Override
  public void reviewEvaluation(final String lecturerUsername, final LecturerReviewRequest request) {
    final LecturerEntity lecturer = this.lecturerService.getLecturerByUsername(lecturerUsername);
    final StudentSemesterEntity evaluation = this.evaluationService.getById(
        request.getEvaluationId());
    final ClassEntity classEntity = evaluation.getStudent().getClassEntity();

    this.verifyLecturerAuthority(lecturer, classEntity);

    if (evaluation.getStatus() != SemesterEvaluationStatus.MONITOR_APPROVED &&
        evaluation.getStatus() != SemesterEvaluationStatus.SUBMITTED) {
      throw new InvalidEvaluationStatusException();
    }

    evaluation.setDetailsJsonb(request.getAdjustedDetails());
    evaluation.setFinalScore(this.calculateScore(request.getAdjustedDetails()));
    evaluation.setStatus(SemesterEvaluationStatus.FINALIZED);

    this.evaluationService.save(evaluation);
  }

  @Override
  @Transactional(readOnly = true)
  public List<StudentEvaluationSummaryResponse> getClassEvaluations(final String lecturerUsername,
      final Long classId, final Long semesterId) {
    final LecturerEntity lecturer = this.lecturerService.getLecturerByUsername(lecturerUsername);
    final ClassEntity classEntity = this.classService.getClassById(classId);

    this.verifyLecturerAuthority(lecturer, classEntity);

    final List<StudentEntity> students = this.studentService.getStudentsByClassId(classId);

    final List<StudentSemesterEntity> evaluations = this.evaluationService.findByClassAndSemester(
        classId, semesterId);

    final Map<Long, StudentSemesterEntity> evalMap = evaluations.stream()
        .collect(Collectors.toMap(e -> e.getStudent().getId(), e -> e));

    return students.stream().map(student -> {
      StudentSemesterEntity eval = evalMap.get(student.getId());
      if (eval != null) {
        return new StudentEvaluationSummaryResponse(
            student.getId(), student.getStudentCode(), student.getFullName(),
            eval.getId(), eval.getStatus(), eval.getFinalScore());
      } else {
        return new StudentEvaluationSummaryResponse(
            student.getId(), student.getStudentCode(), student.getFullName(),
            null, null, 0);
      }
    }).collect(Collectors.toList());
  }

  @Override
  @Transactional(readOnly = true)
  public EvaluationFormResponse getStudentEvaluationDetail(final String lecturerUsername,
      final Long evaluationId) {
    final LecturerEntity lecturer = this.lecturerService.getLecturerByUsername(lecturerUsername);
    final StudentSemesterEntity evaluation = this.evaluationService.getById(evaluationId);
    final ClassEntity classEntity = evaluation.getStudent().getClassEntity();

    this.verifyLecturerAuthority(lecturer, classEntity);

    final Map<String, Double> autoScores = this.recordService.calculateAutoScores(
        evaluation.getStudent().getId(), evaluation.getSemester().getId());

    return EvaluationFormResponse.builder()
        .evaluationId(evaluation.getId())
        .status(evaluation.getStatus())
        .finalScore(evaluation.getFinalScore())
        .autoScores(autoScores)
        .details(evaluation.getDetailsJsonb())
        .build();
  }

  private void verifyLecturerAuthority(final LecturerEntity lecturer,
      final ClassEntity classEntity) {
    if (!classEntity.getLecturerEntity().getId().equals(lecturer.getId())) {
      throw new UnauthorizedAccessException();
    }
  }

  private Integer calculateScore(final Map<String, Double> details) {
    if (details == null || details.isEmpty()) {
      return 0;
    }
    return details.values().stream()
        .filter(java.util.Objects::nonNull)
        .mapToInt(Double::intValue)
        .sum();
  }
}