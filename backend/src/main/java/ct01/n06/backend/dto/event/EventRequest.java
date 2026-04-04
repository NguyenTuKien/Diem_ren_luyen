package ct01.n06.backend.dto.event;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class EventRequest {
    private Long semesterId;
    private Long criteriaId;
    private String title;
    private String organizer;
    private String description;
    private String location;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
}
