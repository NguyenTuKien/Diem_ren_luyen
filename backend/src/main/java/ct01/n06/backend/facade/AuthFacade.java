package ct01.n06.backend.facade;

import ct01.n06.backend.dto.auth.LoginRequest;
import ct01.n06.backend.dto.auth.LoginResponse;
import ct01.n06.backend.dto.auth.UserInfoResponse;
import ct01.n06.backend.entity.LecturerEntity;
import ct01.n06.backend.entity.StudentEntity;
import ct01.n06.backend.entity.UserEntity;
import ct01.n06.backend.entity.enums.Role;
import ct01.n06.backend.security.JwtService;
import ct01.n06.backend.service.DeviceBindingService;
import ct01.n06.backend.service.DeviceSecurityService;
import ct01.n06.backend.service.LecturerService;
import ct01.n06.backend.service.StudentService;
import ct01.n06.backend.service.TotpService;
import ct01.n06.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.concurrent.TimeUnit;


@Service
@RequiredArgsConstructor
@Slf4j
public class AuthFacade {

    @Value("${jwt.refresh-expiration-ms:604800000}")
    private long refreshExpirationMs;

    @Value("${device.security.hmac-secret:ChangeThisDeviceSecretKey}")
    private String deviceHmacSecret;

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserService userService;
    private final LecturerService lecturerService;
    private final StudentService studentService;
    private final TotpService totpService;
    private final RedisTemplate<Object, Object> redisTemplate;
    private final DeviceSecurityService deviceSecurityService;
    private final DeviceBindingService deviceBindingService;

    public LoginResponse login(LoginRequest request, String deviceId) {
        try {
            warnIfDefaultDeviceSecret();
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );
            String subject = authentication.getName();
            UserEntity userEntity = userService.findByUsernameOrEmail(subject)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

            if (deviceId == null || deviceId.isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "App phiên bản cũ không được hỗ trợ");
            }
            String deviceToken = deviceSecurityService.generateDeviceToken(deviceId.trim());
            deviceBindingService.bindOrValidate(userEntity.getId(), deviceToken);

            String totpSecretToReturn = null;
            if (userEntity.getTotpSecret() == null || userEntity.getTotpSecret().isBlank()) {
                userEntity.setTotpSecret(totpService.generateSecretKey());
                userEntity = userService.save(userEntity);
                totpSecretToReturn = userEntity.getTotpSecret();
            }

            // 1. Tạo Token cho thiết bị mới (Device B)
            String accessToken = jwtService.generateAccessToken(userEntity);
            String refreshToken = jwtService.generateRefreshToken(subject);

            String redisKey = "user:" + subject + ":session";

            redisTemplate.opsForValue().set(
                    redisKey,
                    accessToken,
                    refreshExpirationMs,
                    TimeUnit.MILLISECONDS
            );

            return LoginResponse.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .totpSecret(totpSecretToReturn)
                    .deviceToken(deviceToken)
                    .build();
        } catch (org.springframework.security.core.AuthenticationException ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sai tên đăng nhập hoặc mật khẩu");
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi hệ thống: " + ex.getMessage());
        }
    }


    public LoginResponse refreshTokens(String refreshToken, String deviceToken) {
        String username;
        try {
            username = jwtService.extractUsername(refreshToken);
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid refresh token");
        }

        if (!jwtService.isRefreshTokenValid(refreshToken, username)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token is expired or revoked");
        }

        UserEntity userEntity = userService.findByUsernameOrEmail(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        if (deviceToken == null || deviceToken.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thiếu device token");
        }
        if (!deviceSecurityService.verifyDeviceToken(deviceToken)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Device token không hợp lệ");
        }
        deviceBindingService.bindOrValidate(userEntity.getId(), deviceToken);

        String newAccessToken = jwtService.generateAccessToken(userEntity);
        String newRefreshToken = jwtService.generateRefreshToken(username);

        // 2. PHẢI CẬP NHẬT LẠI ACCESS TOKEN MỚI VÀO REDIS
        String redisKey = "user:" + username + ":session";
        redisTemplate.opsForValue().set(
                redisKey,
                newAccessToken,
                refreshExpirationMs,
                TimeUnit.MILLISECONDS
        );

        return LoginResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .deviceToken(deviceToken)
                .build();
    }

    private void warnIfDefaultDeviceSecret() {
        if (deviceHmacSecret == null) {
            return;
        }
        if ("ChangeThisDeviceSecretKey".equals(deviceHmacSecret.trim())) {
            log.warn("Cảnh báo: Đang dùng HMAC secret mặc định!");
        }
    }

    public UserInfoResponse getCurrentUserInfo(Authentication authentication) {
        String principalIdentifier = resolvePrincipalIdentifier(authentication);

        // 1. Tìm User chính
        UserEntity user = userService.findByUsernameOrEmail(principalIdentifier)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        // 2. Khởi tạo Builder với các thông tin cơ bản
        UserInfoResponse.UserInfoResponseBuilder builder = UserInfoResponse.builder()
                .role(user.getRole().name());

        if (user.getRole() == Role.ROLE_LECTURER) {
            LecturerEntity lecturer = lecturerService.getLecturerByUser(user);
            builder.userId(lecturer.getLecturerCode());
            builder.fullName(lecturer.getFullName());
        }
        else if (user.getRole() == Role.ROLE_STUDENT || user.getRole() == Role.ROLE_MONITOR) {
            StudentEntity student = studentService.getStudentByUser(user);
            builder.userId(student.getStudentCode());
            builder.fullName(student.getFullName());
        }
        else if (user.getRole() == Role.ROLE_ADMIN) {
            builder.userId(user.getUsername());
            builder.fullName("Administrator");
        }

        return builder.build();
    }

    public void logout(String accessToken, String refreshToken) {
        if (accessToken != null && !accessToken.isBlank()) {
            try {
                String username = jwtService.extractUsername(accessToken);
                String redisKey = "user:" + username + ":session";
                redisTemplate.delete(redisKey); // XÓA REDIS
            } catch (Exception e) {
            }

            jwtService.blacklist(accessToken);
        }

        if (refreshToken != null && !refreshToken.isBlank()) {
            jwtService.blacklist(refreshToken);
        }
        SecurityContextHolder.clearContext();
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
}
