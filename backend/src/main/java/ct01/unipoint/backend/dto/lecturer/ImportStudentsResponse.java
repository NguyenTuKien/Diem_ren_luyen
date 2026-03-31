package ct01.unipoint.backend.dto.lecturer;

import java.util.List;

public record ImportStudentsResponse(
    int importedCount,
    int skippedCount,
    List<String> errors
) {

}
