package ct01.n06.backend.constant.exception;

public class ExceptionConstant {

  private ExceptionConstant() {
  }

  public static final String TITLE_BUSINESS_ERROR = "Business Error";
  public static final String TITLE_DATABASE_ERROR = "Database Error";
  public static final String TITLE_INTERNAL_SERVER_ERROR = "Internal Server Error";

  public static final String GROUP_CODE_BUSINESS = "BUSINESS_ERROR_GROUP";
  public static final String GROUP_CODE_DATABASE = "DB_SYS_ERROR_GROUP";
  public static final String GROUP_CODE_SYSTEM = "SYSTEM_ERROR_GROUP";

  public static final String MISSING_REQUEST_BODY = "Request body is missing";
}
