package ct01.n06.backend.exception.base;

import ct01.n06.backend.constant.exception.ExceptionConstant;
import org.springframework.http.HttpStatus;

public class BusinessException extends BaseException {

  private static final String ERROR_CODE = "BUSINESS_ERROR";

  public BusinessException() {
    super(ERROR_CODE, ExceptionConstant.GROUP_CODE_BUSINESS, HttpStatus.BAD_REQUEST,
        ExceptionConstant.TITLE_BUSINESS_ERROR);
  }

  public BusinessException(String errorCode) {
    super(errorCode, ExceptionConstant.GROUP_CODE_BUSINESS, HttpStatus.BAD_REQUEST,
        ExceptionConstant.TITLE_BUSINESS_ERROR);
  }

  public BusinessException(String errorCode, HttpStatus httpStatus, String title) {
    super(errorCode, ExceptionConstant.GROUP_CODE_BUSINESS, httpStatus, title);
  }
}