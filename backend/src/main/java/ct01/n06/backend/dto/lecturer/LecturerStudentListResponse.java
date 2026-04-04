package ct01.n06.backend.dto.lecturer;

import java.util.List;

public record LecturerStudentListResponse(
    int totalStudents,
    int activeStudents,
    int lockedStudents,
    int monitorStudents,
    List<LecturerStudentRowResponse> students
) {

}
