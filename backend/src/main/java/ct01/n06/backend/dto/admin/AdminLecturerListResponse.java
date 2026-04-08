package ct01.n06.backend.dto.admin;

import java.util.List;

public record AdminLecturerListResponse(
    int totalLecturers,
    int activeLecturers,
    int lockedLecturers,
    int deletedLecturers,
    List<AdminLecturerRowResponse> lecturers
) {
}