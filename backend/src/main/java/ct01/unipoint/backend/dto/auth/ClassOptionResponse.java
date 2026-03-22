package ct01.unipoint.backend.dto.auth;

public record ClassOptionResponse(
    Long id,
    String classCode,
    String facultyCode,
    String facultyName
) {

}
