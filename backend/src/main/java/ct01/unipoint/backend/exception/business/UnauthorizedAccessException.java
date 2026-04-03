package ct01.unipoint.backend.exception.business;

import ct01.unipoint.backend.exception.base.BusinessException;
import org.springframework.http.HttpStatus;

public class UnauthorizedAccessException extends BusinessException {

  public static final String ERROR_CODE = "EVAL_UNAUTHORIZED_001";

  public UnauthorizedAccessException() {
    super(ERROR_CODE, HttpStatus.FORBIDDEN, "You do not have permission to access this resource");
  }
}