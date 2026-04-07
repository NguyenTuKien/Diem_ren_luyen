package ct01.n06.backend.dto.admin;

import java.util.List;

public record AdminStudentListResponse(
    int totalStudents,
    int activeStudents,
    int lockedStudents,
    int deletedStudents,
    int monitorStudents,
    List<AdminStudentRowResponse> students
) {
}