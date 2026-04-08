package ct01.n06.backend.controller;

import ct01.n06.backend.dto.auth.LoginRequest;
import ct01.n06.backend.dto.auth.LoginResponse;
import ct01.n06.backend.dto.auth.UserInfoResponse;
import ct01.n06.backend.facade.AuthFacade;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import ct01.n06.backend.exception.RequestException;
import ct01.n06.backend.exception.UnauthorizedException;
import ct01.n06.backend.util.CookieUtils;

import java.util.Map;

@RestController
@RequestMapping("/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthFacade authFacade;

    @Value("${device.security.cookie-name:device_token}")
    private String deviceCookieName;

    @Value("${device.security.cookie-secure:true}")
    private boolean deviceCookieSecure;

    @Value("${device.binding.ttl-ms:604800000}")
    private long deviceCookieTtlMs;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @RequestHeader(value = "X-Device-Id", required = false) String deviceId,
            @RequestBody LoginRequest request) {
        LoginResponse response = authFacade.login(request, deviceId);
        return withDeviceCookie(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<LoginResponse> refresh(
            HttpServletRequest httpRequest,
            @RequestHeader(value = "X-Device-Token", required = false) String deviceId,
            @RequestBody Map<String, String> request) {
        if (request == null || request.get("refreshToken") == null || request.get("refreshToken").isBlank()) {
            throw new RequestException("Thiếu refresh token.");
        }
        String resolvedDeviceToken = (deviceId != null && !deviceId.isBlank())
                ? deviceId
                : CookieUtils.readDeviceTokenFromCookie(httpRequest, deviceCookieName);
        LoginResponse response = authFacade.refreshTokens(
                request.get("refreshToken").replace("Bearer ", ""),
                resolvedDeviceToken
        );
        return withDeviceCookie(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request,
                                       @RequestBody(required = false) Map<String, String> body) {
        String authHeader = request.getHeader("Authorization");
        String accessToken = (authHeader != null && authHeader.startsWith("Bearer "))
                ? authHeader.substring(7) : null;
        String refreshToken = (body != null) ? body.get("refreshToken") : null;
        authFacade.logout(accessToken, refreshToken);
        ResponseCookie clearCookie = ResponseCookie.from(deviceCookieName, "")
                .path("/")
                .httpOnly(true)
                .secure(deviceCookieSecure)
                .sameSite("Lax")
                .maxAge(0)
                .build();
        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, clearCookie.toString())
                .build();
    }

    @GetMapping("/me")
    public ResponseEntity<UserInfoResponse> me() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new UnauthorizedException("Chưa xác thực.");
        }

        return ResponseEntity.ok(authFacade.getCurrentUserInfo(authentication));
    }

    private ResponseEntity<LoginResponse> withDeviceCookie(LoginResponse response) {
        if (response == null || response.getDeviceToken() == null || response.getDeviceToken().isBlank()) {
            return ResponseEntity.ok(response);
        }

        ResponseCookie cookie = ResponseCookie.from(deviceCookieName, response.getDeviceToken())
                .path("/")
                .httpOnly(true)
                .secure(deviceCookieSecure)
                .sameSite("Lax")
                .maxAge(deviceCookieTtlMs / 1000)
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(response);
    }

}