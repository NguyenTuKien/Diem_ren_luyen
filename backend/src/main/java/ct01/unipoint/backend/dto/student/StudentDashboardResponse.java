package ct01.unipoint.backend.dto.student;

import java.util.List;

public record StudentDashboardResponse(
    String fullName,
    String studentCode,
    String classCode,
    String facultyName,
    Integer totalScore,
    int joinedActivities,
    String rankLabel,
    List<UpcomingEventItem> upcomingEvents,
    List<ActivityHistoryItem> history
) {

  public record UpcomingEventItem(
      Long id,
      String title,
      String location,
      String startTime
  ) {
  }

  public record ActivityHistoryItem(
      Long id,
      String title,
      String status,
      String createdAt
  ) {
  }
}
