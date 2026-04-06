package ct01.n06.backend.dto.lecturer;

import java.util.List;

public record ImportStudentsResponse(
    int importedCount,
    int skippedCount,
    List<String> errors
) {

}
