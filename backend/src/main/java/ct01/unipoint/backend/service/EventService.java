package ct01.unipoint.backend.service;

import ct01.unipoint.backend.dto.event.EventRequest;
import ct01.unipoint.backend.dto.event.EventResponse;
import ct01.unipoint.backend.entity.UserEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface EventService {
    Page<EventResponse> getAllEvents(Pageable pageable);

    EventResponse createEvent(EventRequest eventRequest);
    EventEntity getEventById(Long eventId);

    EventResponse updateEvent(Long eventId, EventRequest eventRequest);

    UserEntity resolveCreator();

    EventEntity updateEvent(Long eventId, EventRequest eventRequest);

    void deleteEvent(Long eventId);
}

