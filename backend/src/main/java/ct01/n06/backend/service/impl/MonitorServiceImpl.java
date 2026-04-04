package ct01.n06.backend.service.impl;

import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

import ct01.n06.backend.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import ct01.n06.backend.dto.monitor.MonitorClassListResponse;
import ct01.n06.backend.dto.monitor.MonitorClassMemberResponse;
import ct01.n06.backend.entity.ClassEntity;
import ct01.n06.backend.entity.FacultyEntity;
import ct01.n06.backend.entity.RecordEntity;
import ct01.n06.backend.entity.SemesterEntity;
import ct01.n06.backend.entity.StudentSemesterEntity;
import ct01.n06.backend.entity.StudentEntity;
import ct01.n06.backend.entity.enums.RecordStatus;
import ct01.n06.backend.entity.enums.UserStatus;
import ct01.n06.backend.exception.ApiException;
import ct01.n06.backend.service.MonitorService;

@Service
public class MonitorServiceImpl implements MonitorService {

  private final StudentRepository studentRepository;
  private final ClassRepository classRepository;
  private final SemesterRepository semesterRepository;
  private final StudentSemesterRepository studentSemesterRepository;
  private final RecordRepository recordRepository;
  private final EventRepository eventRepository;

  public MonitorServiceImpl(
      StudentRepository studentRepository,
      ClassRepository classRepository,
      SemesterRepository semesterRepository,
      StudentSemesterRepository studentSemesterRepository,
      RecordRepository recordRepository,
      EventRepository eventRepository
  ) {
    this.studentRepository = studentRepository;
    this.classRepository = classRepository;
    this.semesterRepository = semesterRepository;
    this.studentSemesterRepository = studentSemesterRepository;
    this.recordRepository = recordRepository;
    this.eventRepository = eventRepository;
  }

  @Override
  @Transactional(readOnly = true)
  public MonitorClassListResponse getManagedClassMembers(String monitorUserId) {
    StudentEntity monitorStudent = studentRepository.findByUserEntityId(monitorUserId)
        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy tài khoản Monitor."));

    ClassEntity managedClass = classRepository.findByMonitor_Id(monitorStudent.getId())
        .orElseThrow(() -> new ApiException(HttpStatus.FORBIDDEN,
            "Tài khoản hiện tại không được gán quyền Monitor."));

    List<StudentEntity> members = studentRepository.findAllByClassEntityId(managedClass.getId());
    Optional<SemesterEntity> activeSemesterOpt = semesterRepository.findFirstByIsActiveTrueOrderByStartDateDesc();

    Map<String, Integer> scoreByStudent = buildScoreMap(members, activeSemesterOpt);
    Map<String, Integer> joinedMap = buildMandatoryAttendanceMap(members, activeSemesterOpt);
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
      Map<String, Integer> scoreByStudent,
      Map<String, Integer> joinedMap,
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

  private Map<String, Integer> buildScoreMap(List<StudentEntity> students,
      Optional<SemesterEntity> activeSemesterOpt) {
    if (students.isEmpty() || activeSemesterOpt.isEmpty()) {
      return Map.of();
    }
    List<String> studentIds = students.stream().map(StudentEntity::getId).toList();
    return studentSemesterRepository.findBySemester_IdAndStudent_IdIn(activeSemesterOpt.get().getId(),
            studentIds)
        .stream()
        .collect(Collectors.toMap(
            eval -> eval.getStudent().getId(),
        StudentSemesterEntity::getFinalScore,
            (first, second) -> first
        ));
  }

  private Map<String, Integer> buildMandatoryAttendanceMap(List<StudentEntity> students,
      Optional<SemesterEntity> activeSemesterOpt) {
    if (students.isEmpty() || activeSemesterOpt.isEmpty()) {
      return Map.of();
    }
    List<String> studentIds = students.stream().map(StudentEntity::getId).toList();
    List<RecordEntity> records =
      recordRepository.findBySemester_IdAndStudent_IdInAndEventIsNotNullAndStatus(
            activeSemesterOpt.get().getId(),
            studentIds,
        RecordStatus.APPROVED
        );
    Map<String, Integer> joinedMap = new HashMap<>();
    for (RecordEntity record : records) {
      String studentId = record.getStudent().getId();
      joinedMap.put(studentId, joinedMap.getOrDefault(studentId, 0) + 1);
    }
    return joinedMap;
  }
}
