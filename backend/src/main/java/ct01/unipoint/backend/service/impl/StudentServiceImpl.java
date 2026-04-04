package ct01.unipoint.backend.service.impl;

import ct01.unipoint.backend.dao.EventDao;
import ct01.unipoint.backend.dao.RecordDao;
import ct01.unipoint.backend.dao.SemesterDao;
import ct01.unipoint.backend.dao.StudentDao;
import ct01.unipoint.backend.dao.StudentSemesterDao;
import ct01.unipoint.backend.dto.student.StudentDashboardResponse;
import ct01.unipoint.backend.dto.student.StudentDashboardResponse.ActivityHistoryItem;
import ct01.unipoint.backend.dto.student.StudentDashboardResponse.UpcomingEventItem;
import ct01.unipoint.backend.entity.EventEntity;
import ct01.unipoint.backend.entity.RecordEntity;
import ct01.unipoint.backend.entity.SemesterEntity;
import ct01.unipoint.backend.entity.StudentEntity;
import ct01.unipoint.backend.entity.StudentSemesterEntity;
import ct01.unipoint.backend.entity.UserEntity;
import ct01.unipoint.backend.exception.ApiException;
import ct01.unipoint.backend.exception.business.ResourceNotFoundException;
import ct01.unipoint.backend.service.StudentService;
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

  private final StudentDao studentDao;
  private final SemesterDao semesterDao;
  private final StudentSemesterDao studentSemesterDao;
  private final RecordDao recordDao;
  private final EventDao eventDao;

  @Override
  public StudentEntity getStudentByUser(UserEntity userEntity) {
    return studentDao.findByUserEntity(userEntity).orElseThrow();
  }

  @Override
  @Transactional(readOnly = true)
  public StudentDashboardResponse getDashboard(String userId) {
    StudentEntity student = studentDao.findByUserEntityId(userId)
        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy thông tin sinh viên."));

    Optional<SemesterEntity> activeSemesterOpt = semesterDao.findFirstByIsActiveTrueOrderByStartDateDesc();

    Integer totalScore = 0;
    int joinedActivities = 0;
    if (activeSemesterOpt.isPresent()) {
      Long semesterId = activeSemesterOpt.get().getId();
      totalScore = studentSemesterDao.findBySemester_IdAndStudent_Id(semesterId, student.getId())
          .map(StudentSemesterEntity::getFinalScore)
          .orElse(0);
      joinedActivities = (int) recordDao.countByStudent_IdAndSemester_Id(student.getId(), semesterId);
    }

    List<UpcomingEventItem> upcomingEvents = activeSemesterOpt
        .map(semester -> eventDao.findTop5BySemester_IdAndStartTimeAfterOrderByStartTimeAsc(
                semester.getId(), LocalDateTime.now())
            .stream()
            .map(this::toUpcomingItem)
            .toList())
        .orElse(List.of());

    List<ActivityHistoryItem> history = recordDao.findTop10ByStudent_IdOrderByCreatedAtDesc(student.getId())
        .stream()
        .map(this::toHistoryItem)
        .toList();

    String classCode = student.getClassEntity() != null ? student.getClassEntity().getClassCode() : null;
    String facultyName = student.getClassEntity() != null && student.getClassEntity().getFacultyEntity() != null
        ? student.getClassEntity().getFacultyEntity().getName()
        : null;

    return new StudentDashboardResponse(
        student.getFullName(),
        student.getStudentCode(),
        classCode,
        facultyName,
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
    return this.studentDao.findByUserEntity_Username(username)
        .orElseThrow(() -> new ResourceNotFoundException("Student profile for user: " + username));
  }

  @Override
  public List<StudentEntity> getStudentsByClassId(final Long classId) {
    return this.studentDao.findByClassEntity_Id(classId);
  }
}
