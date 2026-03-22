package ct01.unipoint.backend.dto.auth;

public record RegisterRequest(
    String username,
    String email,
    String password,
    String fullName,
    String studentCode,
    Long classId
) {

}
