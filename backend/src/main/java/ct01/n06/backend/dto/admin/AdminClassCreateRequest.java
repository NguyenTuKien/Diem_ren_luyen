package ct01.n06.backend.dto.admin;

public record AdminClassCreateRequest(
    String classCode,
    Long facultyId,
    String lecturerId
) {
}