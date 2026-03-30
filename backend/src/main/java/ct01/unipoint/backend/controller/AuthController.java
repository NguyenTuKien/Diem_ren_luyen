package ct01.unipoint.backend.controller;

import ct01.unipoint.backend.dto.auth.LoginRequest;
import ct01.unipoint.backend.dto.auth.LoginResponse;
import ct01.unipoint.backend.dto.auth.UserInfoResponse;
import ct01.unipoint.backend.facade.AuthFacade;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthFacade authFacade;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authFacade.login(request));
    }

    @PostMapping("/refresh")
    public ResponseEntity<LoginResponse> refresh(@RequestBody Map<String, String> request) {
        if (request == null || request.get("refreshToken") == null || request.get("refreshToken").isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thiếu refresh token.");
        }
        return ResponseEntity.ok(authFacade.refreshTokens(request.get("refreshToken").replace("Bearer ", "")));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request,
                                       @RequestBody(required = false) Map<String, String> body) {
        String authHeader = request.getHeader("Authorization");
        String accessToken = (authHeader != null && authHeader.startsWith("Bearer "))
                ? authHeader.substring(7) : null;
        String refreshToken = (body != null) ? body.get("refreshToken") : null;
        authFacade.logout(accessToken, refreshToken);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public ResponseEntity<UserInfoResponse> me() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Chưa xác thực.");
        }

        return ResponseEntity.ok(authFacade.getCurrentUserInfo(authentication));
    }
}