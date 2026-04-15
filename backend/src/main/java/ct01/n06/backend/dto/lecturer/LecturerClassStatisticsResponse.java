package ct01.n06.backend.dto.lecturer;

import java.util.List;

public record LecturerClassStatisticsResponse(
    Long classId,
    String classCode,
    Long semesterId,
    String semesterName,
    int totalStudents,
    long participatedStudents,
    double participationRate,
    List<ScoreDistributionItem> scoreDistribution,
    List<StudentStatisticItem> students
) {

  public record ScoreDistributionItem(
      String key,
      String label,
      int count,
      double percentage
  ) {
  }

  public record StudentStatisticItem(
      String studentId,
      String studentCode,
      String fullName,
      String email,
      int finalScore,
      String rankLabel,
      long joinedEvents
  ) {
  }
}
