package ct01.n06.backend.service.impl;

import ct01.n06.backend.exception.ApiException;
import ct01.n06.backend.service.DeviceSecurityService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;

@Service
public class DeviceSecurityServiceImpl implements DeviceSecurityService {

    private static final String HMAC_ALGORITHM = "HmacSHA256";
    private static final String TOKEN_PREFIX = "v1";

    private final String hmacSecret;

    public DeviceSecurityServiceImpl(@Value("${device.security.hmac-secret}") String hmacSecret) {
        if (hmacSecret == null || hmacSecret.isBlank()) {
            throw new IllegalStateException("Thiếu cấu hình device.security.hmac-secret");
        }
        this.hmacSecret = hmacSecret;
    }

    @Override
    public String generateDeviceToken(String deviceId) {
        if (deviceId == null || deviceId.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Thiếu deviceId");
        }
        String payload = base64UrlEncode(deviceId.getBytes(StandardCharsets.UTF_8));
        String signature = base64UrlEncode(hmacSha256(payload));
        return TOKEN_PREFIX + "." + payload + "." + signature;
    }

    @Override
    public boolean verifyDeviceToken(String token) {
        if (token == null || token.isBlank()) {
            return false;
        }
        String[] parts = token.split("\\.");
        if (parts.length != 3 || !TOKEN_PREFIX.equals(parts[0])) {
            return false;
        }
        String payload = parts[1];
        String signature = parts[2];
        String expected = base64UrlEncode(hmacSha256(payload));
        return MessageDigest.isEqual(signature.getBytes(StandardCharsets.UTF_8), expected.getBytes(StandardCharsets.UTF_8));
    }

    @Override
    public String extractDeviceId(String token) {
        if (!verifyDeviceToken(token)) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Device token không hợp lệ");
        }
        String[] parts = token.split("\\.");
        try {
            byte[] decoded = base64UrlDecode(parts[1]);
            return new String(decoded, StandardCharsets.UTF_8);
        } catch (IllegalArgumentException ex) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Device token không hợp lệ");
        }
    }

    private byte[] hmacSha256(String payload) {
        try {
            Mac mac = Mac.getInstance(HMAC_ALGORITHM);
            mac.init(new SecretKeySpec(hmacSecret.getBytes(StandardCharsets.UTF_8), HMAC_ALGORITHM));
            return mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
        } catch (Exception ex) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể ký device token");
        }
    }

    private String base64UrlEncode(byte[] value) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(value);
    }

    private byte[] base64UrlDecode(String value) {
        return Base64.getUrlDecoder().decode(value);
    }
}
