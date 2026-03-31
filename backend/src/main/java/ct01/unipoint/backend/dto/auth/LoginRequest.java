package ct01.unipoint.backend.dto.auth;

public record LoginRequest(
        String username,
        String password
) {}