package ct01.unipoint.backend.service.impl;

import ct01.unipoint.backend.dto.common.SimpleMessageResponse;
import ct01.unipoint.backend.dto.lecturer.ImportStudentsResponse;
import ct01.unipoint.backend.dto.lecturer.LecturerStudentListResponse;
import ct01.unipoint.backend.dto.lecturer.LecturerStudentOptionsResponse;
import ct01.unipoint.backend.dto.lecturer.LecturerStudentOptionsResponse.ClassOptionItem;
import ct01.unipoint.backend.dto.lecturer.LecturerStudentOptionsResponse.FacultyOptionItem;
import ct01.unipoint.backend.dto.lecturer.LecturerStudentRowResponse;
import ct01.unipoint.backend.dto.lecturer.ManualCreateStudentRequest;
import ct01.unipoint.backend.entity.ActivityRecordEntity;
import ct01.unipoint.backend.entity.ClassEntity;
import ct01.unipoint.backend.entity.FacultyEntity;
import ct01.unipoint.backend.entity.SemesterEntity;
import ct01.unipoint.backend.entity.SemesterEvaluationEntity;
import ct01.unipoint.backend.entity.StudentEntity;
import ct01.unipoint.backend.entity.UserEntity;
import ct01.unipoint.backend.entity.enums.ActivityRecordStatus;
import ct01.unipoint.backend.entity.enums.Role;
import ct01.unipoint.backend.entity.enums.UserStatus;
import ct01.unipoint.backend.exception.ApiException;
import ct01.unipoint.backend.repository.ActivityRecordRepository;
import ct01.unipoint.backend.repository.ClassRepository;
import ct01.unipoint.backend.repository.EventRepository;
import ct01.unipoint.backend.repository.LecturerRepository;
import ct01.unipoint.backend.repository.SemesterEvaluationRepository;
import ct01.unipoint.backend.repository.SemesterRepository;
import ct01.unipoint.backend.repository.StudentRepository;
import ct01.unipoint.backend.repository.UserRepository;
import ct01.unipoint.backend.service.LecturerStudentService;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
public class LecturerStudentServiceImpl implements LecturerStudentService {

  private final LecturerRepository lecturerRepository;
  private final ClassRepository classRepository;
  private final StudentRepository studentRepository;
  private final UserRepository userRepository;
  private final SemesterRepository semesterRepository;
  private final SemesterEvaluationRepository semesterEvaluationRepository;
  private final EventRepository eventRepository;
  private final ActivityRecordRepository activityRecordRepository;
  private final PasswordEncoder passwordEncoder;

  public LecturerStudentServiceImpl(
      LecturerRepository lecturerRepository,
      ClassRepository classRepository,
      StudentRepository studentRepository,
      UserRepository userRepository,
      SemesterRepository semesterRepository,
      SemesterEvaluationRepository semesterEvaluationRepository,
      EventRepository eventRepository,
      ActivityRecordRepository activityRecordRepository,
      PasswordEncoder passwordEncoder
  ) {
    this.lecturerRepository = lecturerRepository;
    this.classRepository = classRepository;
    this.studentRepository = studentRepository;
    this.userRepository = userRepository;
    this.semesterRepository = semesterRepository;
    this.semesterEvaluationRepository = semesterEvaluationRepository;
    this.eventRepository = eventRepository;
    this.activityRecordRepository = activityRecordRepository;
    this.passwordEncoder = passwordEncoder;
  }

  @Override
  @Transactional(readOnly = true)
  public LecturerStudentOptionsResponse getOptions(Long lecturerId) {
    ensureLecturerExists(lecturerId);

    List<ClassEntity> lecturerClasses = classRepository.findByLecturerEntityId(lecturerId);
    Map<Long, FacultyOptionItem> facultyMap = new LinkedHashMap<>();
    List<ClassOptionItem> classItems = new ArrayList<>();

    for (ClassEntity classEntity : lecturerClasses) {
      FacultyEntity faculty = classEntity.getFacultyEntity();
      if (faculty != null && !facultyMap.containsKey(faculty.getId())) {
        facultyMap.put(faculty.getId(),
            new FacultyOptionItem(faculty.getId(), faculty.getCode(), faculty.getName()));
      }
      classItems.add(new ClassOptionItem(
          classEntity.getId(),
          classEntity.getClassCode(),
          faculty != null ? faculty.getId() : null,
          faculty != null ? faculty.getCode() : null
      ));
    }

    classItems.sort(Comparator.comparing(ClassOptionItem::classCode, String.CASE_INSENSITIVE_ORDER));
    return new LecturerStudentOptionsResponse(new ArrayList<>(facultyMap.values()), classItems);
  }

  @Override
  @Transactional(readOnly = true)
  public LecturerStudentListResponse getStudents(
      Long lecturerId,
      Long facultyId,
      Long classId,
      String status,
      String keyword
  ) {
    ensureLecturerExists(lecturerId);
    List<StudentEntity> students = studentRepository.findAllByLecturerIdWithDetails(lecturerId);

    UserStatus statusFilter = parseUserStatus(status, false);
    String normalizedKeyword = StringUtils.hasText(keyword) ? keyword.trim().toLowerCase(Locale.ROOT)
        : null;

    List<StudentEntity> filtered = students.stream()
        .filter(student -> facultyId == null || (student.getClassEntity() != null
            && student.getClassEntity().getFacultyEntity() != null
            && Objects.equals(student.getClassEntity().getFacultyEntity().getId(), facultyId)))
        .filter(student -> classId == null || (student.getClassEntity() != null
            && Objects.equals(student.getClassEntity().getId(), classId)))
        .filter(student -> statusFilter == null || normalizeStatus(student.getUserEntity().getStatus())
            == statusFilter)
        .filter(student -> matchesKeyword(student, normalizedKeyword))
        .toList();

    Optional<SemesterEntity> activeSemesterOpt = semesterRepository.findFirstByIsActiveTrueOrderByStartDateDesc();
    Map<Long, Integer> scoreByStudent = buildScoreMap(filtered, activeSemesterOpt);
    Map<Long, Integer> joinedMandatoryMap = buildMandatoryAttendanceMap(filtered, activeSemesterOpt);
    int mandatoryEvents = activeSemesterOpt.map(semester -> (int) eventRepository.countBySemester_Id(
        semester.getId())).orElse(0);

    List<LecturerStudentRowResponse> rows = filtered.stream()
        .map(student -> toRow(student, scoreByStudent, joinedMandatoryMap, mandatoryEvents))
        .sorted(Comparator.comparing(LecturerStudentRowResponse::fullName, String.CASE_INSENSITIVE_ORDER))
        .toList();

    int activeCount = (int) rows.stream().filter(row -> "ACTIVE".equals(row.accountStatus())).count();
    int lockedCount = (int) rows.stream().filter(row -> "LOCKED".equals(row.accountStatus())).count();
    int monitorCount = (int) rows.stream().filter(row -> "MONITOR".equals(row.role())).count();

    return new LecturerStudentListResponse(rows.size(), activeCount, lockedCount, monitorCount, rows);
  }

  @Override
  @Transactional
  public LecturerStudentRowResponse createManualStudent(Long lecturerId,
      ManualCreateStudentRequest request) {
    if (request == null || request.classId() == null || !StringUtils.hasText(request.fullName())
        || !StringUtils.hasText(request.email()) || !StringUtils.hasText(request.studentCode())) {
      throw new ApiException(HttpStatus.BAD_REQUEST,
          "Thiếu thông tin bắt buộc: lớp, họ tên, email, mã sinh viên.");
    }

    ClassEntity classEntity = classRepository.findByIdAndLecturerEntityId(request.classId(), lecturerId)
        .orElseThrow(() -> new ApiException(HttpStatus.FORBIDDEN,
            "Bạn không có quyền thêm sinh viên vào lớp này."));

    StudentEntity student = createStudentRecord(
        classEntity,
        request.fullName(),
        request.email(),
        request.studentCode(),
        request.username(),
        request.password(),
        false
    );

    return toRow(student, Map.of(), Map.of(), 0);
  }

  @Override
  @Transactional
  public ImportStudentsResponse importStudents(Long lecturerId, MultipartFile file) {
    if (file == null || file.isEmpty()) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Vui lòng chọn file Excel để import.");
    }

    ensureLecturerExists(lecturerId);

    int importedCount = 0;
    int skippedCount = 0;
    List<String> errors = new ArrayList<>();

    Map<String, ClassEntity> classByCode = classRepository.findByLecturerEntityId(lecturerId).stream()
        .collect(Collectors.toMap(
            classEntity -> classEntity.getClassCode().toUpperCase(Locale.ROOT),
            classEntity -> classEntity
        ));

    if (classByCode.isEmpty()) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Giảng viên chưa được phân lớp để import.");
    }

    DataFormatter formatter = new DataFormatter();
    try (InputStream inputStream = file.getInputStream();
        Workbook workbook = WorkbookFactory.create(inputStream)) {
      Sheet sheet = workbook.getSheetAt(0);
      for (int rowIndex = 1; rowIndex <= sheet.getLastRowNum(); rowIndex++) {
        Row row = sheet.getRow(rowIndex);
        if (row == null || isEmptyRow(row, formatter)) {
          continue;
        }

        String studentCode = getCellValue(row.getCell(0), formatter);
        String fullName = getCellValue(row.getCell(1), formatter);
        String email = getCellValue(row.getCell(2), formatter);
        String classCode = getCellValue(row.getCell(3), formatter);
        String username = getCellValue(row.getCell(4), formatter);
        String password = getCellValue(row.getCell(5), formatter);

        if (!StringUtils.hasText(studentCode) || !StringUtils.hasText(fullName)
            || !StringUtils.hasText(email) || !StringUtils.hasText(classCode)) {
          skippedCount++;
          errors.add("Dòng " + (rowIndex + 1)
              + ": Thiếu cột bắt buộc (studentCode, fullName, email, classCode).");
          continue;
        }

        ClassEntity classEntity = classByCode.get(classCode.trim().toUpperCase(Locale.ROOT));
        if (classEntity == null) {
          skippedCount++;
          errors.add("Dòng " + (rowIndex + 1) + ": Class code không thuộc giảng viên (" + classCode
              + ").");
          continue;
        }

        try {
          createStudentRecord(classEntity, fullName, email, studentCode, username, password, true);
          importedCount++;
        } catch (ApiException ex) {
          skippedCount++;
          errors.add("Dòng " + (rowIndex + 1) + ": " + ex.getMessage());
        }
      }
    } catch (Exception ex) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Không đọc được file Excel: " + ex.getMessage());
    }

    return new ImportStudentsResponse(importedCount, skippedCount, errors);
  }

  @Override
  @Transactional
  public LecturerStudentRowResponse assignMonitor(Long lecturerId, Long studentId) {
    StudentEntity student = studentRepository.findById(studentId)
        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy sinh viên."));

    ClassEntity classEntity = assertStudentBelongsToLecturer(student, lecturerId);
    classEntity.setMonitor(student);
    classRepository.save(classEntity);

    return toRow(student, Map.of(), Map.of(), 0);
  }

  @Override
  @Transactional
  public LecturerStudentRowResponse updateStudentStatus(Long lecturerId, Long studentId, String status) {
    UserStatus nextStatus = parseUserStatus(status, true);

    StudentEntity student = studentRepository.findById(studentId)
        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy sinh viên."));
    ClassEntity classEntity = assertStudentBelongsToLecturer(student, lecturerId);

    UserEntity user = student.getUserEntity();
    user.setStatus(nextStatus);
    userRepository.save(user);

    if (nextStatus == UserStatus.DELETED && classEntity.getMonitor() != null
        && Objects.equals(classEntity.getMonitor().getId(), student.getId())) {
      classEntity.setMonitor(null);
      classRepository.save(classEntity);
    }

    return toRow(student, Map.of(), Map.of(), 0);
  }

  @Override
  @Transactional
  public SimpleMessageResponse deleteStudent(Long lecturerId, Long studentId) {
    updateStudentStatus(lecturerId, studentId, UserStatus.DELETED.name());
    return new SimpleMessageResponse("Đã xóa mềm tài khoản sinh viên.");
  }

  private StudentEntity createStudentRecord(
      ClassEntity classEntity,
      String fullName,
      String email,
      String studentCode,
      String username,
      String password,
      boolean skipWhenDuplicate
  ) {
    String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);
    String normalizedStudentCode = studentCode.trim().toUpperCase(Locale.ROOT);
    String normalizedUsername = normalizeUsername(username, normalizedEmail);

    if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
      throw duplicateException(skipWhenDuplicate, "Email đã tồn tại: " + normalizedEmail);
    }
    if (userRepository.existsByUsernameIgnoreCase(normalizedUsername)) {
      throw duplicateException(skipWhenDuplicate, "Username đã tồn tại: " + normalizedUsername);
    }
    if (studentRepository.findByStudentCodeIgnoreCase(normalizedStudentCode).isPresent()) {
      throw duplicateException(skipWhenDuplicate, "Mã sinh viên đã tồn tại: " + normalizedStudentCode);
    }

    String rawPassword = StringUtils.hasText(password) ? password.trim() : "UniPoint@123";
    UserEntity user = UserEntity.builder()
        .username(normalizedUsername)
        .email(normalizedEmail)
        .password(passwordEncoder.encode(rawPassword))
        .role(Role.ROLE_STUDENT)
        .status(UserStatus.ACTIVE)
        .build();
    UserEntity savedUser = userRepository.save(user);

    StudentEntity student = StudentEntity.builder()
        .id(savedUser.getId())
        .userEntity(savedUser)
        .studentCode(normalizedStudentCode)
        .fullName(fullName.trim())
        .classEntity(classEntity)
        .build();
    return studentRepository.save(student);
  }

  private ApiException duplicateException(boolean skipWhenDuplicate, String message) {
    HttpStatus status = skipWhenDuplicate ? HttpStatus.BAD_REQUEST : HttpStatus.CONFLICT;
    return new ApiException(status, message);
  }

  private String normalizeUsername(String username, String email) {
    if (StringUtils.hasText(username)) {
      return username.trim().toLowerCase(Locale.ROOT);
    }
    int atIndex = email.indexOf('@');
    if (atIndex <= 0) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Email không hợp lệ để sinh username.");
    }
    return email.substring(0, atIndex).toLowerCase(Locale.ROOT);
  }

  private ClassEntity assertStudentBelongsToLecturer(StudentEntity student, Long lecturerId) {
    ClassEntity classEntity = student.getClassEntity();
    if (classEntity == null || classEntity.getLecturerEntity() == null || !Objects.equals(
        classEntity.getLecturerEntity().getId(), lecturerId)) {
      throw new ApiException(HttpStatus.FORBIDDEN, "Bạn không có quyền thao tác với sinh viên này.");
    }
    return classEntity;
  }

  private void ensureLecturerExists(Long lecturerId) {
    if (lecturerId == null || lecturerRepository.findById(lecturerId).isEmpty()) {
      throw new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy giảng viên.");
    }
  }

  private boolean matchesKeyword(StudentEntity student, String keyword) {
    if (!StringUtils.hasText(keyword)) {
      return true;
    }
    String fullName = StringUtils.hasText(student.getFullName()) ? student.getFullName()
        .toLowerCase(Locale.ROOT) : "";
    String studentCode = StringUtils.hasText(student.getStudentCode()) ? student.getStudentCode()
        .toLowerCase(Locale.ROOT) : "";
    String email = student.getUserEntity() != null && StringUtils.hasText(student.getUserEntity().getEmail())
        ? student.getUserEntity().getEmail().toLowerCase(Locale.ROOT) : "";
    return fullName.contains(keyword) || studentCode.contains(keyword) || email.contains(keyword);
  }

  private Map<Long, Integer> buildScoreMap(List<StudentEntity> students,
      Optional<SemesterEntity> activeSemesterOpt) {
    if (students.isEmpty() || activeSemesterOpt.isEmpty()) {
      return Map.of();
    }
    List<Long> studentIds = students.stream().map(StudentEntity::getId).toList();
    return semesterEvaluationRepository.findBySemester_IdAndStudent_IdIn(activeSemesterOpt.get().getId(),
            studentIds)
        .stream()
        .collect(Collectors.toMap(
            eval -> eval.getStudent().getId(),
            SemesterEvaluationEntity::getFinalScore,
            (first, second) -> first
        ));
  }

  private Map<Long, Integer> buildMandatoryAttendanceMap(List<StudentEntity> students,
      Optional<SemesterEntity> activeSemesterOpt) {
    if (students.isEmpty() || activeSemesterOpt.isEmpty()) {
      return Map.of();
    }
    List<Long> studentIds = students.stream().map(StudentEntity::getId).toList();
    List<ActivityRecordEntity> records =
        activityRecordRepository.findBySemester_IdAndStudent_IdInAndEventIsNotNullAndStatus(
            activeSemesterOpt.get().getId(),
            studentIds,
            ActivityRecordStatus.APPROVED
        );
    Map<Long, Integer> joinedMap = new HashMap<>();
    for (ActivityRecordEntity record : records) {
      Long studentId = record.getStudent().getId();
      joinedMap.put(studentId, joinedMap.getOrDefault(studentId, 0) + 1);
    }
    return joinedMap;
  }

  private LecturerStudentRowResponse toRow(
      StudentEntity student,
      Map<Long, Integer> scoreByStudent,
      Map<Long, Integer> joinedMandatoryMap,
      int mandatoryEvents
  ) {
    ClassEntity classEntity = student.getClassEntity();
    boolean isMonitor = classEntity != null && classEntity.getMonitor() != null
        && Objects.equals(classEntity.getMonitor().getId(), student.getId());

    Integer score = scoreByStudent.getOrDefault(student.getId(), 0);
    int joined = joinedMandatoryMap.getOrDefault(student.getId(), 0);
    String mandatoryStatus = mandatoryEvents > 0
        ? joined + "/" + mandatoryEvents + (joined >= mandatoryEvents ? " (Đạt)" : " (Thiếu)")
        : "Không có sự kiện bắt buộc";

    UserStatus status = normalizeStatus(student.getUserEntity().getStatus());
    FacultyEntity faculty = classEntity != null ? classEntity.getFacultyEntity() : null;

    return new LecturerStudentRowResponse(
        student.getId(),
        student.getFullName(),
        student.getUserEntity() != null ? student.getUserEntity().getEmail() : null,
        student.getStudentCode(),
        classEntity != null ? classEntity.getId() : null,
        classEntity != null ? classEntity.getClassCode() : null,
        faculty != null ? faculty.getCode() : null,
        faculty != null ? faculty.getName() : null,
        isMonitor ? "MONITOR" : "STUDENT",
        status.name(),
        score,
        mandatoryStatus
    );
  }

  private UserStatus normalizeStatus(UserStatus status) {
    return status == null ? UserStatus.ACTIVE : status;
  }

  private UserStatus parseUserStatus(String status, boolean required) {
    if (!StringUtils.hasText(status)) {
      if (required) {
        throw new ApiException(HttpStatus.BAD_REQUEST, "Status là bắt buộc.");
      }
      return null;
    }
    try {
      return UserStatus.valueOf(status.trim().toUpperCase(Locale.ROOT));
    } catch (IllegalArgumentException ex) {
      throw new ApiException(HttpStatus.BAD_REQUEST,
          "Status không hợp lệ. Chỉ chấp nhận ACTIVE/LOCKED/DELETED.");
    }
  }

  private boolean isEmptyRow(Row row, DataFormatter formatter) {
    for (int i = 0; i <= 5; i++) {
      Cell cell = row.getCell(i);
      if (StringUtils.hasText(getCellValue(cell, formatter))) {
        return false;
      }
    }
    return true;
  }

  private String getCellValue(Cell cell, DataFormatter formatter) {
    if (cell == null) {
      return "";
    }
    String value = formatter.formatCellValue(cell);
    return value == null ? "" : value.trim();
  }
}
