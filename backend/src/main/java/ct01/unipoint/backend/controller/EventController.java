package ct01.unipoint.backend.controller;

import ct01.unipoint.backend.dto.common.PaginationResponse;
import ct01.unipoint.backend.dto.event.EventResponse;
import ct01.unipoint.backend.service.EventService;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import ct01.unipoint.backend.entity.EventEntity;
import ct01.unipoint.backend.service.EventService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/v1/events")
@RequiredArgsConstructor
public class EventController {
    private final EventService eventService;


    @GetMapping("")
    public Page<EventResponse> getAllEvent(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size){
        Pageable pageable = Pageable.ofSize(size).withPage(page);
        Page<EventResponse> eventPage = eventService.getAllEvents(pageable);

        return eventPage;
    }

}
