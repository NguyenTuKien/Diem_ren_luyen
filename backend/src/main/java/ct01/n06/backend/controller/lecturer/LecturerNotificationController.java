package ct01.n06.backend.controller.lecturer;

import ct01.n06.backend.dto.lecturer.CreateLecturerNotificationRequest;
import ct01.n06.backend.dto.lecturer.LecturerNotificationCreateResponse;
import ct01.n06.backend.service.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/v1/lecturer/notifications")
@RequiredArgsConstructor
public class LecturerNotificationController {

  private final NotificationService notificationService;

  @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public LecturerNotificationCreateResponse createNotification(
      @RequestPart("payload") @Valid CreateLecturerNotificationRequest payload,
      @RequestPart(value = "file", required = false) MultipartFile file
  ) {
    return notificationService.createLecturerNotification(payload, file);
  }
}
