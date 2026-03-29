package ct01.unipoint.backend.service;

import ct01.unipoint.backend.dto.request.EventRequest;
import ct01.unipoint.backend.entity.EventEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface EventService {

    EventEntity getEventById(Long eventId);

    Page<EventEntity> getAllEvents(Pageable pageable);

    EventEntity createEvent(EventRequest eventRequest);

    EventEntity updateEvent(Long eventId, EventRequest eventRequest);

    void deleteEvent(Long eventId);
}
