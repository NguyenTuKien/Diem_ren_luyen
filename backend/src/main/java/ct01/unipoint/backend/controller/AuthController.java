package ct01.unipoint.backend.controller;

import ct01.unipoint.backend.dto.request.LoginRequest;
import ct01.unipoint.backend.dto.request.LogoutRequest;
import ct01.unipoint.backend.dto.request.RefreshTokenRequest;
import ct01.unipoint.backend.dto.response.LoginResponse;
import ct01.unipoint.backend.dto.response.UserInfoResponse;
import ct01.unipoint.backend.security.jwt.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

@RestController
@RequestMapping("/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        String subject = authentication.getName();
        String accessToken = jwtService.generateAccessToken(subject);
        String refreshToken = jwtService.generateRefreshToken(subject);

        return ResponseEntity.ok(LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .build());
    }

    @PostMapping("/refresh")
    public ResponseEntity<LoginResponse> refresh(@RequestBody RefreshTokenRequest request) {
        if (request == null || request.getRefreshToken() == null || request.getRefreshToken().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "refreshToken is required");
        }

        String username;
        try {
            username = jwtService.extractUsername(request.getRefreshToken());
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid refresh token");
        }

        if (!jwtService.isRefreshTokenValid(request.getRefreshToken(), username)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token is expired or revoked");
        }

        return ResponseEntity.ok(LoginResponse.builder()
                .accessToken(jwtService.generateAccessToken(username))
                .refreshToken(jwtService.generateRefreshToken(username))
                .build());
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request,
                                       @RequestBody(required = false) LogoutRequest logoutRequest) {
        extractBearerToken(request).ifPresent(jwtService::blacklist);
        if (logoutRequest != null && logoutRequest.getRefreshToken() != null && !logoutRequest.getRefreshToken().isBlank()) {
            jwtService.blacklist(logoutRequest.getRefreshToken());
        }
        SecurityContextHolder.clearContext();
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public ResponseEntity<UserInfoResponse> me() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }

        String role = authentication.getAuthorities().stream()
                .findFirst()
                .map(Object::toString)
                .orElse(null);

        return ResponseEntity.ok(UserInfoResponse.builder()
                .username(authentication.getName())
                .role(role)
                .build());
    }

    private Optional<String> extractBearerToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return Optional.empty();
        }
        return Optional.of(authHeader.substring(7));
    }
}
