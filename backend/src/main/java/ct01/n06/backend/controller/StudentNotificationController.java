package ct01.n06.backend.controller;

import ct01.n06.backend.dto.common.SimpleMessageResponse;
import ct01.n06.backend.dto.student.StudentNotificationListResponse;
import ct01.n06.backend.dto.student.StudentNotificationUnreadResponse;
import ct01.n06.backend.service.NotificationService;
import ct01.n06.backend.service.UserService;
import java.net.MalformedURLException;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/student/notifications")
public class StudentNotificationController {

  private final NotificationService notificationService;
  private final UserService userService;

  public StudentNotificationController(NotificationService notificationService, UserService userService) {
    this.notificationService = notificationService;
    this.userService = userService;
  }

  @PreAuthorize("hasAnyRole('STUDENT', 'MONITOR')")
  @GetMapping
  public StudentNotificationListResponse getNotifications(
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size
  ) {
    return notificationService.getStudentNotifications(userService.requireCurrentUserId(), page, size);
  }

  @PreAuthorize("hasAnyRole('STUDENT', 'MONITOR')")
  @GetMapping("/unread-count")
  public StudentNotificationUnreadResponse getUnreadCount() {
    return notificationService.getStudentUnreadCount(userService.requireCurrentUserId());
  }

  @PreAuthorize("hasAnyRole('STUDENT', 'MONITOR')")
  @PutMapping("/{recipientId}/read")
  public SimpleMessageResponse markAsRead(@PathVariable Long recipientId) {
    return notificationService.markAsRead(userService.requireCurrentUserId(), recipientId);
  }

  @PreAuthorize("hasAnyRole('STUDENT', 'MONITOR')")
  @GetMapping("/{recipientId}/attachment")
  public ResponseEntity<Resource> downloadAttachment(@PathVariable Long recipientId)
      throws MalformedURLException {
    var attachment = notificationService.getStudentAttachment(userService.requireCurrentUserId(), recipientId);
    Resource resource = new UrlResource(attachment.filePath().toUri());

    return ResponseEntity.ok()
        .contentType(MediaType.APPLICATION_OCTET_STREAM)
        .header(HttpHeaders.CONTENT_DISPOSITION,
            ContentDisposition.attachment().filename(attachment.fileName()).build().toString())
        .body(resource);
  }
}
