package ct01.n06.backend.dto.monitor;

public record MonitorClassMemberResponse(
    String studentId,
    String studentCode,
    String fullName,
    String email,
    Integer totalPoint,
    String mandatoryParticipation,
    boolean monitor,
    String accountStatus
) {

}
