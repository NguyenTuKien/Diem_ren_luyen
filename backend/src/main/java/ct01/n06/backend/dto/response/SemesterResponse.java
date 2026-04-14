package ct01.n06.backend.dto.response;

import java.time.LocalDate;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SemesterResponse {

  private Long id;
  private String name;
  private LocalDate startDate;
  private LocalDate endDate;
  private Boolean isActive;
  private LocalDate evaluationStartDate;
  private LocalDate evaluationEndDate;
}
