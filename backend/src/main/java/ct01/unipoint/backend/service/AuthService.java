package ct01.unipoint.backend.service;

import ct01.unipoint.backend.dto.auth.AuthResponse;
import ct01.unipoint.backend.dto.auth.ClassOptionResponse;
import ct01.unipoint.backend.dto.auth.LoginRequest;
import ct01.unipoint.backend.dto.auth.RegisterRequest;
import ct01.unipoint.backend.dto.auth.SsoLoginRequest;

import java.util.List;

public interface AuthService {

  AuthResponse login(LoginRequest request);

  AuthResponse register(RegisterRequest request);

  AuthResponse ssoLogin(SsoLoginRequest request);

  List<ClassOptionResponse> getRegisterClassOptions();

  String resolveTokenSubjectByEmail(String email);
}
