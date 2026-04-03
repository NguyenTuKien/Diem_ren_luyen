package ct01.unipoint.backend.dto.request;

import ct01.unipoint.backend.dto.BaseRequest;
import ct01.unipoint.backend.exception.business.EvaluationValidationException;
import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class MonitorReviewRequest extends BaseRequest {

  private final Long evaluationId;
  private final Map<String, Double> adjustedDetails;

  @Override
  public void validateAndThrow() {
    if (this.evaluationId == null) {
      throw new EvaluationValidationException("Evaluation ID cannot be null");
    }
    if (this.adjustedDetails == null || this.adjustedDetails.isEmpty()) {
      throw new EvaluationValidationException("Adjusted details cannot be empty");
    }
  }
}