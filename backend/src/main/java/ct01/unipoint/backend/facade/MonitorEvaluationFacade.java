package ct01.unipoint.backend.facade;

import ct01.unipoint.backend.dto.request.MonitorReviewRequest;
import ct01.unipoint.backend.dto.response.EvaluationFormResponse;
import ct01.unipoint.backend.dto.response.StudentEvaluationSummaryResponse;
import ct01.unipoint.backend.entity.StudentEntity;
import ct01.unipoint.backend.entity.StudentSemesterEntity;
import ct01.unipoint.backend.entity.enums.SemesterEvaluationStatus;
import ct01.unipoint.backend.exception.business.InvalidEvaluationStatusException;
import ct01.unipoint.backend.exception.business.UnauthorizedAccessException;
import ct01.unipoint.backend.service.RecordService;
import ct01.unipoint.backend.service.StudentSemesterService;
import ct01.unipoint.backend.service.StudentService;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class MonitorEvaluationFacade{

  private final StudentService studentService;
  private final StudentSemesterService evaluationService;
  private final RecordService recordService;

  @Transactional
  public void reviewEvaluation(final String monitorUsername, final MonitorReviewRequest request) {
    final StudentEntity monitor = this.studentService.getStudentByUsername(monitorUsername);
    final StudentSemesterEntity evaluation = this.evaluationService.getById(
        request.getEvaluationId());

    this.verifyMonitorAuthority(monitor, evaluation);
    this.validateMonitorCanReview(evaluation);

    evaluation.setDetailsJsonb(request.getAdjustedDetails());
    evaluation.setFinalScore(this.calculateScore(request.getAdjustedDetails()));
    evaluation.setStatus(SemesterEvaluationStatus.MONITOR_APPROVED);

    this.evaluationService.save(evaluation);
  }

  @Transactional(readOnly = true)
  public List<StudentEvaluationSummaryResponse> getClassEvaluations(final String username,
      final Long semesterId) {
    final StudentEntity monitor = this.studentService.getStudentByUsername(username);
    final Long classId = monitor.getClassEntity().getId();

    final List<StudentEntity> students = this.studentService.getStudentsByClassId(classId);
    final List<StudentSemesterEntity> evaluations = this.evaluationService.findByClassAndSemester(
        classId, semesterId);

    final Map<String, StudentSemesterEntity> evalMap = evaluations.stream()
        .collect(java.util.stream.Collectors.toMap(e -> e.getStudent().getId(), e -> e));

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
    }).collect(java.util.stream.Collectors.toList());
  }

  @Transactional(readOnly = true)
  public EvaluationFormResponse getStudentEvaluationDetail(final String username,
      final Long evaluationId) {
    final StudentEntity monitor = this.studentService.getStudentByUsername(username);
    final StudentSemesterEntity evaluation = this.evaluationService.getById(evaluationId);

    if (!monitor.getClassEntity().getId()
        .equals(evaluation.getStudent().getClassEntity().getId())) {
      throw new ct01.unipoint.backend.exception.business.UnauthorizedAccessException();
    }

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

  private void verifyMonitorAuthority(final StudentEntity monitor,
      final StudentSemesterEntity evaluation) {
    final Long monitorClassId = monitor.getClassEntity().getId();
    final Long studentClassId = evaluation.getStudent().getClassEntity().getId();

    if (!monitorClassId.equals(studentClassId)) {
      throw new UnauthorizedAccessException();
    }
  }

  private void validateMonitorCanReview(final StudentSemesterEntity evaluation) {
    if (evaluation.getStatus() != SemesterEvaluationStatus.SUBMITTED) {
      throw new InvalidEvaluationStatusException();
    }
  }

  private Integer calculateScore(final Map<String, Double> details) {
    return details.values().stream()
        .filter(java.util.Objects::nonNull)
        .mapToInt(Double::intValue)
        .sum();
  }
}

