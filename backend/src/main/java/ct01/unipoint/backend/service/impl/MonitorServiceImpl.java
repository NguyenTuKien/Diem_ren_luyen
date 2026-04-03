package ct01.unipoint.backend.service.impl;

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

import ct01.unipoint.backend.dto.monitor.MonitorClassListResponse;
import ct01.unipoint.backend.dto.monitor.MonitorClassMemberResponse;
import ct01.unipoint.backend.entity.ClassEntity;
import ct01.unipoint.backend.entity.FacultyEntity;
import ct01.unipoint.backend.entity.RecordEntity;
import ct01.unipoint.backend.entity.SemesterEntity;
import ct01.unipoint.backend.entity.StudentSemesterEntity;
import ct01.unipoint.backend.entity.StudentEntity;
import ct01.unipoint.backend.entity.enums.RecordStatus;
import ct01.unipoint.backend.entity.enums.UserStatus;
import ct01.unipoint.backend.exception.ApiException;
import ct01.unipoint.backend.dao.RecordDao;
import ct01.unipoint.backend.dao.ClassDao;
import ct01.unipoint.backend.dao.EventDao;
import ct01.unipoint.backend.dao.StudentSemesterDao;
import ct01.unipoint.backend.dao.SemesterDao;
import ct01.unipoint.backend.dao.StudentDao;
import ct01.unipoint.backend.service.MonitorService;

@Service
public class MonitorServiceImpl implements MonitorService {

  private final StudentDao studentDao;
  private final ClassDao classDao;
  private final SemesterDao semesterDao;
  private final StudentSemesterDao studentSemesterDao;
  private final RecordDao recordDao;
  private final EventDao eventDao;

  public MonitorServiceImpl(
      StudentDao studentDao,
      ClassDao classDao,
      SemesterDao semesterDao,
      StudentSemesterDao studentSemesterDao,
      RecordDao recordDao,
      EventDao eventDao
  ) {
    this.studentDao = studentDao;
    this.classDao = classDao;
    this.semesterDao = semesterDao;
    this.studentSemesterDao = studentSemesterDao;
    this.recordDao = recordDao;
    this.eventDao = eventDao;
  }

  @Override
  @Transactional(readOnly = true)
  public MonitorClassListResponse getManagedClassMembers(Long monitorUserId) {
    StudentEntity monitorStudent = studentDao.findByUserEntityId(monitorUserId)
        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy tài khoản Monitor."));

    ClassEntity managedClass = classDao.findByMonitor_Id(monitorStudent.getId())
        .orElseThrow(() -> new ApiException(HttpStatus.FORBIDDEN,
            "Tài khoản hiện tại không được gán quyền Monitor."));

    List<StudentEntity> members = studentDao.findAllByClassIdWithDetails(managedClass.getId());
    Optional<SemesterEntity> activeSemesterOpt = semesterDao.findFirstByIsActiveTrueOrderByStartDateDesc();

    Map<Long, Integer> scoreByStudent = buildScoreMap(members, activeSemesterOpt);
    Map<Long, Integer> joinedMap = buildMandatoryAttendanceMap(members, activeSemesterOpt);
    int mandatoryEvents = activeSemesterOpt.map(semester -> (int) eventDao.countBySemester_Id(
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
    return studentSemesterDao.findBySemester_IdAndStudent_IdIn(activeSemesterOpt.get().getId(),
            studentIds)
        .stream()
        .collect(Collectors.toMap(
            eval -> eval.getStudent().getId(),
        StudentSemesterEntity::getFinalScore,
            (first, second) -> first
        ));
  }

  private Map<Long, Integer> buildMandatoryAttendanceMap(List<StudentEntity> students,
      Optional<SemesterEntity> activeSemesterOpt) {
    if (students.isEmpty() || activeSemesterOpt.isEmpty()) {
      return Map.of();
    }
    List<Long> studentIds = students.stream().map(StudentEntity::getId).toList();
    List<RecordEntity> records =
      recordDao.findBySemester_IdAndStudent_IdInAndEventIsNotNullAndStatus(
            activeSemesterOpt.get().getId(),
            studentIds,
        RecordStatus.APPROVED
        );
    Map<Long, Integer> joinedMap = new HashMap<>();
    for (RecordEntity record : records) {
      Long studentId = record.getStudent().getId();
      joinedMap.put(studentId, joinedMap.getOrDefault(studentId, 0) + 1);
    }
    return joinedMap;
  }
}
