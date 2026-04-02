package ct01.unipoint.backend.dto.event;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventResponse {
    private Long id;
    private Long semesterId;
    private Long criteriaId;
    private String title;
    private String organizer;
    private String description;
    private String location;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String createdByUserId;
}
