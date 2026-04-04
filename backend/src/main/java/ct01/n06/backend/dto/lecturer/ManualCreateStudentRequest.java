package ct01.n06.backend.dto.lecturer;

public record ManualCreateStudentRequest(
    Long classId,
    String fullName,
    String email,
    String studentCode,
    String username,
    String password
) {

}
