package ct01.n06.backend.exception.base;

import ct01.n06.backend.constant.exception.ExceptionConstant;
import org.springframework.http.HttpStatus;

public class DatabaseException extends BaseException {

  private static final String ERROR_CODE = "DB_SYS_ERROR";

  public DatabaseException() {
    super(ERROR_CODE, ExceptionConstant.GROUP_CODE_DATABASE, HttpStatus.INTERNAL_SERVER_ERROR,
        ExceptionConstant.TITLE_DATABASE_ERROR);
  }

  public DatabaseException(String errorCode) {
    super(errorCode, ExceptionConstant.GROUP_CODE_DATABASE, HttpStatus.INTERNAL_SERVER_ERROR,
        ExceptionConstant.TITLE_DATABASE_ERROR);
  }
}