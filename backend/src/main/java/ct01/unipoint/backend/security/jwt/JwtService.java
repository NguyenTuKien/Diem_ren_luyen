package ct01.unipoint.backend.security.jwt;

import java.util.Date;

import ct01.unipoint.backend.entity.UserEntity;
import ct01.unipoint.backend.security.TokenBlacklistService;
import ct01.unipoint.backend.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class JwtService {
    private final JwtUtil jwtUtil;
    private final TokenBlacklistService tokenBlacklistService;

    public String generateAccessToken(UserEntity userEntity) {
        return jwtUtil.generateAccessToken(userEntity);
    }

    public String generateRefreshToken(String username) {
        return jwtUtil.generateRefreshToken(username);
    }

    public String extractUsername(String token) {
        return jwtUtil.extractUsername(token);
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        if (tokenBlacklistService.isBlacklisted(token)) {
            return false;
        }
        return jwtUtil.isTokenValid(token, userDetails.getUsername());
    }

    public boolean isRefreshTokenValid(String token, String username) {
        if (tokenBlacklistService.isBlacklisted(token)) {
            return false;
        }
        return jwtUtil.isRefreshToken(token) && jwtUtil.isTokenValid(token, username);
    }

    public void blacklist(String token) {
        Date expiry = jwtUtil.extractExpiration(token);
        tokenBlacklistService.blacklist(token, expiry);
    }
}
