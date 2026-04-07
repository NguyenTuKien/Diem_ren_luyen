package ct01.n06.backend.dto.admin;

public record AdminStudentCreateRequest(
    String fullName,
    String studentCode,
    String email,
    String username,
    String password,
    Long classId,
    String role,
    String status
) {
}