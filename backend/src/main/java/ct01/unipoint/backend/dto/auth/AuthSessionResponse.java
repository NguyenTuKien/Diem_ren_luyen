package ct01.unipoint.backend.dto.auth;

public record AuthSessionResponse(
    Long userId,
    String email,
    String role,
    String effectiveRole,
    String displayName,
    String dashboardPath,
    String classCode,
    String status,
    String accessToken,
    String refreshToken
) {
}
