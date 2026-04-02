package ct01.unipoint.backend.controller.lecturer;

import ct01.unipoint.backend.dto.event.EventRequest;
import ct01.unipoint.backend.dto.event.EventResponse;
import ct01.unipoint.backend.service.EventService;
import lombok.AllArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@AllArgsConstructor
@RequestMapping("/v1/lecturer/events")
public class LecturerEventController {
    private final EventService eventService;

    @PostMapping("")
    public EventResponse createEvent(@RequestBody EventRequest request) {

        return eventService.createEvent(request);
    }

    @PutMapping("/{id}")
    public EventResponse updateEvent(@PathVariable Long id, @RequestBody EventRequest request) {
        return eventService.updateEvent(id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteEvent(@PathVariable Long id) {
        eventService.deleteEvent(id);
    }
}
