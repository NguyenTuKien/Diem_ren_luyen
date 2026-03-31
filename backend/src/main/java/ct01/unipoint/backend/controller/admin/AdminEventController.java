package ct01.unipoint.backend.controller.admin;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import ct01.unipoint.backend.dto.request.EventRequest;
import ct01.unipoint.backend.entity.EventEntity;
import ct01.unipoint.backend.service.EventService;
import lombok.AllArgsConstructor;

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
