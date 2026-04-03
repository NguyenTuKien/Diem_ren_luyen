package ct01.unipoint.backend.facade.interfaces;

import ct01.unipoint.backend.dto.request.MonitorReviewRequest;
import ct01.unipoint.backend.dto.response.EvaluationFormResponse;
import ct01.unipoint.backend.dto.response.StudentEvaluationSummaryResponse;
import java.util.List;

public interface MonitorEvaluationFacade {

  void reviewEvaluation(String monitorUsername, MonitorReviewRequest request);

  List<StudentEvaluationSummaryResponse> getClassEvaluations(String username, Long semesterId);

  EvaluationFormResponse getStudentEvaluationDetail(String username, Long evaluationId);
}
