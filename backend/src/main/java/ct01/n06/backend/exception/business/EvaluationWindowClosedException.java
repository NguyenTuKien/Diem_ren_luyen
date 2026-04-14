package ct01.n06.backend.exception.business;

import ct01.n06.backend.exception.base.BusinessException;
import org.springframework.http.HttpStatus;

public class EvaluationWindowClosedException extends BusinessException {

  public static final String ERROR_CODE = "EVAL_WINDOW_001";

  public EvaluationWindowClosedException(final String message) {
    super(ERROR_CODE, HttpStatus.FORBIDDEN, message);
  }
}
