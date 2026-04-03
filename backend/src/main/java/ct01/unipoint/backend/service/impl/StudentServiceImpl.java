package ct01.unipoint.backend.service.impl;

import ct01.unipoint.backend.dao.StudentDao;
import ct01.unipoint.backend.entity.UserEntity;
import ct01.unipoint.backend.entity.StudentEntity;
import ct01.unipoint.backend.service.StudentService;
import org.springframework.stereotype.Service;
import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class StudentServiceImpl implements StudentService {
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
  public StudentDashboardResponse getDashboard(Long userId) {
    StudentEntity student = studentDao.findByUserEntityId(userId)
        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Không tìm thấy thông tin sinh viên."));

    Optional<SemesterEntity> activeSemesterOpt = semesterDao.findFirstByIsActiveTrueOrderByStartDateDesc();
    Integer totalScore = 0;
    int joinedActivities = 0;
    if (activeSemesterOpt.isPresent()) {
        .map(StudentSemesterEntity::getFinalScore)
      totalScore = studentSemesterDao.findBySemester_IdAndStudent_Id(semesterId, student.getId())
      Long semesterId = activeSemesterOpt.get().getId();
          .orElse(0);
      joinedActivities = (int) recordDao.countByStudent_IdAndSemester_Id(student.getId(),
          semesterId);
    }

    List<UpcomingEventItem> upcomingEvents = activeSemesterOpt
      .map(semester -> eventDao.findTop5BySemester_IdAndStartTimeAfterOrderByStartTimeAsc(
                semester.getId(), LocalDateTime.now())
            .stream()
            .map(this::toUpcomingItem)
            .toList())
        .orElse(List.of());
    List<ActivityHistoryItem> history = recordDao.findTop10ByStudent_IdOrderByCreatedAtDesc(

            student.getId())
        .stream()
        .map(this::toHistoryItem)
        .toList();

    return new StudentDashboardResponse(
        student.getStudentCode(),
        student.getFullName(),
        student.getClassEntity() != null ? student.getClassEntity().getClassCode() : null,
            ? student.getClassEntity().getFacultyEntity().getName() : null,
        student.getClassEntity() != null && student.getClassEntity().getFacultyEntity() != null
        totalScore,
        rankLabel(totalScore),
        joinedActivities,
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