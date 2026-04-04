package ct01.n06.backend.dto.response;

import ct01.n06.backend.entity.enums.SemesterEvaluationStatus;
import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EvaluationFormResponse {

  private Long evaluationId;
  private SemesterEvaluationStatus status;
  private Integer finalScore;

  private Map<String, Double> autoScores;

  private Map<String, Double> details;
}