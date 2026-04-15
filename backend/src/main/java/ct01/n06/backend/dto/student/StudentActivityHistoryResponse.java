package ct01.n06.backend.dto.student;

import java.util.List;

public record StudentActivityHistoryResponse(
    int page,
    int size,
    long totalItems,
    int totalPages,
    List<ActivityHistoryDetailItem> items
) {

  public record ActivityHistoryDetailItem(
      Long recordId,
      Long eventId,
      String title,
      String semesterName,
      String activityTime,
      double points,
      String status,
      String evidenceUrl
  ) {
  }
}
