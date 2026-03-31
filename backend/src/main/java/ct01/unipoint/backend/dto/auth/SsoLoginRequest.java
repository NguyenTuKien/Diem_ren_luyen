package ct01.unipoint.backend.dto.auth;

public record SsoLoginRequest(
    String email,
    String provider
) {

}
