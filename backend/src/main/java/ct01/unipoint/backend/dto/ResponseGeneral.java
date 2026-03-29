package ct01.unipoint.backend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.http.HttpStatus;

@Data
@NoArgsConstructor
@AllArgsConstructor(staticName = "of")
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ResponseGeneral<T> {

  private int status;
  private String message;
  private T data;
  private String timestamp;


  public static <T> ResponseGeneral<T> of(int status, String message, T data) {
    return of(status, message, data, LocalDateTime.now().toString());
  }

  public static <T> ResponseGeneral<T> ofSuccess(String message, T data) {
    return of(HttpStatus.OK.value(), message, data, LocalDateTime.now().toString());
  }

  public static <T> ResponseGeneral<T> ofCreated(String message, T data) {
    return of(HttpStatus.CREATED.value(), message, data, LocalDateTime.now().toString());
  }
}