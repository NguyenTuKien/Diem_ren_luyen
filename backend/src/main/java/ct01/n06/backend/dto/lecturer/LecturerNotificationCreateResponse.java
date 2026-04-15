package ct01.n06.backend.dto.lecturer;

public record LecturerNotificationCreateResponse(
    Long notificationId,
    int totalRecipients,
    int sentEmailCount,
    int failedEmailCount,
    String createdAt,
    String attachmentName
) {
}
