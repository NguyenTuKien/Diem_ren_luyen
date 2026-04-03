package ct01.unipoint.backend.exception.business;

import ct01.unipoint.backend.exception.base.BusinessException;
import org.springframework.http.HttpStatus;

public class InvalidEvaluationStatusException extends BusinessException {

  public static final String ERROR_CODE = "EVAL_STATUS_001";

  public InvalidEvaluationStatusException() {
    super(ERROR_CODE, HttpStatus.CONFLICT, "Current evaluation status does not allow this action");
  }
}