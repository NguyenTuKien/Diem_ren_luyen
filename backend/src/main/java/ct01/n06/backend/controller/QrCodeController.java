package ct01.n06.backend.controller;

import ct01.n06.backend.dto.qrcode.ScanQrRequest;
import ct01.n06.backend.dto.qrcode.GenerateQrResponse;
import ct01.n06.backend.repository.UserRepository;
import ct01.n06.backend.entity.UserEntity;
import ct01.n06.backend.exception.ApiException;
import ct01.n06.backend.service.QrCodeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/v1/qrcode")
@RequiredArgsConstructor
public class QrCodeController {

    private final QrCodeService qrCodeService;
    private final UserRepository userRepository; // Dùng để lookup user id (student_id)

    @GetMapping("/generate")
    @PreAuthorize("hasAnyRole('LECTURER', 'ADMIN', 'STAFF')")
    public ResponseEntity<GenerateQrResponse> generateQr(@RequestParam Long eventId) {
        GenerateQrResponse response = qrCodeService.generateQr(eventId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/scan")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Map<String, Object>> scanQr(@RequestBody ScanQrRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Chưa xác thực.");
        }

        String principal = authentication.getName();
        UserEntity user = userRepository.findByUsernameIgnoreCase(principal)
                .or(() -> userRepository.findByEmailIgnoreCase(principal))
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Phiên đăng nhập không hợp lệ"));

        qrCodeService.scanQr(request, user.getId());

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Điểm danh QR thành công!");
        return ResponseEntity.ok(response);
    }
}
