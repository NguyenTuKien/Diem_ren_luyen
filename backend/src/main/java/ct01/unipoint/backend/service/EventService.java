package ct01.unipoint.backend.service;

import ct01.unipoint.backend.dao.CriteriaDao;
import ct01.unipoint.backend.dao.EventDao;
import ct01.unipoint.backend.dao.SemesterDao;
import ct01.unipoint.backend.dao.UserDao;
import ct01.unipoint.backend.dto.request.EventRequest;
import ct01.unipoint.backend.entity.EventEntity;
import ct01.unipoint.backend.entity.UserEntity;
import ct01.unipoint.backend.entity.enums.EventStatus;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

@Service
@AllArgsConstructor
public class EventService {
    private final EventDao eventDao;
    private final SemesterDao semesterDao;
    private final CriteriaDao criteriaDao;
    private final UserDao userDao;

    public final EventEntity getEventById(Long eventId) {
        return eventDao.findById(eventId).orElseThrow();
    }

    public final Page<EventEntity> getAllEvents(Pageable pageable) {
        return eventDao.findAll(pageable);
    }

    public final EventEntity createEvent(EventRequest eventRequest) {
        if (eventRequest == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Request body is required");
        }
        if (eventRequest.getSemesterId() == null || eventRequest.getCriteriaId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "semesterId and criteriaId are required");
        }
        if (eventRequest.getTitle() == null || eventRequest.getTitle().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "title is required");
        }
        if (eventRequest.getStartTime() == null || eventRequest.getEndTime() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "startTime and endTime are required");
        }
        if (!eventRequest.getEndTime().isAfter(eventRequest.getStartTime())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "endTime must be after startTime");
        }

        EventEntity eventEntity = new EventEntity();
        eventEntity.setSemester(semesterDao.findById(eventRequest.getSemesterId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid semesterId")));
        eventEntity.setCriteria(criteriaDao.findById(eventRequest.getCriteriaId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid criteriaId")));
        eventEntity.setTitle(eventRequest.getTitle().trim());
        eventEntity.setOrganizer(eventRequest.getOrganizer());
        eventEntity.setDescription(eventRequest.getDescription());
        eventEntity.setLocation(eventRequest.getLocation());
        eventEntity.setStartTime(eventRequest.getStartTime());
        eventEntity.setEndTime(eventRequest.getEndTime());
        eventEntity.setCreatedBy(resolveCreator(eventRequest));
        eventEntity.setStatus(EventStatus.UPCOMING);
        return eventDao.save(eventEntity);
    }

    private UserEntity resolveCreator(EventRequest eventRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            String principal = authentication.getName();
            Optional<UserEntity> userByPrincipal = userDao.findByUsername(principal)
                    .or(() -> userDao.findByEmail(principal));
            if (userByPrincipal.isPresent()) {
                return userByPrincipal.get();
            }
        }

        if (eventRequest.getCreatedBy() != null && !eventRequest.getCreatedBy().isBlank()) {
            return userDao.findById(eventRequest.getCreatedBy()).orElseThrow();
        }

        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Cannot resolve creator for event");
    }

    public final EventEntity updateEvent(Long eventId, EventRequest eventRequest) {
        EventEntity eventEntity = eventDao.findById(eventId).orElseThrow();
        eventEntity.setTitle(eventRequest.getTitle());
        eventEntity.setOrganizer(eventRequest.getOrganizer());
        eventEntity.setDescription(eventRequest.getDescription());
        eventEntity.setLocation(eventRequest.getLocation());
        eventEntity.setStartTime(eventRequest.getStartTime());
        eventEntity.setEndTime(eventRequest.getEndTime());
        return eventDao.save(eventEntity);
    }

    public final void deleteEvent(Long eventId) {
        eventDao.deleteById(eventId);
    }
}
