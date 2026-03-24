package ct01.unipoint.backend.controller;

import ct01.unipoint.backend.entity.UserEntity;
import ct01.unipoint.backend.dto.request.LoginRequest;
import ct01.unipoint.backend.dto.request.LogoutRequest;
import ct01.unipoint.backend.dto.request.RefreshTokenRequest;
import ct01.unipoint.backend.dto.response.LoginResponse;
import ct01.unipoint.backend.dto.response.UserInfoResponse;
import ct01.unipoint.backend.security.jwt.JwtService;
import ct01.unipoint.backend.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.user.OAuth2User;
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
    private final UserService userService;

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

        String principalIdentifier = resolvePrincipalIdentifier(authentication);
        Optional<UserEntity> userEntityOptional = userService.findByUsernameOrEmail(principalIdentifier);

        String role = userEntityOptional
                .map(user -> user.getRole().name())
                .orElseGet(() -> authentication.getAuthorities().stream()
                .findFirst()
                .map(Object::toString)
                .orElse(null));

        String username = userEntityOptional
                .map(UserEntity::getUsername)
                .orElse(principalIdentifier);

        return ResponseEntity.ok(UserInfoResponse.builder()
                .username(username)
                .role(role)
                .build());
    }

    private String resolvePrincipalIdentifier(Authentication authentication) {
        Object principal = authentication.getPrincipal();

        if (principal instanceof OAuth2User oAuth2User) {
            Object email = oAuth2User.getAttributes().get("email");
            if (email == null) {
                email = oAuth2User.getAttributes().get("preferred_username");
            }
            if (email != null && !email.toString().isBlank()) {
                return email.toString();
            }
        }

        return authentication.getName();
    }

    private Optional<String> extractBearerToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return Optional.empty();
        }
        return Optional.of(authHeader.substring(7));
    }
}
