package ct01.unipoint.backend.dto.lecturer;

import java.util.List;

public record LecturerStudentListResponse(
    int totalStudents,
    int activeStudents,
    int lockedStudents,
    int monitorStudents,
    List<LecturerStudentRowResponse> students
) {

}
