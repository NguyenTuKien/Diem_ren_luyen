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
<<<<<<< HEAD
=======
        if (eventRequest == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thiếu dữ liệu yêu cầu.");
        }
        if (eventRequest.getSemesterId() == null || eventRequest.getCriteriaId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thiếu semesterId hoặc criteriaId.");
        }
        if (eventRequest.getTitle() == null || eventRequest.getTitle().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thiếu tiêu đề sự kiện.");
        }
        if (eventRequest.getStartTime() == null || eventRequest.getEndTime() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thiếu thời gian bắt đầu hoặc kết thúc.");
        }
        if (!eventRequest.getEndTime().isAfter(eventRequest.getStartTime())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thời gian kết thúc phải sau thời gian bắt đầu.");
        }

>>>>>>> 5f6b687e64570063f6f6e8eb6ff7f9e390eb9956
        EventEntity eventEntity = new EventEntity();
        eventEntity.setSemester(semesterDao.findById(eventRequest.getSemesterId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Học kỳ không hợp lệ.")));
        eventEntity.setCriteria(criteriaDao.findById(eventRequest.getCriteriaId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tiêu chí không hợp lệ.")));
        eventEntity.setTitle(eventRequest.getTitle().trim());
        eventEntity.setOrganizer(eventRequest.getOrganizer());
        eventEntity.setDescription(eventRequest.getDescription());
        eventEntity.setLocation(eventRequest.getLocation());
        eventEntity.setStartTime(eventRequest.getStartTime());
        eventEntity.setEndTime(eventRequest.getEndTime());
        eventEntity.setCreatedBy(resolveCreator());
        return eventDao.save(eventEntity);
    }

<<<<<<< HEAD
=======
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
            try {
                Long createdById = Long.valueOf(eventRequest.getCreatedBy().trim());
                return userDao.findById(createdById).orElseThrow();
            } catch (NumberFormatException ex) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "createdBy phải là số.");
            }
        }

        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Không xác định được người tạo sự kiện.");
    }

>>>>>>> 5f6b687e64570063f6f6e8eb6ff7f9e390eb9956
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
