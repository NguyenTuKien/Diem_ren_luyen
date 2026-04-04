package ct01.n06.backend.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ClassResponse {

  private Long id;
  private String classCode;
}