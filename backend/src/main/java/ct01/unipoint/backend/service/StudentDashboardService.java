package ct01.unipoint.backend.service;

import ct01.unipoint.backend.dto.student.StudentDashboardResponse;
import ct01.unipoint.backend.dto.student.StudentDashboardResponse.ActivityHistoryItem;
import ct01.unipoint.backend.dto.student.StudentDashboardResponse.UpcomingEventItem;
import ct01.unipoint.backend.entity.ActivityRecordEntity;
import ct01.unipoint.backend.entity.EventEntity;
import ct01.unipoint.backend.entity.SemesterEntity;
import ct01.unipoint.backend.entity.SemesterEvaluationEntity;
import ct01.unipoint.backend.entity.StudentEntity;
import ct01.unipoint.backend.exception.ApiException;
import ct01.unipoint.backend.repository.ActivityRecordRepository;
import ct01.unipoint.backend.repository.EventRepository;
import ct01.unipoint.backend.repository.SemesterEvaluationRepository;
import ct01.unipoint.backend.repository.SemesterRepository;
import ct01.unipoint.backend.repository.StudentRepository;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
public class StudentDashboardService {

  private static final DateTimeFormatter UI_TIME_FORMAT = DateTimeFormatter.ofPattern(
      "dd/MM/yyyy HH:mm");

  private final StudentRepository studentRepository;
  private final SemesterRepository semesterRepository;
  private final SemesterEvaluationRepository semesterEvaluationRepository;
  private final ActivityRecordRepository activityRecordRepository;
  private final EventRepository eventRepository;

  public StudentDashboardService(
      StudentRepository studentRepository,
      SemesterRepository semesterRepository,
      SemesterEvaluationRepository semesterEvaluationRepository,
      ActivityRecordRepository activityRecordRepository,
      EventRepository eventRepository
  ) {
    this.studentRepository = studentRepository;
    this.semesterRepository = semesterRepository;
    this.semesterEvaluationRepository = semesterEvaluationRepository;
    this.activityRecordRepository = activityRecordRepository;
    this.eventRepository = eventRepository;
  }

  @Transactional(readOnly = true)
  public StudentDashboardResponse getDashboard(Long userId) {
    StudentEntity student = studentRepository.findByUserEntityId(userId)
        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy thông tin sinh viên."));

    Optional<SemesterEntity> activeSemesterOpt = semesterRepository.findFirstByIsActiveTrueOrderByStartDateDesc();
    Integer totalScore = 0;
    int joinedActivities = 0;
    if (activeSemesterOpt.isPresent()) {
      Long semesterId = activeSemesterOpt.get().getId();
      totalScore = semesterEvaluationRepository.findBySemester_IdAndStudent_Id(semesterId, student.getId())
          .map(SemesterEvaluationEntity::getFinalScore)
          .orElse(0);
      joinedActivities = (int) activityRecordRepository.countByStudent_IdAndSemester_Id(student.getId(),
          semesterId);
    }

    List<UpcomingEventItem> upcomingEvents = activeSemesterOpt
        .map(semester -> eventRepository.findTop5BySemester_IdAndStartTimeAfterOrderByStartTimeAsc(
                semester.getId(), LocalDateTime.now())
            .stream()
            .map(this::toUpcomingItem)
            .toList())
        .orElse(List.of());

    List<ActivityHistoryItem> history = activityRecordRepository.findTop10ByStudent_IdOrderByCreatedAtDesc(
            student.getId())
        .stream()
        .map(this::toHistoryItem)
        .toList();

    return new StudentDashboardResponse(
        student.getFullName(),
        student.getStudentCode(),
        student.getClassEntity() != null ? student.getClassEntity().getClassCode() : null,
        student.getClassEntity() != null && student.getClassEntity().getFacultyEntity() != null
            ? student.getClassEntity().getFacultyEntity().getName() : null,
        totalScore,
        joinedActivities,
        rankLabel(totalScore),
        upcomingEvents,
        history
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

  private ActivityHistoryItem toHistoryItem(ActivityRecordEntity record) {
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

    String createdAt = record.getCreatedAt() != null ? record.getCreatedAt().format(UI_TIME_FORMAT)
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
}
