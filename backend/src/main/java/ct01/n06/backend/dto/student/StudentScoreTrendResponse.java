package ct01.n06.backend.dto.student;

import java.util.List;

public record StudentScoreTrendResponse(
    List<SemesterScoreItem> semesters
) {

  public record SemesterScoreItem(
      Long semesterId,
      String semesterName,
      Integer finalScore,
      Integer deltaFromPrevious,
      String rankLabel
  ) {
  }
}
