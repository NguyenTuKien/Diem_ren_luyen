package ct01.unipoint.backend.controller.admin;

import ct01.unipoint.backend.entity.EventEntity;
import ct01.unipoint.backend.dto.request.EventRequest;
import ct01.unipoint.backend.service.EventService;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@AllArgsConstructor
@RequestMapping("/v1/admin/events")
public class AdminEventController {
    private final EventService eventService;

    @PostMapping("")
    public EventEntity createEvent(@RequestBody EventRequest request) {

        return eventService.createEvent(request);
    }

    @PutMapping("/{id}")
    public EventEntity updateEvent(@PathVariable Long id, @RequestBody EventRequest request) {
        return eventService.updateEvent(id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteEvent(@PathVariable Long id) {
        eventService.deleteEvent(id);
    }
}
