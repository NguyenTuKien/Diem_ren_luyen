package ct01.unipoint.backend.controller;

import ct01.unipoint.backend.dto.auth.AuthResponse;
import ct01.unipoint.backend.dto.auth.ClassOptionResponse;
import ct01.unipoint.backend.dto.auth.LoginRequest;
import ct01.unipoint.backend.dto.auth.RegisterRequest;
import ct01.unipoint.backend.dto.auth.SsoLoginRequest;
import ct01.unipoint.backend.service.AuthService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

  private final AuthService authService;

  public AuthController(AuthService authService) {
    this.authService = authService;
  }

  @PostMapping("/login")
  public AuthResponse login(@RequestBody LoginRequest request) {
    return authService.login(request);
  }

  @PostMapping("/register")
  public AuthResponse register(@RequestBody RegisterRequest request) {
    return authService.register(request);
  }

  @PostMapping("/sso")
  public AuthResponse sso(@RequestBody SsoLoginRequest request) {
    return authService.ssoLogin(request);
  }

  @GetMapping("/classes")
  public List<ClassOptionResponse> registerClassOptions() {
    return authService.getRegisterClassOptions();
  }
}
