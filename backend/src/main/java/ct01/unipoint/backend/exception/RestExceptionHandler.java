package ct01.unipoint.backend.exception;

import java.time.Instant;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class RestExceptionHandler {

  @ExceptionHandler(ApiException.class)
  public ResponseEntity<ErrorBody> handleApiException(ApiException ex) {
    return ResponseEntity.status(ex.getHttpStatus())
        .body(new ErrorBody(ex.getHttpStatus().value(), ex.getMessage(), Instant.now().toString()));
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<ErrorBody> handleGeneralException(Exception ex) {
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body(new ErrorBody(HttpStatus.INTERNAL_SERVER_ERROR.value(),
            "Lỗi hệ thống không mong muốn.",
            Instant.now().toString()));
  }

  public record ErrorBody(
      int status,
      String message,
      String timestamp
  ) {
  }
}
