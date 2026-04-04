package ct01.n06.backend.dto.monitor;

import java.util.List;

public record MonitorClassListResponse(
    String classCode,
    String facultyName,
    int totalMembers,
    List<MonitorClassMemberResponse> members
) {

}
