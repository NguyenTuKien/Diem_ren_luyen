package ct01.unipoint.backend.dto.lecturer;

public record ManualCreateStudentRequest(
    Long classId,
    String fullName,
    String email,
    String studentCode,
    String username,
    String password
) {

}
