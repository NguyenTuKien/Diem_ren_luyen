package ct01.unipoint.backend.service;

import ct01.unipoint.backend.dto.event.EventRequest;
import ct01.unipoint.backend.entity.EventEntity;
import ct01.unipoint.backend.entity.UserEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface EventService {
    Page<EventEntity> getAllEvents(Pageable pageable);

    EventEntity createEvent(EventRequest eventRequest);

    EventEntity updateEvent(Long eventId, EventRequest eventRequest);

    UserEntity resolveCreator();

    void deleteEvent(Long eventId);
}

