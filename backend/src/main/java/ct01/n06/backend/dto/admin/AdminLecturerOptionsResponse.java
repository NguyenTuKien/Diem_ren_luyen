package ct01.n06.backend.dto.admin;

import java.util.List;

public record AdminLecturerOptionsResponse(
    List<FacultyOptionItem> faculties
) {

  public record FacultyOptionItem(
      Long id,
      String code,
      String name
  ) {
  }
}