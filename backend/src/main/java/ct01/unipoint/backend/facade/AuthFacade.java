package ct01.unipoint.backend.facade;

import ct01.unipoint.backend.dto.auth.LoginRequest;
import ct01.unipoint.backend.dto.response.LoginResponse;
import ct01.unipoint.backend.dto.response.UserInfoResponse;
import ct01.unipoint.backend.entity.LecturerEntity;
import ct01.unipoint.backend.entity.StudentEntity;
import ct01.unipoint.backend.entity.UserEntity;
import ct01.unipoint.backend.entity.enums.Role;
import ct01.unipoint.backend.security.jwt.JwtService;
import ct01.unipoint.backend.service.LecturerService;
import ct01.unipoint.backend.service.StudentService;
import ct01.unipoint.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;


@Service
@RequiredArgsConstructor
public class AuthFacade {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserService userService;
    private final LecturerService lecturerService;
    private final StudentService studentService;

    public LoginResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.username(), request.password())
        );
        String subject = authentication.getName();
        UserEntity userEntity = userService.findByUsername(subject);

        return LoginResponse.builder()
                .accessToken(jwtService.generateAccessToken(userEntity))
                .refreshToken(jwtService.generateRefreshToken(subject))
                .build();
    }

    public LoginResponse refreshTokens(String refreshToken) {
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

        return LoginResponse.builder()
                .accessToken(jwtService.generateAccessToken(userEntity))
                .refreshToken(jwtService.generateRefreshToken(username))
                .build();
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