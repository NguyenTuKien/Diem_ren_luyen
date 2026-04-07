package ct01.n06.backend.dto.admin;

public record AdminLecturerRowResponse(
    String lecturerId,
    String lecturerCode,
    String fullName,
    String email,
    String username,
    String status,
    Long facultyId,
    String facultyCode,
    String facultyName,
    Integer classCount,
    String createdAt
) {
}