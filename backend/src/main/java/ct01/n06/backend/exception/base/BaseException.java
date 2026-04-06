package ct01.n06.backend.exception.base;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public abstract class BaseException extends RuntimeException {

  private final String errorCode;
  private final String groupCode;
  private final HttpStatus httpStatus;
  private final String title;

  public BaseException(String errorCode, String groupCode, HttpStatus httpStatus, String title) {
    super(errorCode);
    this.errorCode = errorCode;
    this.groupCode = groupCode;
    this.httpStatus = httpStatus;
    this.title = title;
  }
}
