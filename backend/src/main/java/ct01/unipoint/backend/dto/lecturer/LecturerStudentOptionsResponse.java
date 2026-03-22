package ct01.unipoint.backend.dto.lecturer;

import java.util.List;

public record LecturerStudentOptionsResponse(
    List<FacultyOptionItem> faculties,
    List<ClassOptionItem> classes
) {

  public record FacultyOptionItem(
      Long id,
      String code,
      String name
  ) {
  }

  public record ClassOptionItem(
      Long id,
      String classCode,
      Long facultyId,
      String facultyCode
  ) {
  }
}
