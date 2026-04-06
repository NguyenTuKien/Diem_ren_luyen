package ct01.n06.backend.aspect;

import ct01.n06.backend.annotation.RateLimit;
import ct01.n06.backend.exception.ApiException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.RedisScript;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Collections;

@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class RateLimitAspect {

    private final StringRedisTemplate stringRedisTemplate;
    private final RedisScript<Long> rateLimitScript;
    private final HttpServletRequest request;

    @Around("@annotation(rateLimit)")
    public Object applyRateLimit(ProceedingJoinPoint joinPoint, RateLimit rateLimit) throws Throwable {
        String methodName = joinPoint.getSignature().getName();
        String redisKey;

        if (rateLimit.isGlobal()) {
            redisKey = "ratelimit:global:" + methodName;
        } else {
            // 1. Xác định danh tính User (Username hoặc IP nếu chưa login)
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String userIdentifier = request.getRemoteAddr();
            if (auth != null && auth.isAuthenticated() && !auth.getName().equals("anonymousUser")) {
                userIdentifier = auth.getName();
            }

            // 2. CHỈNH SỬA: Lấy X-Device-Token thay vì X-Device-Id thô
            String deviceToken = request.getHeader("X-Device-Token");

            // 3. Tạo định danh: Kết hợp User + Device Token (nếu có)
            // Việc dùng Token đã ký giúp key ratelimit này khó bị giả mạo hơn
            String clientIdentifier = (deviceToken != null && !deviceToken.trim().isEmpty())
                    ? userIdentifier + ":device:" + deviceToken.trim()
                    : userIdentifier;

            redisKey = "ratelimit:user:" + methodName + ":" + clientIdentifier;
        }

        try {
            Long result = stringRedisTemplate.execute(
                    rateLimitScript,
                    Collections.singletonList(redisKey),
                    String.valueOf(rateLimit.limit()),
                    String.valueOf(rateLimit.window()));

            if (result != null && result == 0) {
                log.warn("Rate limit exceeded for key: {}", redisKey);

                String errorMsg = rateLimit.isGlobal()
                        ? "Hệ thống đang xử lý quá nhiều lượt check-in, vui lòng thử lại sau 1 giây!"
                        : "Bạn thao tác quá nhanh, vui lòng thử lại sau ít giây!";

                throw new ApiException(HttpStatus.TOO_MANY_REQUESTS, errorMsg);
            }
        } catch (Exception e) {
            if (e instanceof ApiException)
                throw e;
            // Fail-open: Nếu Redis "ngỏm", vẫn cho phép request đi qua để không làm gián
            // đoạn dịch vụ
            log.error("Redis Rate Limiter Error - Fail Open allowed", e);
        }

        return joinPoint.proceed();
    }
}