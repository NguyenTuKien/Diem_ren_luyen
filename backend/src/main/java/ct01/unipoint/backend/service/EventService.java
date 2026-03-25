package ct01.unipoint.backend.service;

import ct01.unipoint.backend.dao.CriteriaDao;
import ct01.unipoint.backend.dao.EventDao;
import ct01.unipoint.backend.dao.SemesterDao;
import ct01.unipoint.backend.dao.UserDao;
import ct01.unipoint.backend.dto.request.EventRequest;
import ct01.unipoint.backend.entity.EventEntity;
import ct01.unipoint.backend.entity.UserEntity;
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

    public final Page<EventEntity> getAllEvents(Pageable pageable) {
        return eventDao.findAll(pageable);
    }

    public final EventEntity createEvent(EventRequest eventRequest) {
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
        eventEntity.setCreatedBy(resolveCreator());
        return eventDao.save(eventEntity);
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

    public UserEntity resolveCreator() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        String username = authentication.getName();
        Optional<UserEntity> userOpt = userDao.findByUsernameIgnoreCase(username)
                .or(() -> userDao.findByEmailIgnoreCase(username))
                .or(() -> userDao.findByUsername(username))
                .or(() -> userDao.findByEmail(username));
        return userOpt.orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    public final void deleteEvent(Long eventId) {
        eventDao.deleteById(eventId);
    }
}
