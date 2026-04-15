package ct01.n06.backend.dto.student;

import java.util.List;

public record StudentNotificationListResponse(
    int page,
    int size,
    long totalItems,
    int totalPages,
    long unreadCount,
    List<StudentNotificationItem> items
) {

  public record StudentNotificationItem(
      Long recipientId,
      Long notificationId,
      String title,
      String content,
      String senderName,
      String targetType,
      Long classId,
      String classCode,
      boolean isRead,
      String createdAt,
      String attachmentName,
      String attachmentDownloadUrl
  ) {
  }
}
