package ct01.unipoint.backend.facade.impl;

import ct01.unipoint.backend.dto.request.StudentSubmitRequest;
import ct01.unipoint.backend.dto.response.EvaluationFormResponse;
import ct01.unipoint.backend.entity.SemesterEntity;
import ct01.unipoint.backend.entity.StudentEntity;
import ct01.unipoint.backend.entity.StudentSemesterEntity;
import ct01.unipoint.backend.entity.enums.SemesterEvaluationStatus;
import ct01.unipoint.backend.exception.business.InvalidEvaluationStatusException;
import ct01.unipoint.backend.facade.interfaces.StudentEvaluationFacade;
import ct01.unipoint.backend.service.interfaces.RecordService;
import ct01.unipoint.backend.service.interfaces.SemesterService;
import ct01.unipoint.backend.service.interfaces.StudentSemesterService;
import ct01.unipoint.backend.service.interfaces.StudentService;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class StudentEvaluationFacadeImpl implements StudentEvaluationFacade {

  private final StudentService studentService;
  private final SemesterService semesterService;
  private final StudentSemesterService evaluationService;
  private final RecordService recordService;

  @Override
  @Transactional
  public void submitEvaluation(final String username, final StudentSubmitRequest request) {
    final StudentEntity student = this.studentService.getStudentByUsername(username);
    final SemesterEntity semester = this.semesterService.getSemesterById(request.getSemesterId());

    StudentSemesterEntity evaluation = this.evaluationService
        .findByStudentAndSemester(student.getId(), semester.getId())
        .orElseGet(() -> this.createEmptyEvaluation(student, semester));

    this.validateStudentCanEdit(evaluation);

    evaluation.setDetailsJsonb(request.getDetails());
    evaluation.setFinalScore(this.calculateScore(request.getDetails()));

    final SemesterEvaluationStatus nextStatus = request.getIsDraft()
        ? SemesterEvaluationStatus.DRAFT
        : SemesterEvaluationStatus.SUBMITTED;
    evaluation.setStatus(nextStatus);

    this.evaluationService.save(evaluation);
  }

  @Override
  @Transactional(readOnly = true)
  public EvaluationFormResponse getEvaluationForm(final String username, final Long semesterId) {
    final StudentEntity student = this.studentService.getStudentByUsername(username);
    final SemesterEntity semester = this.semesterService.getSemesterById(semesterId);

    final Map<String, Double> autoScores = this.recordService.calculateAutoScores(student.getId(),
        semester.getId());

    final Optional<StudentSemesterEntity> evalOpt = this.evaluationService.findByStudentAndSemester(
        student.getId(), semester.getId());

    if (evalOpt.isPresent()) {
      final StudentSemesterEntity eval = evalOpt.get();
      return EvaluationFormResponse.builder()
          .evaluationId(eval.getId())
          .status(eval.getStatus())
          .finalScore(eval.getFinalScore())
          .autoScores(autoScores)
          .details(eval.getDetailsJsonb() != null ? eval.getDetailsJsonb() : new HashMap<>())
          .build();
    }

    return EvaluationFormResponse.builder()
        .status(null)
        .finalScore(0)
        .autoScores(autoScores)
        .details(new HashMap<>())
        .build();
  }

  private StudentSemesterEntity createEmptyEvaluation(final StudentEntity student,
      final SemesterEntity semester) {
    StudentSemesterEntity entity = new StudentSemesterEntity();
    entity.setStudent(student);
    entity.setSemester(semester);
    return entity;
  }

  private void validateStudentCanEdit(final StudentSemesterEntity evaluation) {
    if (evaluation.getStatus() != null
        && evaluation.getStatus() != SemesterEvaluationStatus.DRAFT) {
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