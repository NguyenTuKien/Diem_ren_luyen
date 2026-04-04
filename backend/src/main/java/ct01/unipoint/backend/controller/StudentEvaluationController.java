package ct01.unipoint.backend.controller;

import ct01.unipoint.backend.dto.ResponseGeneral;
import ct01.unipoint.backend.dto.request.StudentSubmitRequest;
import ct01.unipoint.backend.dto.response.EvaluationFormResponse;
import ct01.unipoint.backend.facade.StudentEvaluationFacade;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/student/evaluations")
@RequiredArgsConstructor
public class StudentEvaluationController {

  private final StudentEvaluationFacade facade;

  @PostMapping("/submit")
  public ResponseGeneral<Void> submit(
      @RequestBody final StudentSubmitRequest request,
      final Authentication auth) {

    request.validateAndThrow();
    this.facade.submitEvaluation(auth.getName(), request);

    return ResponseGeneral.ofSuccess("Student evaluation processed successfully", null);
  }

  @GetMapping("/form")
  public ResponseGeneral<EvaluationFormResponse> getForm(
      @RequestParam final Long semesterId,
      final Authentication auth) {

    final EvaluationFormResponse response = this.facade.getEvaluationForm(auth.getName(),
        semesterId);
    return ResponseGeneral.ofSuccess("Get evaluation form successfully", response);
  }
}