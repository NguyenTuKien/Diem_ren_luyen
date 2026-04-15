package ct01.n06.backend.constant;

public class NotificationRecipientConstant {

  private NotificationRecipientConstant() {
  }

  public static final String TABLE_NAME = "notification_recipients";
  public static final String COL_ID = "id";
  public static final String COL_NOTIFICATION_ID = "notification_id";
  public static final String COL_STUDENT_ID = "student_id";
  public static final String COL_IS_READ = "is_read";
  public static final String COL_READ_AT = "read_at";
}
