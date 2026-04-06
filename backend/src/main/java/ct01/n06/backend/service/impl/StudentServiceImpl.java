package ct01.n06.backend.service.impl;

import ct01.n06.backend.repository.AttendenceRepository;
import ct01.n06.backend.repository.EventRepository;
import ct01.n06.backend.repository.RecordRepository;
import ct01.n06.backend.repository.SemesterRepository;
import ct01.n06.backend.repository.StudentRepository;
import ct01.n06.backend.repository.StudentSemesterRepository;
import ct01.n06.backend.dto.student.StudentDashboardResponse;
import ct01.n06.backend.dto.student.StudentDashboardResponse.ActivityHistoryItem;
import ct01.n06.backend.dto.student.StudentDashboardResponse.UpcomingEventItem;
import ct01.n06.backend.dto.student.StudentDashboardResponse.AttendedEventItem;
import ct01.n06.backend.entity.EventEntity;
import ct01.n06.backend.entity.RecordEntity;
import ct01.n06.backend.entity.SemesterEntity;
import ct01.n06.backend.entity.StudentEntity;
import ct01.n06.backend.entity.StudentSemesterEntity;
import ct01.n06.backend.entity.UserEntity;
import ct01.n06.backend.exception.ApiException;
import ct01.n06.backend.exception.business.ResourceNotFoundException;
import ct01.n06.backend.service.StudentService;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@AllArgsConstructor
public class StudentServiceImpl implements StudentService {

  private static final DateTimeFormatter UI_TIME_FORMAT =
      DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

  private final StudentRepository studentRepository;
  private final SemesterRepository semesterRepository;
  private final StudentSemesterRepository studentSemesterRepository;
  private final RecordRepository recordRepository;
  private final EventRepository eventRepository;
  private final AttendenceRepository attendenceRepository;

  @Override
  public StudentEntity getStudentByUser(UserEntity userEntity) {
    return studentRepository.findByUserEntity(userEntity).orElseThrow();
  }

  @Override
  @Transactional(readOnly = true)
  public StudentDashboardResponse getDashboard(String userId) {
    StudentEntity student = studentRepository.findByUserEntityId(userId)
        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy thông tin sinh viên."));

    Optional<SemesterEntity> activeSemesterOpt = semesterRepository.findFirstByIsActiveTrueOrderByStartDateDesc();

    Integer totalScore = 0;
    int joinedActivities = 0;
    if (activeSemesterOpt.isPresent()) {
      Long semesterId = activeSemesterOpt.get().getId();
      totalScore = studentSemesterRepository.findBySemester_IdAndStudent_Id(semesterId, student.getId())
          .map(StudentSemesterEntity::getFinalScore)
          .orElse(0);
      joinedActivities = (int) recordRepository.countByStudent_IdAndSemester_Id(student.getId(), semesterId);
    }

    List<UpcomingEventItem> upcomingEvents = activeSemesterOpt
        .map(semester -> eventRepository.findTop5BySemester_IdAndStartTimeAfterOrderByStartTimeAsc(
                semester.getId(), LocalDateTime.now())
            .stream()
            .map(this::toUpcomingItem)
            .toList())
        .orElse(List.of());

    List<ActivityHistoryItem> history = recordRepository.findTop10ByStudent_IdOrderByCreatedAtDesc(student.getId())
        .stream()
        .map(this::toHistoryItem)
        .toList();

    String classCode = student.getClassEntity() != null ? student.getClassEntity().getClassCode() : null;
    String facultyName = student.getClassEntity() != null && student.getClassEntity().getFacultyEntity() != null
        ? student.getClassEntity().getFacultyEntity().getName()
        : null;

    List<AttendedEventItem> attendedEvents = attendenceRepository.findTop10ByStudentIdOrderByCreatedAtDesc(student.getId())
        .stream()
        .map(this::toAttendedItem)
        .toList();

    return new StudentDashboardResponse(
        student.getFullName(),
        student.getStudentCode(),
        classCode,
        facultyName,
        totalScore,
        joinedActivities,
        rankLabel(totalScore),
        upcomingEvents,
        history,
        attendedEvents
    );
  }

  private UpcomingEventItem toUpcomingItem(EventEntity event) {
    return new UpcomingEventItem(
        event.getId(),
        event.getTitle(),
        event.getLocation(),
        event.getStartTime() != null ? event.getStartTime().format(UI_TIME_FORMAT) : null
    );
  }

  private AttendedEventItem toAttendedItem(ct01.n06.backend.entity.AttendenceEntity attendance) {
    return new AttendedEventItem(
        attendance.getEvent() != null ? attendance.getEvent().getId() : null,
        attendance.getEvent() != null ? attendance.getEvent().getTitle() : null,
        attendance.getEvent() != null ? attendance.getEvent().getLocation() : null,
        attendance.getCreatedAt() != null ? attendance.getCreatedAt().format(UI_TIME_FORMAT) : null
    );
  }

  private ActivityHistoryItem toHistoryItem(RecordEntity record) {
    String title = null;
    if (record.getEvent() != null && StringUtils.hasText(record.getEvent().getTitle())) {
      title = record.getEvent().getTitle();
    }
    if (!StringUtils.hasText(title) && StringUtils.hasText(record.getCustomName())) {
      title = record.getCustomName();
    }
    if (!StringUtils.hasText(title)) {
      title = "Hoạt động rèn luyện";
    }

    String createdAt = record.getCreatedAt() != null
        ? record.getCreatedAt().format(UI_TIME_FORMAT)
        : null;

    return new ActivityHistoryItem(
        record.getId(),
        title,
        record.getStatus() != null ? record.getStatus().name() : "PENDING",
        createdAt
    );
  }

  private String rankLabel(Integer score) {
    int safeScore = score == null ? 0 : score;
    if (safeScore >= 90) {
      return "Xuất sắc";
    }
    if (safeScore >= 80) {
      return "Tốt";
    }
    if (safeScore >= 65) {
      return "Khá";
    }
    if (safeScore >= 50) {
      return "Trung bình";
    }
    return "Cần cải thiện";
  }

  @Override
  public StudentEntity getStudentByUsername(final String username) {
    return this.studentRepository.findByUserEntity_Username(username)
        .orElseThrow(() -> new ResourceNotFoundException("Student profile for user: " + username));
  }

  @Override
  public List<StudentEntity> getStudentsByClassId(final Long classId) {
    return this.studentRepository.findByClassEntity_Id(classId);
  }
}
