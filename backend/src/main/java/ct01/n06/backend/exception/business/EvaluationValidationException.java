package ct01.n06.backend.exception.business;

import ct01.n06.backend.exception.base.BusinessException;
import org.springframework.http.HttpStatus;

public class EvaluationValidationException extends BusinessException {

  public static final String ERROR_CODE = "EVAL_VALID_001";

  public EvaluationValidationException(final String message) {
    super(ERROR_CODE, HttpStatus.BAD_REQUEST, message);
  }
}