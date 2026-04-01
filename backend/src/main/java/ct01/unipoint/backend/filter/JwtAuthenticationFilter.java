package ct01.unipoint.backend.filter;

import ct01.unipoint.backend.security.CustomUserDetailsService;
import ct01.unipoint.backend.security.jwt.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final RedisTemplate<Object, Object> redisTemplate;
    private final CustomUserDetailsService userDetailsService;

    @Override
    protected boolean shouldNotFilter(@NonNull HttpServletRequest request) {
        String path = request.getServletPath();
        return path.startsWith("/oauth2/")
                || path.startsWith("/login/oauth2/")
                || path.startsWith("/v1/auth/login")
                || path.startsWith("/v1/auth/refresh");
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String username;

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        jwt = authHeader.substring(7);
        try {
            username = jwtService.extractUsername(jwt);
        } catch (Exception ex) {
            filterChain.doFilter(request, response);
            return;
        }

        // THÊM ĐIỀU KIỆN KIỂM TRA SecurityContextHolder ĐỂ TỐI ƯU
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                // ==========================================
                // 1. CHỐT CHẶN REDIS (KIỂM TRA 1 THIẾT BỊ)
                // ==========================================
                String redisKey = "user:" + username + ":session";
                String tokenInRedis = (String) redisTemplate.opsForValue().get(redisKey);

                // Nếu Redis không có token HOẶC token gửi lên khác với token trong Redis -> Bị đá!
                if (tokenInRedis == null || !tokenInRedis.equals(jwt)) {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType("application/json");
                    response.setCharacterEncoding("UTF-8");
                    response.getWriter().write("{\"error\": \"Tài khoản đã được đăng nhập ở một thiết bị khác hoặc phiên đã hết hạn.\"}");
                    return; // DỪNG LUỒNG CHẠY NGAY LẬP TỨC
                }
                // ==========================================


                // 2. NẾU QUA ĐƯỢC REDIS -> TIẾP TỤC XÁC THỰC NHƯ BÌNH THƯỜNG
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                if (jwtService.isTokenValid(jwt, userDetails)) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            } catch (UsernameNotFoundException ex) {
                SecurityContextHolder.clearContext();
            }
        }

        filterChain.doFilter(request, response);
    }
}
