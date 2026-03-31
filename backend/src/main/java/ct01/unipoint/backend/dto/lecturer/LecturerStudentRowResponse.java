package ct01.unipoint.backend.dto.lecturer;

public record LecturerStudentRowResponse(
    String studentId,
    String fullName,
    String email,
    String studentCode,
    Long classId,
    String classCode,
    String facultyCode,
    String facultyName,
    String role,
    String accountStatus,
    Integer totalPoint,
    String mandatoryStatus
) {

}
