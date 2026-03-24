package ct01.unipoint.backend.controller;

import ct01.unipoint.backend.dto.response.PaginationResponse;
import ct01.unipoint.backend.entity.EventEntity;
import ct01.unipoint.backend.service.EventService;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/events")
@AllArgsConstructor
public class EventController {
    private final EventService eventService;


    @GetMapping("")
    public PaginationResponse<EventEntity> getAllEvent(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size){
        Pageable pageable = Pageable.ofSize(size).withPage(page);
        Page<EventEntity> eventPage = eventService.getAllEvents(pageable);

        return PaginationResponse.<EventEntity>builder()
            .content(eventPage.getContent())
            .page(eventPage.getNumber())
            .size(eventPage.getSize())
            .totalElements(eventPage.getTotalElements())
            .totalPages(eventPage.getTotalPages())
            .hasNext(eventPage.hasNext())
            .hasPrevious(eventPage.hasPrevious())
            .build();
    }

}
