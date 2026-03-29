package ct01.unipoint.backend.facade.interfaces;

import ct01.unipoint.backend.dto.request.StudentSubmitRequest;
import ct01.unipoint.backend.dto.response.EvaluationFormResponse;

public interface StudentEvaluationFacade {

  void submitEvaluation(String username, StudentSubmitRequest request);

  EvaluationFormResponse getEvaluationForm(String username, Long semesterId);
}
