package ct01.unipoint.backend.exception;

import java.time.Instant;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class RestExceptionHandler {

  @ExceptionHandler(ApiException.class)
  public ResponseEntity<ErrorBody> handleApiException(ApiException ex) {
    return ResponseEntity.status(ex.getHttpStatus())
        .body(new ErrorBody(ex.getHttpStatus().value(), ex.getMessage(), Instant.now().toString()));
  }

  @ExceptionHandler(DataIntegrityViolationException.class)
  public ResponseEntity<ErrorBody> handleDataIntegrityViolationException(
      DataIntegrityViolationException ex
  ) {
    return ResponseEntity.status(HttpStatus.CONFLICT)
        .body(new ErrorBody(HttpStatus.CONFLICT.value(),
            "Dữ liệu không hợp lệ hoặc đã tồn tại. Vui lòng kiểm tra lại thông tin.",
            Instant.now().toString()));
  }

  @ExceptionHandler(ObjectOptimisticLockingFailureException.class)
  public ResponseEntity<ErrorBody> handleOptimisticLockingException(
      ObjectOptimisticLockingFailureException ex
  ) {
    return ResponseEntity.status(HttpStatus.CONFLICT)
        .body(new ErrorBody(HttpStatus.CONFLICT.value(),
            "Dữ liệu vừa thay đổi bởi thao tác khác. Vui lòng thử lại.",
            Instant.now().toString()));
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
