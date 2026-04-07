package ct01.n06.backend.service.impl;

import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import ct01.n06.backend.dto.admin.AdminStudentCreateRequest;
import ct01.n06.backend.dto.admin.AdminStudentListResponse;
import ct01.n06.backend.dto.admin.AdminStudentOptionsResponse;
import ct01.n06.backend.dto.admin.AdminStudentRowResponse;
import ct01.n06.backend.dto.admin.AdminStudentStatsResponse;
import ct01.n06.backend.dto.admin.AdminStudentUpdateRequest;
import ct01.n06.backend.entity.ClassEntity;
import ct01.n06.backend.entity.FacultyEntity;
import ct01.n06.backend.entity.StudentEntity;
import ct01.n06.backend.entity.UserEntity;
import ct01.n06.backend.entity.enums.Role;
import ct01.n06.backend.entity.enums.UserStatus;
import ct01.n06.backend.exception.ApiException;
import ct01.n06.backend.repository.ClassRepository;
import ct01.n06.backend.repository.FacultyRepository;
import ct01.n06.backend.repository.StudentRepository;
import ct01.n06.backend.repository.UserRepository;
import ct01.n06.backend.service.AdminStudentService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminStudentServiceImpl implements AdminStudentService {

  private static final DateTimeFormatter UI_DATE_TIME = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

  private final StudentRepository studentRepository;
  private final ClassRepository classRepository;
  private final FacultyRepository facultyRepository;
  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;

  @Override
  @Transactional(readOnly = true)
  public AdminStudentOptionsResponse getOptions() {
    List<AdminStudentOptionsResponse.FacultyOptionItem> faculties = facultyRepository.findAllByOrderByCodeAsc()
        .stream()
        .map(faculty -> new AdminStudentOptionsResponse.FacultyOptionItem(faculty.getId(), faculty.getCode(), faculty.getName()))
        .toList();

    List<AdminStudentOptionsResponse.ClassOptionItem> classes = classRepository.findAllByOrderByClassCodeAsc()
        .stream()
        .map(classEntity -> new AdminStudentOptionsResponse.ClassOptionItem(
            classEntity.getId(),
            classEntity.getClassCode(),
            classEntity.getFacultyEntity() != null ? classEntity.getFacultyEntity().getId() : null,
            classEntity.getFacultyEntity() != null ? classEntity.getFacultyEntity().getCode() : null,
            classEntity.getFacultyEntity() != null ? classEntity.getFacultyEntity().getName() : null,
            classEntity.getLecturerEntity() != null ? classEntity.getLecturerEntity().getFullName() : null
        ))
        .toList();

    return new AdminStudentOptionsResponse(faculties, classes);
  }

  @Override
  @Transactional(readOnly = true)
  public AdminStudentListResponse getStudents(Long facultyId, Long classId, String status, String keyword) {
    List<StudentEntity> students = studentRepository.findAllByOrderByFullNameAsc();
    UserStatus statusFilter = parseStatus(status, false);
    String normalizedKeyword = normalizeKeyword(keyword);

    List<StudentEntity> filtered = students.stream()
        .filter(student -> facultyId == null || (student.getClassEntity() != null
            && student.getClassEntity().getFacultyEntity() != null
            && Objects.equals(student.getClassEntity().getFacultyEntity().getId(), facultyId)))
        .filter(student -> classId == null || (student.getClassEntity() != null && Objects.equals(student.getClassEntity().getId(), classId)))
        .filter(student -> {
          UserStatus userStatus = normalizeStatus(student.getUserEntity().getStatus());
          return statusFilter == null ? userStatus != UserStatus.DELETED : userStatus == statusFilter;
        })
        .filter(student -> matchesKeyword(student, normalizedKeyword))
        .toList();

    List<AdminStudentRowResponse> rows = filtered.stream()
      .map(this::toRow)
        .toList();

    return new AdminStudentListResponse(
        rows.size(),
        (int) rows.stream().filter(row -> "ACTIVE".equals(row.status())).count(),
        (int) rows.stream().filter(row -> "LOCKED".equals(row.status())).count(),
        (int) rows.stream().filter(row -> "DELETED".equals(row.status())).count(),
        (int) rows.stream().filter(row -> "MONITOR".equals(row.role())).count(),
        rows
    );
  }

  @Override
  @Transactional(readOnly = true)
  public AdminStudentStatsResponse getStats() {
    List<StudentEntity> students = studentRepository.findAllByOrderByFullNameAsc();
    Map<Long, FacultyAccumulator> facultyMap = new LinkedHashMap<>();
    Map<Long, Integer> classCounts = new LinkedHashMap<>();

    for (StudentEntity student : students) {
      ClassEntity classEntity = student.getClassEntity();
      FacultyEntity faculty = classEntity != null ? classEntity.getFacultyEntity() : null;
      if (classEntity != null) {
        Long classId = classEntity.getId();
        classCounts.put(classId, classCounts.getOrDefault(classId, 0) + 1);
      }
      if (faculty == null) {
        continue;
      }

      FacultyAccumulator accumulator = facultyMap.computeIfAbsent(
          faculty.getId(),
          ignored -> new FacultyAccumulator(faculty.getId(), faculty.getCode(), faculty.getName())
      );
      accumulator.studentCount++;
      if (normalizeRole(student.getUserEntity().getRole()) == Role.ROLE_MONITOR) {
        accumulator.monitorCount++;
      }
    }

    List<AdminStudentRowResponse> recentStudents = students.stream()
        .sorted(Comparator.comparing(
            (StudentEntity student) -> student.getUserEntity().getCreatedAt(),
            Comparator.nullsLast(Comparator.naturalOrder()))
            .reversed())
        .limit(5)
        .map(this::toRow)
        .toList();

    List<AdminStudentStatsResponse.FacultyBreakdownItem> facultyItems = facultyMap.values().stream()
        .map(item -> new AdminStudentStatsResponse.FacultyBreakdownItem(
            item.facultyId,
            item.facultyCode,
            item.facultyName,
            item.studentCount,
            item.monitorCount))
        .toList();

    List<AdminStudentStatsResponse.ClassBreakdownItem> classBreakdown = classRepository.findAllByOrderByClassCodeAsc()
        .stream()
        .map(classEntity -> new AdminStudentStatsResponse.ClassBreakdownItem(
            classEntity.getId(),
            classEntity.getClassCode(),
            classEntity.getFacultyEntity() != null ? classEntity.getFacultyEntity().getName() : null,
            classEntity.getLecturerEntity() != null ? classEntity.getLecturerEntity().getFullName() : null,
            classCounts.getOrDefault(classEntity.getId(), 0)
        ))
        .toList();

    return new AdminStudentStatsResponse(
        students.size(),
        (int) students.stream().filter(student -> normalizeStatus(student.getUserEntity().getStatus()) == UserStatus.ACTIVE).count(),
        (int) students.stream().filter(student -> normalizeStatus(student.getUserEntity().getStatus()) == UserStatus.LOCKED).count(),
        (int) students.stream().filter(student -> normalizeStatus(student.getUserEntity().getStatus()) == UserStatus.DELETED).count(),
        (int) students.stream().filter(student -> normalizeRole(student.getUserEntity().getRole()) == Role.ROLE_MONITOR).count(),
        facultyItems.size(),
        classBreakdown.size(),
        facultyItems,
        classBreakdown,
        recentStudents
    );
  }

  @Override
  @Transactional
  public AdminStudentRowResponse createStudent(AdminStudentCreateRequest request) {
    if (request == null || !StringUtils.hasText(request.fullName()) || !StringUtils.hasText(request.studentCode())
        || !StringUtils.hasText(request.email()) || request.classId() == null) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Thiếu thông tin bắt buộc: họ tên, mã sinh viên, email, lớp.");
    }

    ClassEntity classEntity = classRepository.findById(request.classId())
        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy lớp được chọn."));

    String fullName = request.fullName().trim();
    String studentCode = request.studentCode().trim().toUpperCase(Locale.ROOT);
    String email = request.email().trim().toLowerCase(Locale.ROOT);
    String username = resolveUsername(request.username(), email, studentCode);
    UserStatus status = parseStatus(request.status(), true);
    Role role = parseRole(request.role());

    validateUniqueness(email, username, studentCode);

    UserEntity user = UserEntity.builder()
        .username(username)
        .email(email)
        .password(passwordEncoder.encode(resolvePassword(request.password())))
        .role(role)
        .status(status)
        .build();

    try {
      UserEntity savedUser = userRepository.save(user);
      StudentEntity savedStudent = studentRepository.save(StudentEntity.builder()
          .userEntity(savedUser)
          .studentCode(studentCode)
          .fullName(fullName)
          .classEntity(classEntity)
          .build());

      return toRow(savedStudent);
    } catch (DataIntegrityViolationException ex) {
      throw new ApiException(HttpStatus.CONFLICT, "Dữ liệu sinh viên bị trùng hoặc không hợp lệ.");
    }
  }

  @Override
  @Transactional
  public AdminStudentRowResponse updateStudent(String studentId, AdminStudentUpdateRequest request) {
    if (!StringUtils.hasText(studentId)) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Thiếu mã sinh viên cần cập nhật.");
    }
    if (request == null || !StringUtils.hasText(request.fullName()) || !StringUtils.hasText(request.studentCode())
        || !StringUtils.hasText(request.email()) || request.classId() == null) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Thiếu thông tin bắt buộc: họ tên, mã sinh viên, email, lớp.");
    }

    StudentEntity student = studentRepository.findById(studentId)
        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy sinh viên."));
    UserEntity user = student.getUserEntity();
    if (user == null) {
      throw new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy tài khoản sinh viên.");
    }

    ClassEntity classEntity = classRepository.findById(request.classId())
        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy lớp được chọn."));

    String fullName = request.fullName().trim();
    String studentCode = request.studentCode().trim().toUpperCase(Locale.ROOT);
    String email = request.email().trim().toLowerCase(Locale.ROOT);
    String username = StringUtils.hasText(request.username())
        ? request.username().trim().toLowerCase(Locale.ROOT)
        : user.getUsername();
    UserStatus status = parseStatus(request.status(), true);
    Role role = parseRole(request.role());

    validateUpdateUniqueness(student, user, email, username, studentCode);

    student.setFullName(fullName);
    student.setStudentCode(studentCode);
    student.setClassEntity(classEntity);

    user.setEmail(email);
    user.setUsername(username);
    user.setStatus(status);
    user.setRole(role);
    if (StringUtils.hasText(request.password())) {
      user.setPassword(passwordEncoder.encode(request.password().trim()));
    }

    try {
      userRepository.save(user);
      StudentEntity savedStudent = studentRepository.save(student);
      return toRow(savedStudent);
    } catch (DataIntegrityViolationException ex) {
      throw new ApiException(HttpStatus.CONFLICT, "Dữ liệu sinh viên bị trùng hoặc không hợp lệ.");
    }
  }

  @Override
  @Transactional
  public void deleteStudent(String studentId) {
    if (!StringUtils.hasText(studentId)) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Thiếu mã sinh viên cần xóa.");
    }

    StudentEntity student = studentRepository.findById(studentId)
        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy sinh viên."));

    UserEntity user = student.getUserEntity();
    if (user == null) {
      throw new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy tài khoản sinh viên.");
    }

    user.setStatus(UserStatus.DELETED);
    userRepository.save(user);
  }

  private AdminStudentRowResponse toRow(StudentEntity student) {
    UserEntity user = student.getUserEntity();
    ClassEntity classEntity = student.getClassEntity();
    return new AdminStudentRowResponse(
        student.getId(),
        student.getStudentCode(),
        student.getFullName(),
        user.getEmail(),
        user.getUsername(),
        normalizeStatus(user.getStatus()).name(),
        normalizeRole(user.getRole()).name().replace("ROLE_", ""),
        classEntity != null ? classEntity.getId() : null,
        classEntity != null ? classEntity.getClassCode() : null,
        classEntity != null && classEntity.getFacultyEntity() != null ? classEntity.getFacultyEntity().getId() : null,
        classEntity != null && classEntity.getFacultyEntity() != null ? classEntity.getFacultyEntity().getCode() : null,
        classEntity != null && classEntity.getFacultyEntity() != null ? classEntity.getFacultyEntity().getName() : null,
        classEntity != null && classEntity.getLecturerEntity() != null ? classEntity.getLecturerEntity().getFullName() : null,
        user.getCreatedAt() != null ? user.getCreatedAt().format(UI_DATE_TIME) : ""
    );
  }

  private String normalizeKeyword(String keyword) {
    return StringUtils.hasText(keyword) ? keyword.trim().toLowerCase(Locale.ROOT) : null;
  }

  private boolean matchesKeyword(StudentEntity student, String keyword) {
    if (keyword == null) {
      return true;
    }

    UserEntity user = student.getUserEntity();
    ClassEntity classEntity = student.getClassEntity();
    FacultyEntity faculty = classEntity != null ? classEntity.getFacultyEntity() : null;
    return contains(student.getFullName(), keyword)
        || contains(student.getStudentCode(), keyword)
        || contains(user.getEmail(), keyword)
        || contains(user.getUsername(), keyword)
        || contains(classEntity != null ? classEntity.getClassCode() : null, keyword)
        || contains(faculty != null ? faculty.getCode() : null, keyword)
        || contains(faculty != null ? faculty.getName() : null, keyword);
  }

  private boolean contains(String value, String keyword) {
    return value != null && value.toLowerCase(Locale.ROOT).contains(keyword);
  }

  private UserStatus parseStatus(String status, boolean allowDefaultActive) {
    if (!StringUtils.hasText(status)) {
      return allowDefaultActive ? UserStatus.ACTIVE : null;
    }

    try {
      return UserStatus.valueOf(status.trim().toUpperCase(Locale.ROOT));
    } catch (IllegalArgumentException ex) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Trạng thái không hợp lệ.");
    }
  }

  private Role parseRole(String role) {
    if (!StringUtils.hasText(role)) {
      return Role.ROLE_STUDENT;
    }
    String normalized = role.trim().toUpperCase(Locale.ROOT);
    if ("MONITOR".equals(normalized) || "ROLE_MONITOR".equals(normalized)) {
      return Role.ROLE_MONITOR;
    }
    return Role.ROLE_STUDENT;
  }

  private Role normalizeRole(Role role) {
    return role == null ? Role.ROLE_STUDENT : role;
  }

  private UserStatus normalizeStatus(UserStatus status) {
    return status == null ? UserStatus.ACTIVE : status;
  }

  private String resolvePassword(String password) {
    return StringUtils.hasText(password) ? password.trim() : "Student@123";
  }

  private String resolveUsername(String username, String email, String studentCode) {
    if (StringUtils.hasText(username)) {
      return username.trim().toLowerCase(Locale.ROOT);
    }
    String base = email.contains("@") ? email.substring(0, email.indexOf("@")) : studentCode.toLowerCase(Locale.ROOT);
    String sanitized = base.replaceAll("[^a-zA-Z0-9._-]", "").toLowerCase(Locale.ROOT);
    if (!StringUtils.hasText(sanitized)) {
      sanitized = studentCode.toLowerCase(Locale.ROOT);
    }
    return sanitized.length() > 50 ? sanitized.substring(0, 50) : sanitized;
  }

  private void validateUniqueness(String email, String username, String studentCode) {
    if (userRepository.existsByEmailIgnoreCase(email)) {
      throw new ApiException(HttpStatus.CONFLICT, "Email đã tồn tại: " + email);
    }
    if (userRepository.existsByUsernameIgnoreCase(username)) {
      throw new ApiException(HttpStatus.CONFLICT, "Username đã tồn tại: " + username);
    }
    if (studentRepository.findByStudentCodeIgnoreCase(studentCode).isPresent()) {
      throw new ApiException(HttpStatus.CONFLICT, "Mã sinh viên đã tồn tại: " + studentCode);
    }
  }

  private void validateUpdateUniqueness(
      StudentEntity currentStudent,
      UserEntity currentUser,
      String email,
      String username,
      String studentCode
  ) {
    userRepository.findByEmailIgnoreCase(email)
        .filter(other -> !Objects.equals(other.getId(), currentUser.getId()))
        .ifPresent(other -> {
          throw new ApiException(HttpStatus.CONFLICT, "Email đã tồn tại: " + email);
        });

    userRepository.findByUsernameIgnoreCase(username)
        .filter(other -> !Objects.equals(other.getId(), currentUser.getId()))
        .ifPresent(other -> {
          throw new ApiException(HttpStatus.CONFLICT, "Username đã tồn tại: " + username);
        });

    studentRepository.findByStudentCodeIgnoreCase(studentCode)
        .filter(other -> !Objects.equals(other.getId(), currentStudent.getId()))
        .ifPresent(other -> {
          throw new ApiException(HttpStatus.CONFLICT, "Mã sinh viên đã tồn tại: " + studentCode);
        });
  }

  private static final class FacultyAccumulator {
    private final Long facultyId;
    private final String facultyCode;
    private final String facultyName;
    private int studentCount;
    private int monitorCount;

    private FacultyAccumulator(Long facultyId, String facultyCode, String facultyName) {
      this.facultyId = facultyId;
      this.facultyCode = facultyCode;
      this.facultyName = facultyName;
    }
  }
}