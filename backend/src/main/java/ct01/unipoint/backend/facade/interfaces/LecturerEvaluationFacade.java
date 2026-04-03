package ct01.unipoint.backend.facade.interfaces;

import ct01.unipoint.backend.dto.request.LecturerReviewRequest;
import ct01.unipoint.backend.dto.response.EvaluationFormResponse;
import ct01.unipoint.backend.dto.response.StudentEvaluationSummaryResponse;
import java.util.List;

public interface LecturerEvaluationFacade {

  void finalizeClassEvaluation(String lecturerUsername, Long classId, Long semesterId);

  void reviewEvaluation(String lecturerUsername, LecturerReviewRequest request);

  List<StudentEvaluationSummaryResponse> getClassEvaluations(String lecturerUsername, Long classId,
      Long semesterId);

  EvaluationFormResponse getStudentEvaluationDetail(String lecturerUsername, Long evaluationId);
}
