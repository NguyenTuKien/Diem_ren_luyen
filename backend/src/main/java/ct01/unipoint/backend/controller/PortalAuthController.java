package ct01.unipoint.backend.controller;

import ct01.unipoint.backend.dto.auth.AuthResponse;
import ct01.unipoint.backend.dto.auth.AuthSessionResponse;
import ct01.unipoint.backend.dto.auth.ClassOptionResponse;
import ct01.unipoint.backend.dto.auth.LoginRequest;
import ct01.unipoint.backend.dto.auth.RegisterRequest;
import ct01.unipoint.backend.dto.auth.SsoLoginRequest;
import ct01.unipoint.backend.entity.UserEntity;
import ct01.unipoint.backend.exception.ApiException;
import ct01.unipoint.backend.repository.UserRepository;
import ct01.unipoint.backend.security.jwt.JwtService;
import ct01.unipoint.backend.service.AuthService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class PortalAuthController {

  private final AuthService authService;
  private final JwtService jwtService;
  private final UserRepository userRepository;

  public PortalAuthController(
      AuthService authService,
      JwtService jwtService,
      UserRepository userRepository
  ) {
    this.authService = authService;
    this.jwtService = jwtService;
    this.userRepository = userRepository;
  }

  @PostMapping("/login")
  public AuthSessionResponse login(@RequestBody LoginRequest request) {
    return toSession(authService.login(request));
  }

  @PostMapping("/register")
  public AuthSessionResponse register(@RequestBody RegisterRequest request) {
    return toSession(authService.register(request));
  }

  @PostMapping("/sso")
  public AuthSessionResponse sso(@RequestBody SsoLoginRequest request) {
    return toSession(authService.ssoLogin(request));
  }

  @GetMapping("/classes")
  public List<ClassOptionResponse> classes() {
    return authService.getRegisterClassOptions();
  }

  private AuthSessionResponse toSession(AuthResponse auth) {
    String tokenSubject = userRepository.findByEmailIgnoreCase(auth.email())
        .map(UserEntity::getUsername)
        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy tài khoản."));

    return new AuthSessionResponse(
        auth.userId(),
        auth.email(),
        auth.role(),
        auth.effectiveRole(),
        auth.displayName(),
        auth.dashboardPath(),
        auth.classCode(),
        auth.status(),
        jwtService.generateAccessToken(tokenSubject),
        jwtService.generateRefreshToken(tokenSubject)
    );
  }
}
