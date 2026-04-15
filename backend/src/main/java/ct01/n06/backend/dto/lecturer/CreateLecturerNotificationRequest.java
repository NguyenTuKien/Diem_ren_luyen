package ct01.n06.backend.dto.lecturer;

import ct01.n06.backend.entity.enums.NotificationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateLecturerNotificationRequest(
    @NotBlank(message = "Tiêu đề không được để trống")
    @Size(max = 200, message = "Tiêu đề không được vượt quá 200 ký tự")
    String title,

    @NotBlank(message = "Nội dung không được để trống")
    String content,

    @NotNull(message = "Loại đối tượng nhận là bắt buộc")
    NotificationType targetType,

    Long classId
) {
}
