package ct01.n06.backend.service.impl;

import ct01.n06.backend.dto.event.AttendeeResponse;
import ct01.n06.backend.repository.AttendenceRepository;
import ct01.n06.backend.repository.CriteriaRepository;
import ct01.n06.backend.repository.EventRepository;
import ct01.n06.backend.repository.SemesterRepository;
import ct01.n06.backend.repository.UserRepository;
import ct01.n06.backend.dto.event.EventRequest;
import ct01.n06.backend.dto.event.EventResponse;
import ct01.n06.backend.entity.EventEntity;
import ct01.n06.backend.entity.UserEntity;
import ct01.n06.backend.mapper.EventMapper;
import ct01.n06.backend.service.EventService;
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
    private final EventRepository eventRepository;
    private final SemesterRepository semesterRepository;
    private final CriteriaRepository criteriaRepository;
    private final UserRepository userRepository;
    private final EventMapper eventMapper;
    private final AttendenceRepository attendenceRepository;

    @Override
    public Page<EventResponse> getAllEvents(Pageable pageable) {
        return eventRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(eventMapper::toResponse);
    }

    @Override
    public EventResponse createEvent(EventRequest eventRequest) {
        EventEntity eventEntity = eventMapper.toEntity(eventRequest);
        eventEntity.setSemester(semesterRepository.findById(eventRequest.getSemesterId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Học kỳ không hợp lệ.")));
        eventEntity.setCriteria(criteriaRepository.findById(eventRequest.getCriteriaId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tiêu chí không hợp lệ.")));
        if (eventEntity.getTitle() != null) {
            eventEntity.setTitle(eventEntity.getTitle().trim());
        }
        eventEntity.setCreatedBy(resolveCreator());
        return eventMapper.toResponse(eventRepository.save(eventEntity));
    }

    @Override
    public EventResponse updateEvent(Long eventId, EventRequest eventRequest) {
        EventEntity eventEntity = eventRepository.findById(eventId).orElseThrow();
        eventMapper.updateEntityFromRequest(eventRequest, eventEntity);
        return eventMapper.toResponse(eventRepository.save(eventEntity));
    }

    @Override
    public UserEntity resolveCreator() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        String username = authentication.getName();
        Optional<UserEntity> userOpt = userRepository.findByUsernameIgnoreCase(username)
                .or(() -> userRepository.findByEmailIgnoreCase(username))
                .or(() -> userRepository.findByUsername(username))
                .or(() -> userRepository.findByEmail(username));
        return userOpt.orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    @Override
    public void deleteEvent(Long eventId) {
        eventRepository.deleteById(eventId);
    }

    @Override
    public EventEntity getEventById(Long eventId) {
        return eventRepository.findById(eventId).orElseThrow();
    }

    @Override
    public Page<AttendeeResponse> getEventAttendees(Long eventId, Pageable pageable) {
        if (!eventRepository.existsById(eventId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Sự kiện không tồn tại.");
        }
        return attendenceRepository.findByEventIdOrderByStudentIdAsc(eventId, pageable)
                .map(attendance -> {
                    var student = attendance.getStudent();
                    return AttendeeResponse.builder()
                            .studentId(student.getId())
                            .studentCode(student.getStudentCode())
                            .fullName(student.getFullName())
                            .className(student.getClassEntity() != null ? student.getClassEntity().getClassCode() : null)
                            .build();
                });
    }
}