package ct01.unipoint.backend.service.impl;

import java.util.List;
import java.util.Locale;
import java.util.Objects;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import ct01.unipoint.backend.dto.auth.AuthResponse;
import ct01.unipoint.backend.dto.auth.ClassOptionResponse;
import ct01.unipoint.backend.dto.auth.LoginRequest;
import ct01.unipoint.backend.dto.auth.RegisterRequest;
import ct01.unipoint.backend.dto.auth.SsoLoginRequest;
import ct01.unipoint.backend.entity.ClassEntity;
import ct01.unipoint.backend.entity.LecturerEntity;
import ct01.unipoint.backend.entity.StudentEntity;
import ct01.unipoint.backend.entity.UserEntity;
import ct01.unipoint.backend.entity.enums.Role;
import ct01.unipoint.backend.entity.enums.UserStatus;
import ct01.unipoint.backend.exception.ApiException;
import ct01.unipoint.backend.repository.ClassRepository;
import ct01.unipoint.backend.repository.LecturerRepository;
import ct01.unipoint.backend.repository.StudentRepository;
import ct01.unipoint.backend.repository.UserRepository;
import ct01.unipoint.backend.service.AuthService;
import ct01.unipoint.backend.service.RoleResolverService;

@Service
public class AuthServiceImpl implements AuthService {

  private final UserRepository userRepository;
  private final StudentRepository studentRepository;
  private final LecturerRepository lecturerRepository;
  private final ClassRepository classRepository;
  private final RoleResolverService roleResolverService;
  private final PasswordEncoder passwordEncoder;

  public AuthServiceImpl(
      UserRepository userRepository,
      StudentRepository studentRepository,
      LecturerRepository lecturerRepository,
      ClassRepository classRepository,
      RoleResolverService roleResolverService,
      PasswordEncoder passwordEncoder
  ) {
    this.userRepository = userRepository;
    this.studentRepository = studentRepository;
    this.lecturerRepository = lecturerRepository;
    this.classRepository = classRepository;
    this.roleResolverService = roleResolverService;
    this.passwordEncoder = passwordEncoder;
  }

  @Override
  @Transactional(readOnly = true)
  public AuthResponse login(LoginRequest request) {
    validateLoginRequest(request);

    UserEntity user = userRepository.findByEmailIgnoreCase(request.email().trim())
        .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Email hoặc mật khẩu không đúng."));

    ensureAccountAvailable(user);

    if (!passwordMatches(request.password(), user.getPassword())) {
      throw new ApiException(HttpStatus.UNAUTHORIZED, "Email hoặc mật khẩu không đúng.");
    }

    return mapAuthResponse(user);
  }

  @Override
  @Transactional
  public AuthResponse register(RegisterRequest request) {
    validateRegisterRequest(request);

    String email = request.email().trim().toLowerCase(Locale.ROOT);
    String username = normalizeUsername(request.username(), email);
    String studentCode = request.studentCode().trim().toUpperCase(Locale.ROOT);

    if (userRepository.existsByEmailIgnoreCase(email)) {
      throw new ApiException(HttpStatus.CONFLICT, "Email đã tồn tại.");
    }
    if (userRepository.existsByUsernameIgnoreCase(username)) {
      throw new ApiException(HttpStatus.CONFLICT, "Username đã tồn tại.");
    }
    if (studentRepository.findByStudentCodeIgnoreCase(studentCode).isPresent()) {
      throw new ApiException(HttpStatus.CONFLICT, "Mã sinh viên đã tồn tại.");
    }

    ClassEntity classEntity = classRepository.findById(request.classId())
        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy lớp."));

    UserEntity user = UserEntity.builder()
        .username(username)
        .email(email)
        .password(passwordEncoder.encode(request.password().trim()))
        .role(Role.ROLE_STUDENT)
        .status(UserStatus.ACTIVE)
        .build();
    UserEntity savedUser = userRepository.save(user);

    StudentEntity student = StudentEntity.builder()
        .id(savedUser.getId())
        .userEntity(savedUser)
        .studentCode(studentCode)
        .fullName(request.fullName().trim())
        .classEntity(classEntity)
        .build();
    studentRepository.save(student);

    return mapAuthResponse(savedUser);
  }

  @Override
  @Transactional(readOnly = true)
  public AuthResponse ssoLogin(SsoLoginRequest request) {
    if (request == null || !StringUtils.hasText(request.email())) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Email là bắt buộc.");
    }
    if (!StringUtils.hasText(request.provider())) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Provider SSO là bắt buộc.");
    }

    UserEntity user = userRepository.findByEmailIgnoreCase(request.email().trim())
        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND,
            "Không tìm thấy tài khoản SSO theo email đã nhập."));

    ensureAccountAvailable(user);
    return mapAuthResponse(user);
  }

  @Override
  @Transactional(readOnly = true)
  public List<ClassOptionResponse> getRegisterClassOptions() {
    return classRepository.findAllByOrderByClassCodeAsc().stream()
        .map(classEntity -> new ClassOptionResponse(
            classEntity.getId(),
            classEntity.getClassCode(),
            classEntity.getFacultyEntity() != null ? classEntity.getFacultyEntity().getCode() : null,
            classEntity.getFacultyEntity() != null ? classEntity.getFacultyEntity().getName() : null
        ))
        .toList();
  }

  private void validateLoginRequest(LoginRequest request) {
    if (request == null || !StringUtils.hasText(request.email()) || !StringUtils.hasText(
        request.password())) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Email và mật khẩu là bắt buộc.");
    }
  }

  private void validateRegisterRequest(RegisterRequest request) {
    if (request == null) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Dữ liệu đăng ký không hợp lệ.");
    }
    if (!StringUtils.hasText(request.email()) || !StringUtils.hasText(request.password())
        || !StringUtils.hasText(request.fullName()) || !StringUtils.hasText(request.studentCode())
        || Objects.isNull(request.classId())) {
      throw new ApiException(HttpStatus.BAD_REQUEST,
          "Thiếu thông tin bắt buộc: email, mật khẩu, họ tên, mã sinh viên, lớp.");
    }
    if (request.password().trim().length() < 6) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Mật khẩu phải có tối thiểu 6 ký tự.");
    }
  }

  private String normalizeUsername(String username, String email) {
    if (StringUtils.hasText(username)) {
      return username.trim().toLowerCase(Locale.ROOT);
    }
    int atIndex = email.indexOf("@");
    if (atIndex <= 0) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Email không hợp lệ.");
    }
    return email.substring(0, atIndex);
  }

  private void ensureAccountAvailable(UserEntity user) {
    UserStatus status = user.getStatus() == null ? UserStatus.ACTIVE : user.getStatus();
    if (status == UserStatus.LOCKED) {
      throw new ApiException(HttpStatus.FORBIDDEN, "Tài khoản đang bị khóa.");
    }
    if (status == UserStatus.DELETED) {
      throw new ApiException(HttpStatus.FORBIDDEN, "Tài khoản đã bị xóa.");
    }
  }

  private boolean passwordMatches(String rawPassword, String encodedPassword) {
    if (!StringUtils.hasText(rawPassword) || !StringUtils.hasText(encodedPassword)) {
      return false;
    }
    try {
      if (encodedPassword.startsWith("$2")) {
        return passwordEncoder.matches(rawPassword, encodedPassword);
      }
    } catch (Exception ignored) {
      // Fallback plain text check for legacy seeded data.
    }
    return encodedPassword.equals(rawPassword);
  }

  private AuthResponse mapAuthResponse(UserEntity user) {
    String effectiveRole = roleResolverService.resolveEffectiveRole(user);
    String dashboardPath = roleResolverService.resolveDashboardPath(effectiveRole);

    String displayName = user.getUsername();
    String classCode = null;
    if (user.getRole() == Role.ROLE_LECTURER) {
      LecturerEntity lecturer = lecturerRepository.findByUserEntityId(user.getId()).orElse(null);
      if (lecturer != null && StringUtils.hasText(lecturer.getFullName())) {
        displayName = lecturer.getFullName();
      }
    }
    if ("STUDENT".equals(effectiveRole) || "MONITOR".equals(effectiveRole)) {
      StudentEntity student = studentRepository.findByUserEntityId(user.getId()).orElse(null);
      if (student != null) {
        if (StringUtils.hasText(student.getFullName())) {
          displayName = student.getFullName();
        }
        if (student.getClassEntity() != null) {
          classCode = student.getClassEntity().getClassCode();
        }
      }
    }

    UserStatus status = user.getStatus() == null ? UserStatus.ACTIVE : user.getStatus();
    return new AuthResponse(
        user.getId(),
        user.getEmail(),
        user.getRole().name(),
        effectiveRole,
        displayName,
        dashboardPath,
        classCode,
        status.name()
    );
  }
}
