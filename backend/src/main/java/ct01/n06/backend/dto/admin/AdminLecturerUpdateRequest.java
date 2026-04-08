package ct01.n06.backend.dto.admin;

public record AdminLecturerUpdateRequest(
    String fullName,
    String lecturerCode,
    String email,
    String username,
    String password,
    Long facultyId,
    String status
) {
}
