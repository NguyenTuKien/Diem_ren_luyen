package ct01.unipoint.backend.dto.auth;

public record AuthResponse(
    Long userId,
    String email,
    String role,
    String effectiveRole,
    String displayName,
    String dashboardPath,
    String classCode,
    String status
) {

}
