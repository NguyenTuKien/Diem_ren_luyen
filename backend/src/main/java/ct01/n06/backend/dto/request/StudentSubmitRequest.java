package ct01.n06.backend.dto.request;

import ct01.n06.backend.dto.BaseRequest;
import ct01.n06.backend.exception.business.EvaluationValidationException;
import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class StudentSubmitRequest extends BaseRequest {

  private final Long semesterId;
  private final Map<String, Double> details;
  private final Boolean isDraft;

  @Override
  public void validateAndThrow() {
    if (this.semesterId == null) {
      throw new EvaluationValidationException("Semester ID cannot be null");
    }
    if (this.details == null || this.details.isEmpty()) {
      throw new EvaluationValidationException("Evaluation details cannot be empty");
    }
    if (this.isDraft == null) {
      throw new EvaluationValidationException("Draft flag must be specified");
    }
  }
}