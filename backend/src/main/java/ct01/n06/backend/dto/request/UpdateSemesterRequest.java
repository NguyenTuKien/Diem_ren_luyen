package ct01.n06.backend.dto.request;

import java.time.LocalDate;
import lombok.Data;

@Data
public class UpdateSemesterRequest {

  private String name;
  private LocalDate startDate;
  private LocalDate endDate;
  private Boolean isActive;
  private LocalDate evaluationStartDate;
  private LocalDate evaluationEndDate;
}
