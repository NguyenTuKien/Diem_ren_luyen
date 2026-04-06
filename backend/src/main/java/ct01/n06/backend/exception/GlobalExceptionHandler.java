package ct01.n06.backend.exception;

import ct01.n06.backend.constant.exception.ExceptionConstant;
import ct01.n06.backend.dto.ResponseGeneral;
import ct01.n06.backend.exception.base.BaseException;
import java.time.LocalDateTime;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(BaseException.class)
  public ResponseEntity<ResponseGeneral<Object>> handleBaseException(BaseException ex) {

    String detailMessage = ex.getMessage();

    ResponseGeneral<Object> response = ResponseGeneral.of(
        ex.getHttpStatus().value(),
        detailMessage,
        null,
        LocalDateTime.now().toString()
    );

    return ResponseEntity.status(ex.getHttpStatus()).body(response);
  }

  @ExceptionHandler(HttpMessageNotReadableException.class)
  public ResponseEntity<ResponseGeneral<Object>> handleHttpMessageNotReadableException(
      HttpMessageNotReadableException ex) {

    ResponseGeneral<Object> response = ResponseGeneral.of(
        HttpStatus.BAD_REQUEST.value(),
        ExceptionConstant.MISSING_REQUEST_BODY,
        null,
        LocalDateTime.now().toString()
    );

    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<ResponseGeneral<Object>> handleException(Exception ex) {
    log.error("Unhandled exception", ex);

    String detailMessage = ExceptionConstant.GROUP_CODE_SYSTEM;

    ResponseGeneral<Object> response = ResponseGeneral.of(
        HttpStatus.INTERNAL_SERVER_ERROR.value(),
        detailMessage,
        null,
        LocalDateTime.now().toString()
    );

    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
  }
}
