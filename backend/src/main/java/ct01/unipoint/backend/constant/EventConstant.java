package ct01.unipoint.backend.constant;

public class EventConstant {
  private EventConstant() {}

  public static final String TABLE_NAME = "events";
  public static final String COL_ID = "id";
  public static final String COL_SEMESTER_ID = "semester_id";
  public static final String COL_CRITERIA_ID = "criteria_id";
  public static final String COL_TITLE = "title";
  public static final String COL_ORGANIZER = "organizer";
  public static final String COL_DESCRIPTION = "description";
  public static final String COL_LOCATION = "location";
  public static final String COL_START_TIME = "start_time";
  public static final String COL_END_TIME = "end_time";
  public static final String COL_CREATED_BY = "created_by";
  public static final String COL_STATUS = "status";

  public static final String MESSAGE_MISSING_REQUEST_DATA = "Thiếu dữ liệu yêu cầu.";
  public static final String MESSAGE_MISSING_SEMESTER_OR_CRITERIA =
      "Thiếu semesterId hoặc criteriaId.";
  public static final String MESSAGE_MISSING_EVENT_TITLE = "Thiếu tiêu đề sự kiện.";
  public static final String MESSAGE_MISSING_EVENT_TIME =
      "Thiếu thời gian bắt đầu hoặc kết thúc.";
  public static final String MESSAGE_INVALID_EVENT_TIME_RANGE =
      "Thời gian kết thúc phải sau thời gian bắt đầu.";
  public static final String MESSAGE_INVALID_SEMESTER = "Học kỳ không hợp lệ.";
  public static final String MESSAGE_INVALID_CRITERIA = "Tiêu chí không hợp lệ.";
  public static final String MESSAGE_INVALID_CREATED_BY_FORMAT = "createdBy phải là số.";
  public static final String MESSAGE_UNRESOLVED_EVENT_CREATOR =
      "Không xác định được người tạo sự kiện.";
}