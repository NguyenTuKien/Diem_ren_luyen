package ct01.unipoint.backend.service.impl;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import ct01.unipoint.backend.constant.EventConstant;
import ct01.unipoint.backend.dao.CriteriaDao;
import ct01.unipoint.backend.dao.EventDao;
import ct01.unipoint.backend.dao.SemesterDao;
import ct01.unipoint.backend.dao.UserDao;
import ct01.unipoint.backend.dto.request.EventRequest;
import ct01.unipoint.backend.entity.EventEntity;
import ct01.unipoint.backend.entity.UserEntity;
import ct01.unipoint.backend.entity.enums.EventStatus;
import ct01.unipoint.backend.exception.ApiException;
import ct01.unipoint.backend.service.EventService;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EventServiceImpl implements EventService {

    private final EventDao eventDao;
    private final SemesterDao semesterDao;
    private final CriteriaDao criteriaDao;
    private final UserDao userDao;

    @Override
    public EventEntity getEventById(Long eventId) {
        return eventDao.findById(eventId).orElseThrow();
    }

    @Override
    public Page<EventEntity> getAllEvents(Pageable pageable) {
        return eventDao.findAll(pageable);
    }

    @Override
    public EventEntity createEvent(EventRequest eventRequest) {
        if (eventRequest == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, EventConstant.MESSAGE_MISSING_REQUEST_DATA);
        }
        if (eventRequest.getSemesterId() == null || eventRequest.getCriteriaId() == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                EventConstant.MESSAGE_MISSING_SEMESTER_OR_CRITERIA);
        }
        if (eventRequest.getTitle() == null || eventRequest.getTitle().isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, EventConstant.MESSAGE_MISSING_EVENT_TITLE);
        }
        if (eventRequest.getStartTime() == null || eventRequest.getEndTime() == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, EventConstant.MESSAGE_MISSING_EVENT_TIME);
        }
        if (!eventRequest.getEndTime().isAfter(eventRequest.getStartTime())) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                EventConstant.MESSAGE_INVALID_EVENT_TIME_RANGE);
        }

        EventEntity eventEntity = new EventEntity();
        eventEntity.setSemester(semesterDao.findById(eventRequest.getSemesterId())
            .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST,
                EventConstant.MESSAGE_INVALID_SEMESTER)));
        eventEntity.setCriteria(criteriaDao.findById(eventRequest.getCriteriaId())
            .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST,
                EventConstant.MESSAGE_INVALID_CRITERIA)));
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

    @Override
    public EventEntity updateEvent(Long eventId, EventRequest eventRequest) {
        EventEntity eventEntity = eventDao.findById(eventId).orElseThrow();
        eventEntity.setTitle(eventRequest.getTitle());
        eventEntity.setOrganizer(eventRequest.getOrganizer());
        eventEntity.setDescription(eventRequest.getDescription());
        eventEntity.setLocation(eventRequest.getLocation());
        eventEntity.setStartTime(eventRequest.getStartTime());
        eventEntity.setEndTime(eventRequest.getEndTime());
        return eventDao.save(eventEntity);
    }

    @Override
    public void deleteEvent(Long eventId) {
        eventDao.deleteById(eventId);
    }

    private UserEntity resolveCreator(EventRequest eventRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            String principal = authentication.getName();
                Optional<UserEntity> userByPrincipal = userDao.findByUsernameIgnoreCase(principal)
                    .or(() -> userDao.findByEmailIgnoreCase(principal));
            if (userByPrincipal.isPresent()) {
                return userByPrincipal.get();
            }
        }

        if (eventRequest.getCreatedBy() != null && !eventRequest.getCreatedBy().isBlank()) {
            try {
                Long createdById = Long.valueOf(eventRequest.getCreatedBy().trim());
                return userDao.findById(createdById).orElseThrow();
            } catch (NumberFormatException ex) {
                throw new ApiException(HttpStatus.BAD_REQUEST,
                    EventConstant.MESSAGE_INVALID_CREATED_BY_FORMAT);
            }
        }

        throw new ApiException(HttpStatus.UNAUTHORIZED, EventConstant.MESSAGE_UNRESOLVED_EVENT_CREATOR);
    }
}
