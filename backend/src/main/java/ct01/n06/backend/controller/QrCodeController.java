package ct01.n06.backend.controller;

import ct01.n06.backend.annotation.RateLimit;
import ct01.n06.backend.dto.qrcode.CheckinByCodeRequest;
import ct01.n06.backend.dto.qrcode.ScanQrRequest;
import ct01.n06.backend.dto.qrcode.GenerateQrResponse;
import ct01.n06.backend.dto.qrcode.ScanTotpRequest;
import ct01.n06.backend.repository.UserRepository;
import ct01.n06.backend.entity.UserEntity;
import ct01.n06.backend.exception.RequestException;
import ct01.n06.backend.exception.UnauthorizedException;
import ct01.n06.backend.service.QrCodeService;
import ct01.n06.backend.service.DeviceSecurityService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import ct01.n06.backend.util.CookieUtils;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/v1/qrcode")
@RequiredArgsConstructor
public class QrCodeController {

    private final QrCodeService qrCodeService;
    private final UserRepository userRepository; // Dùng để lookup user id (student_id)
    private final DeviceSecurityService deviceSecurityService;

    @Value("${device.security.cookie-name:device_token}")
    private String deviceCookieName;

    @GetMapping("/generate")
    @PreAuthorize("hasAnyRole('LECTURER', 'ADMIN', 'STAFF')")
    public ResponseEntity<GenerateQrResponse> generateQr(@RequestParam Long eventId) {
        GenerateQrResponse response = qrCodeService.generateQr(eventId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/scan")
    @PreAuthorize("hasRole('STUDENT')")
    @RateLimit(limit = 100, window = 1, isGlobal = true)
    public ResponseEntity<Map<String, Object>> scanQr(
            HttpServletRequest request,
            @RequestBody ScanQrRequest requestBody) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new UnauthorizedException("Chưa xác thực.");
        }

        String principal = authentication.getName();
        UserEntity user = userRepository.findByUsernameIgnoreCase(principal)
                .or(() -> userRepository.findByEmailIgnoreCase(principal))
                .orElseThrow(() -> new UnauthorizedException("Phiên đăng nhập không hợp lệ"));

        String resolvedDeviceId = resolveDeviceIdFromToken(request, user.getId());

        qrCodeService.scanQr(requestBody, user.getId(), resolvedDeviceId);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Điểm danh QR thành công!");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/scan/totp")
    @PreAuthorize("hasRole('STUDENT')")
    @RateLimit(limit = 100, window = 1, isGlobal = true)
    public ResponseEntity<Map<String, Object>> scanTotp(
            HttpServletRequest request,
            @Valid @RequestBody ScanTotpRequest requestBody) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new UnauthorizedException("Chưa xác thực.");
        }

        String principal = authentication.getName();
        UserEntity user = userRepository.findByUsernameIgnoreCase(principal)
                .or(() -> userRepository.findByEmailIgnoreCase(principal))
                .orElseThrow(() -> new UnauthorizedException("Phiên đăng nhập không hợp lệ"));

        String resolvedDeviceId = resolveDeviceIdFromToken(request, user.getId());

        qrCodeService.scanTotp(requestBody, user.getId(), resolvedDeviceId);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Điểm danh TOTP thành công!");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/checkin/code")
    @PreAuthorize("hasRole('STUDENT')")
    @RateLimit(limit = 100, window = 1, isGlobal = true)
    public ResponseEntity<Map<String, Object>> checkinByCode(
            HttpServletRequest request,
            @Valid @RequestBody CheckinByCodeRequest requestBody) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new UnauthorizedException("Chưa xác thực.");
        }

        String principal = authentication.getName();
        UserEntity user = userRepository.findByUsernameIgnoreCase(principal)
                .or(() -> userRepository.findByEmailIgnoreCase(principal))
                .orElseThrow(() -> new UnauthorizedException("Phiên đăng nhập không hợp lệ"));

        String resolvedDeviceId = resolveDeviceIdFromToken(request, user.getId());

        qrCodeService.checkinByCode(requestBody, user.getId(), resolvedDeviceId);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Điểm danh bằng PIN thành công!");
        return ResponseEntity.ok(response);
    }

    private String readDeviceTokenFromHeader(HttpServletRequest request) {
        String headerValue = request.getHeader("X-Device-Token");
        return (headerValue == null || headerValue.isBlank()) ? null : headerValue.trim();
    }

    private String resolveDeviceIdFromToken(HttpServletRequest request, String userId) {
        String deviceToken = CookieUtils.readDeviceTokenFromCookie(request, deviceCookieName);
        if (deviceToken == null || deviceToken.isBlank()) {
            deviceToken = readDeviceTokenFromHeader(request);
        }
        if (deviceToken == null || deviceToken.isBlank()) {
            throw new RequestException("Thiếu device token");
        }
        if (!deviceSecurityService.verifyDeviceToken(deviceToken)) {
            throw new UnauthorizedException("Device token không hợp lệ");
        }
        return deviceSecurityService.extractDeviceId(deviceToken);
    }
}
