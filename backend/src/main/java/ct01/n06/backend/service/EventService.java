package ct01.n06.backend.service;

import ct01.n06.backend.dto.event.EventRequest;
import ct01.n06.backend.dto.event.EventResponse;
import ct01.n06.backend.entity.EventEntity;
import ct01.n06.backend.entity.UserEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface EventService {
    Page<EventResponse> getAllEvents(Pageable pageable);

    EventResponse createEvent(EventRequest eventRequest);
    EventEntity getEventById(Long eventId);

    EventResponse updateEvent(Long eventId, EventRequest eventRequest);

    UserEntity resolveCreator();

    void deleteEvent(Long eventId);
}

