package ct01.n06.backend.dto.admin;

public record AdminLecturerCreateRequest(
    String fullName,
    String lecturerCode,
    String email,
    String username,
    String password,
    Long facultyId,
    String status
) {
}