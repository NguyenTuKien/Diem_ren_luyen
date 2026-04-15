package ct01.n06.backend.dto.admin;

import java.util.List;

public record AdminLecturerOptionsResponse(
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
      String facultyCode,
      String facultyName,
      String lecturerName
  ) {
  }
}