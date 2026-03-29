package ct01.unipoint.backend.service.impl;

import ct01.unipoint.backend.dto.monitor.MonitorClassListResponse;
import ct01.unipoint.backend.dto.monitor.MonitorClassMemberResponse;
import ct01.unipoint.backend.entity.ActivityRecordEntity;
import ct01.unipoint.backend.entity.ClassEntity;
import ct01.unipoint.backend.entity.FacultyEntity;
import ct01.unipoint.backend.entity.SemesterEntity;
import ct01.unipoint.backend.entity.SemesterEvaluationEntity;
import ct01.unipoint.backend.entity.StudentEntity;
import ct01.unipoint.backend.entity.enums.ActivityRecordStatus;
import ct01.unipoint.backend.entity.enums.UserStatus;
import ct01.unipoint.backend.exception.ApiException;
import ct01.unipoint.backend.repository.ActivityRecordRepository;
import ct01.unipoint.backend.repository.ClassRepository;
import ct01.unipoint.backend.repository.EventRepository;
import ct01.unipoint.backend.repository.SemesterEvaluationRepository;
import ct01.unipoint.backend.repository.SemesterRepository;
import ct01.unipoint.backend.repository.StudentRepository;
import ct01.unipoint.backend.service.MonitorClassService;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MonitorClassServiceImpl implements MonitorClassService {

  private final StudentRepository studentRepository;
  private final ClassRepository classRepository;
  private final SemesterRepository semesterRepository;
  private final SemesterEvaluationRepository semesterEvaluationRepository;
  private final ActivityRecordRepository activityRecordRepository;
  private final EventRepository eventRepository;

  public MonitorClassServiceImpl(
      StudentRepository studentRepository,
      ClassRepository classRepository,
      SemesterRepository semesterRepository,
      SemesterEvaluationRepository semesterEvaluationRepository,
      ActivityRecordRepository activityRecordRepository,
      EventRepository eventRepository
  ) {
    this.studentRepository = studentRepository;
    this.classRepository = classRepository;
    this.semesterRepository = semesterRepository;
    this.semesterEvaluationRepository = semesterEvaluationRepository;
    this.activityRecordRepository = activityRecordRepository;
    this.eventRepository = eventRepository;
  }

  @Override
  @Transactional(readOnly = true)
  public MonitorClassListResponse getManagedClassMembers(Long monitorUserId) {
    StudentEntity monitorStudent = studentRepository.findByUserEntityId(monitorUserId)
        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy tài khoản Monitor."));

    ClassEntity managedClass = classRepository.findByMonitor_Id(monitorStudent.getId())
        .orElseThrow(() -> new ApiException(HttpStatus.FORBIDDEN,
            "Tài khoản hiện tại không được gán quyền Monitor."));

    List<StudentEntity> members = studentRepository.findAllByClassIdWithDetails(managedClass.getId());
    Optional<SemesterEntity> activeSemesterOpt = semesterRepository.findFirstByIsActiveTrueOrderByStartDateDesc();

    Map<Long, Integer> scoreByStudent = buildScoreMap(members, activeSemesterOpt);
    Map<Long, Integer> joinedMap = buildMandatoryAttendanceMap(members, activeSemesterOpt);
    int mandatoryEvents = activeSemesterOpt.map(semester -> (int) eventRepository.countBySemester_Id(
        semester.getId())).orElse(0);

    List<MonitorClassMemberResponse> rows = members.stream()
        .map(student -> mapMember(student, managedClass, scoreByStudent, joinedMap, mandatoryEvents))
        .sorted(Comparator.comparing(MonitorClassMemberResponse::fullName, String.CASE_INSENSITIVE_ORDER))
        .toList();

    FacultyEntity faculty = managedClass.getFacultyEntity();
    return new MonitorClassListResponse(
        managedClass.getClassCode(),
        faculty != null ? faculty.getName() : null,
        rows.size(),
        rows
    );
  }

  private MonitorClassMemberResponse mapMember(
      StudentEntity student,
      ClassEntity managedClass,
      Map<Long, Integer> scoreByStudent,
      Map<Long, Integer> joinedMap,
      int mandatoryEvents
  ) {
    int joined = joinedMap.getOrDefault(student.getId(), 0);
    String mandatoryParticipation = mandatoryEvents > 0
        ? joined + "/" + mandatoryEvents + (joined >= mandatoryEvents ? " (Đạt)" : " (Thiếu)")
        : "Không có sự kiện bắt buộc";
    UserStatus userStatus =
        student.getUserEntity() != null && student.getUserEntity().getStatus() != null
            ? student.getUserEntity().getStatus() : UserStatus.ACTIVE;

    return new MonitorClassMemberResponse(
        student.getId(),
        student.getStudentCode(),
        student.getFullName(),
        student.getUserEntity() != null ? student.getUserEntity().getEmail() : null,
        scoreByStudent.getOrDefault(student.getId(), 0),
        mandatoryParticipation,
        managedClass.getMonitor() != null && Objects.equals(managedClass.getMonitor().getId(),
            student.getId()),
        userStatus.name()
    );
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
}
