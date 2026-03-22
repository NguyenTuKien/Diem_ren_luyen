package ct01.unipoint.backend.dto.monitor;

public record MonitorClassMemberResponse(
    Long studentId,
    String studentCode,
    String fullName,
    String email,
    Integer totalPoint,
    String mandatoryParticipation,
    boolean monitor,
    String accountStatus
) {

}
