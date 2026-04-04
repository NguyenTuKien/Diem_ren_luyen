package ct01.unipoint.backend.dto.response;

import ct01.unipoint.backend.entity.enums.SemesterEvaluationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentEvaluationSummaryResponse {

  private String studentId;
  private String studentCode;
  private String fullName;
  private Long evaluationId;
  private SemesterEvaluationStatus status;
  private Integer finalScore;
}