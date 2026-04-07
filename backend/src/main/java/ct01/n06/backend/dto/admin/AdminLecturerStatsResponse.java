package ct01.n06.backend.dto.admin;

import java.util.List;

public record AdminLecturerStatsResponse(
    int totalLecturers,
    int activeLecturers,
    int lockedLecturers,
    int deletedLecturers,
    int totalFaculties,
    int assignedClasses,
    int unassignedLecturers,
    List<FacultyBreakdownItem> facultyBreakdown,
    List<AdminLecturerRowResponse> recentLecturers
) {

  public record FacultyBreakdownItem(
      Long facultyId,
      String facultyCode,
      String facultyName,
      int lecturerCount,
      int classCount
  ) {
  }
}