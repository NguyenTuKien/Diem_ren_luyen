package ct01.n06.backend.dto.admin;

import java.util.List;

public record AdminLecturerUpdateRequest(
    String fullName,
    String lecturerCode,
    String email,
    String username,
    String password,
    Long facultyId,
    List<Long> classIds,
    String status
) {
}
