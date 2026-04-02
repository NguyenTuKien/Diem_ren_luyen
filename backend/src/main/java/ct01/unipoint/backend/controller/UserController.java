package ct01.unipoint.backend.controller;

import ct01.unipoint.backend.dto.auth.AuthResponse;
import ct01.unipoint.backend.dto.auth.AuthSessionResponse;
import ct01.unipoint.backend.dto.auth.ClassOptionResponse;
import ct01.unipoint.backend.dto.auth.LoginRequest;
import ct01.unipoint.backend.dto.auth.RegisterRequest;
import ct01.unipoint.backend.dto.auth.SsoLoginRequest;
import ct01.unipoint.backend.security.jwt.JwtService;
import ct01.unipoint.backend.service.AuthService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class UserController {

  private final AuthService authService;
  private final JwtService jwtService;


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
    String tokenSubject = authService.resolveTokenSubjectByEmail(auth.email());

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
