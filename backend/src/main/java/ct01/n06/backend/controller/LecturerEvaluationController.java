package ct01.n06.backend.controller;

import ct01.n06.backend.dto.ResponseGeneral;
import ct01.n06.backend.dto.request.LecturerReviewRequest;
import ct01.n06.backend.dto.response.EvaluationFormResponse;
import ct01.n06.backend.dto.response.StudentEvaluationSummaryResponse;
import ct01.n06.backend.facade.LecturerEvaluationFacade;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/lecturer/evaluations")
@RequiredArgsConstructor
public class LecturerEvaluationController {

  private final LecturerEvaluationFacade facade;

  @PostMapping("/finalize")
  public ResponseGeneral<Void> finalizeClass(
      @RequestParam final Long classId,
      @RequestParam final Long semesterId,
      final Authentication auth) {

    this.facade.finalizeClassEvaluation(auth.getName(), classId, semesterId);

    return ResponseGeneral.ofSuccess("Class evaluations finalized successfully", null);
  }

  @PostMapping("/review")
  public ResponseGeneral<Void> reviewEvaluation(
      @RequestBody final LecturerReviewRequest request,
      final Authentication auth) {

    request.validateAndThrow();

    this.facade.reviewEvaluation(auth.getName(), request);

    return ResponseGeneral.ofSuccess("Lecturer review submitted successfully", null);
  }

  @GetMapping("/class-list")
  public ResponseGeneral<List<StudentEvaluationSummaryResponse>> getClassList(
      @RequestParam final Long classId,
      @RequestParam final Long semesterId,
      final Authentication auth) {

    final List<StudentEvaluationSummaryResponse> response = this.facade.getClassEvaluations(
        auth.getName(), classId, semesterId);
    return ResponseGeneral.ofSuccess("Get class evaluations successfully", response);
  }

  @GetMapping("/{evaluationId}")
  public ResponseGeneral<EvaluationFormResponse> getDetail(
      @PathVariable final Long evaluationId,
      final Authentication auth) {

    final EvaluationFormResponse response = this.facade.getStudentEvaluationDetail(auth.getName(),
        evaluationId);
    return ResponseGeneral.ofSuccess("Get evaluation detail successfully", response);
  }
}