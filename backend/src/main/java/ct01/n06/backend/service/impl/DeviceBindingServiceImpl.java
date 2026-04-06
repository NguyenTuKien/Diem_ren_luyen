package ct01.n06.backend.service.impl;

import ct01.n06.backend.exception.ApiException;
import ct01.n06.backend.service.DeviceBindingService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
public class DeviceBindingServiceImpl implements DeviceBindingService {

    private static final String DEVICE_TOKEN_KEY_PREFIX = "device_token:";

    private final StringRedisTemplate stringRedisTemplate;
    private final Duration bindingTtl;

    public DeviceBindingServiceImpl(StringRedisTemplate stringRedisTemplate,
                                    @Value("${device.binding.ttl-ms:604800000}") long bindingTtlMs) {
        this.stringRedisTemplate = stringRedisTemplate;
        this.bindingTtl = Duration.ofMillis(bindingTtlMs);
    }

    @Override
    public void bindOrValidate(String userId, String deviceToken) {
        if (userId == null || userId.isBlank()) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Chưa xác thực");
        }
        if (deviceToken == null || deviceToken.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Thiếu device token");
        }

        String key = DEVICE_TOKEN_KEY_PREFIX + userId;
        String existing = stringRedisTemplate.opsForValue().get(key);
        if (existing != null && !existing.isBlank()) {
            if (!existing.equals(deviceToken)) {
                throw new ApiException(HttpStatus.UNAUTHORIZED, "Thiết bị không khớp với phiên đăng nhập");
            }
            stringRedisTemplate.expire(key, bindingTtl);
            return;
        }

        Boolean stored = stringRedisTemplate.opsForValue().setIfAbsent(key, deviceToken, bindingTtl);
        if (Boolean.TRUE.equals(stored)) {
            return;
        }

        String concurrent = stringRedisTemplate.opsForValue().get(key);
        if (concurrent != null && concurrent.equals(deviceToken)) {
            stringRedisTemplate.expire(key, bindingTtl);
            return;
        }

        throw new ApiException(HttpStatus.UNAUTHORIZED, "Thiết bị không khớp với phiên đăng nhập");
    }

    @Override
    public String getBoundToken(String userId) {
        if (userId == null || userId.isBlank()) {
            return null;
        }
        String key = DEVICE_TOKEN_KEY_PREFIX + userId;
        return stringRedisTemplate.opsForValue().get(key);
    }
}
