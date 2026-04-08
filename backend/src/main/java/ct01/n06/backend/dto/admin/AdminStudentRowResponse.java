package ct01.n06.backend.dto.admin;

public record AdminStudentRowResponse(
    String studentId,
    String studentCode,
    String fullName,
    String email,
    String username,
    String status,
    String role,
    Long classId,
    String classCode,
    Long facultyId,
    String facultyCode,
    String facultyName,
    String lecturerName,
    String createdAt
) {
}