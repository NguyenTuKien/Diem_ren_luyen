package ct01.unipoint.backend.controller;

import ct01.unipoint.backend.dao.LecturerDao;
import ct01.unipoint.backend.dao.UserDao;
import ct01.unipoint.backend.dto.common.SimpleMessageResponse;
import ct01.unipoint.backend.dto.lecturer.ImportStudentsResponse;
import ct01.unipoint.backend.dto.lecturer.LecturerStudentListResponse;
import ct01.unipoint.backend.dto.lecturer.LecturerStudentOptionsResponse;
import ct01.unipoint.backend.dto.lecturer.LecturerStudentRowResponse;
import ct01.unipoint.backend.dto.lecturer.ManualCreateStudentRequest;
import ct01.unipoint.backend.dto.lecturer.UpdateStudentStatusRequest;
import ct01.unipoint.backend.entity.LecturerEntity;
import ct01.unipoint.backend.entity.UserEntity;
import ct01.unipoint.backend.entity.enums.Role;
import ct01.unipoint.backend.exception.ApiException;
import ct01.unipoint.backend.service.LecturerStudentService;
import java.util.Objects;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/lecturer/students")
public class LecturerStudentController {

  private final LecturerStudentService lecturerStudentService;
  private final UserDao userRepository;
  private final LecturerDao lecturerRepository;

  public LecturerStudentController(
      LecturerStudentService lecturerStudentService,
      UserDao userRepository,
      LecturerDao lecturerRepository
  ) {
    this.lecturerStudentService = lecturerStudentService;
    this.userRepository = userRepository;
    this.lecturerRepository = lecturerRepository;
  }

  @GetMapping("/options")
  public LecturerStudentOptionsResponse options(@RequestParam String lecturerId) {
    String resolvedLecturerId = ensureLecturerAccess(lecturerId);
    return lecturerStudentService.getOptions(resolvedLecturerId);
  }

  @GetMapping
  public LecturerStudentListResponse list(
      @RequestParam String lecturerId,
      @RequestParam(required = false) Long facultyId,
      @RequestParam(required = false) Long classId,
      @RequestParam(required = false) String status,
      @RequestParam(required = false) String keyword
  ) {
    String resolvedLecturerId = ensureLecturerAccess(lecturerId);
    return lecturerStudentService.getStudents(resolvedLecturerId, facultyId, classId, status, keyword);
  }

  @PostMapping("/manual")
  public LecturerStudentRowResponse createManual(
      @RequestParam String lecturerId,
      @RequestBody ManualCreateStudentRequest request
  ) {
    String resolvedLecturerId = ensureLecturerAccess(lecturerId);
    return lecturerStudentService.createManualStudent(resolvedLecturerId, request);
  }

  @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ImportStudentsResponse importExcel(
      @RequestParam String lecturerId,
      @RequestPart("file") MultipartFile file
  ) {
    String resolvedLecturerId = ensureLecturerAccess(lecturerId);
    return lecturerStudentService.importStudents(resolvedLecturerId, file);
  }

  @PutMapping("/{studentId}/monitor")
  public LecturerStudentRowResponse assignMonitor(
      @RequestParam String lecturerId,
      @PathVariable String studentId
  ) {
    String resolvedLecturerId = ensureLecturerAccess(lecturerId);
    return lecturerStudentService.assignMonitor(resolvedLecturerId, studentId);
  }

  @PutMapping("/{studentId}/status")
  public LecturerStudentRowResponse updateStatus(
      @RequestParam String lecturerId,
      @PathVariable String studentId,
      @RequestBody UpdateStudentStatusRequest request
  ) {
    String resolvedLecturerId = ensureLecturerAccess(lecturerId);
    return lecturerStudentService.updateStudentStatus(resolvedLecturerId, studentId, request.status());
  }

  @DeleteMapping("/{studentId}")
  public SimpleMessageResponse delete(
      @RequestParam String lecturerId,
      @PathVariable String studentId
  ) {
    String resolvedLecturerId = ensureLecturerAccess(lecturerId);
    return lecturerStudentService.deleteStudent(resolvedLecturerId, studentId);
  }

  private String ensureLecturerAccess(String requestedLecturerId) {
    UserEntity currentUser = resolveCurrentUser();
    LecturerEntity lecturer = lecturerRepository.findByUserEntityId(currentUser.getId())
        .orElseGet(() -> provisionLecturerProfile(currentUser));

    boolean matchesLecturerId = Objects.equals(lecturer.getId(), requestedLecturerId);
    boolean matchesUserId = Objects.equals(currentUser.getId(), requestedLecturerId);

    if (!matchesLecturerId && !matchesUserId) {
      throw new ApiException(HttpStatus.FORBIDDEN, "Bạn không có quyền truy cập dữ liệu này.");
    }

    return lecturer.getId();
  }

  private UserEntity resolveCurrentUser() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    if (authentication == null || !authentication.isAuthenticated()) {
      throw new ApiException(HttpStatus.UNAUTHORIZED, "Chưa xác thực.");
    }

    String principal = authentication.getName();
    UserEntity user = userRepository.findByUsernameIgnoreCase(principal)
        .or(() -> userRepository.findByEmailIgnoreCase(principal))
        .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Phiên đăng nhập không hợp lệ."));

    return user;
  }

  private LecturerEntity provisionLecturerProfile(UserEntity user) {
    if (user.getRole() != Role.ROLE_LECTURER && user.getRole() != Role.ROLE_ADMIN) {
      throw new ApiException(HttpStatus.FORBIDDEN, "Bạn không có quyền giảng viên.");
    }

    String displayName = StringUtils.hasText(user.getUsername())
        ? user.getUsername()
        : ("Giảng viên " + user.getId());
    String lecturerCode = "LC" + user.getId();

    LecturerEntity lecturer = LecturerEntity.builder()
        .userEntity(user)
        .lecturerCode(lecturerCode)
        .fullName(displayName)
        .build();

    return lecturerRepository.save(lecturer);
  }
}

