package ct01.unipoint.backend.service.impl;

import ct01.unipoint.backend.dao.CriteriaDao;
import ct01.unipoint.backend.dao.EventDao;
import ct01.unipoint.backend.dao.SemesterDao;
import ct01.unipoint.backend.dao.UserDao;
import ct01.unipoint.backend.dto.event.EventRequest;
import ct01.unipoint.backend.dto.event.EventResponse;
import ct01.unipoint.backend.entity.EventEntity;
import ct01.unipoint.backend.entity.UserEntity;
import ct01.unipoint.backend.mapper.EventMapper;
import ct01.unipoint.backend.service.EventService;
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
public class EventServiceImpl implements EventService {
    private final EventDao eventDao;
    private final SemesterDao semesterDao;
    private final CriteriaDao criteriaDao;
    private final UserDao userDao;
    private final EventMapper eventMapper;

    @Override
    public Page<EventResponse> getAllEvents(Pageable pageable) {
        return eventDao.findAll(pageable)
                .map(eventMapper::toResponse);
    }

    @Override
    public EventResponse createEvent(EventRequest eventRequest) {
        EventEntity eventEntity = eventMapper.toEntity(eventRequest);
        eventEntity.setSemester(semesterDao.findById(eventRequest.getSemesterId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Học kỳ không hợp lệ.")));
        eventEntity.setCriteria(criteriaDao.findById(eventRequest.getCriteriaId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tiêu chí không hợp lệ.")));
        if (eventEntity.getTitle() != null) {
            eventEntity.setTitle(eventEntity.getTitle().trim());
        }
        eventEntity.setCreatedBy(resolveCreator());
        return eventMapper.toResponse(eventDao.save(eventEntity));
    }

    @Override
    public EventResponse updateEvent(Long eventId, EventRequest eventRequest) {
        EventEntity eventEntity = eventDao.findById(eventId).orElseThrow();
        eventMapper.updateEntityFromRequest(eventRequest, eventEntity);
        return eventMapper.toResponse(eventDao.save(eventEntity));
    }

    @Override
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

    @Override
    public void deleteEvent(Long eventId) {
        eventDao.deleteById(eventId);
    }
    @Override
    public EventEntity getEventById(Long eventId) {
        return eventDao.findById(eventId).orElseThrow();
    }
}