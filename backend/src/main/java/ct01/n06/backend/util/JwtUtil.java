package ct01.n06.backend.util;

import ct01.n06.backend.repository.LecturerRepository;
import ct01.n06.backend.repository.StudentRepository;
import ct01.n06.backend.entity.UserEntity;
import ct01.n06.backend.entity.enums.Role;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
@RequiredArgsConstructor
public class JwtUtil {

    private final LecturerRepository lecturerRepository;
    private final StudentRepository studentRepository;

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration-ms:900000}")
    private long expirationMs;

    @Value("${jwt.refresh-expiration-ms:604800000}")
    private long refreshExpirationMs;

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public String extractTokenType(String token) {
        return extractClaim(token, claims -> claims.get("type", String.class));
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    public String generateAccessToken(UserEntity userEntity) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("type", "access");
        claims.put("role", userEntity.getRole().name());

        if (userEntity.getRole() == Role.ROLE_LECTURER) {
            lecturerRepository.findByUserEntity(userEntity).ifPresent(lecturer -> {
                claims.put("fullname", lecturer.getFullName());
                claims.put("lecture_id", lecturer.getId()); // Ghi đúng ID của bảng Lecturer
            });
        }
        else if (userEntity.getRole() == Role.ROLE_STUDENT || userEntity.getRole() == Role.ROLE_MONITOR) {
            studentRepository.findByUserEntity(userEntity).ifPresent(student -> {
                claims.put("fullname", student.getFullName());
                claims.put("student_id", student.getId()); // Ghi đúng ID của bảng Student
            });
        }

        return buildToken(claims, userEntity.getUsername(), expirationMs);
    }

    public String generateRefreshToken(String username) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("type", "refresh");
        return buildToken(claims, username, refreshExpirationMs);
    }

    public boolean isTokenValid(String token, String username) {
        final String extractedUsername = extractUsername(token);
        return extractedUsername.equals(username) && !isTokenExpired(token);
    }

    public boolean isRefreshToken(String token) {
        try {
            return "refresh".equals(extractTokenType(token));
        } catch (Exception e) {
            return false;
        }
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private String buildToken(Map<String, Object> extraClaims, String username, long ttlMs) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + ttlMs);
        return Jwts.builder()
                .setClaims(extraClaims)
                .setSubject(username)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignInKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private Key getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
