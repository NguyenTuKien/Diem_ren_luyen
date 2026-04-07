package ct01.n06.backend.dto.admin;

import java.util.List;

public record AdminStudentStatsResponse(
    int totalStudents,
    int activeStudents,
    int lockedStudents,
    int deletedStudents,
    int monitorStudents,
    int totalFaculties,
    int totalClasses,
    List<FacultyBreakdownItem> facultyBreakdown,
    List<ClassBreakdownItem> classBreakdown,
    List<AdminStudentRowResponse> recentStudents
) {

  public record FacultyBreakdownItem(
      Long facultyId,
      String facultyCode,
      String facultyName,
      int studentCount,
      int monitorCount
  ) {
  }

  public record ClassBreakdownItem(
      Long classId,
      String classCode,
      String facultyName,
      String lecturerName,
      int studentCount
  ) {
  }
}