package ct01.n06.backend.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import ct01.n06.backend.dto.student.StudentDashboardResponse;
import ct01.n06.backend.dto.student.StudentDashboardResponse.AttendedEventItem;
import ct01.n06.backend.dto.student.StudentDashboardResponse.UpcomingEventItem;
import ct01.n06.backend.service.StudentService;
import ct01.n06.backend.service.UserService;
import lombok.RequiredArgsConstructor;

import java.util.List;

@RestController
@RequestMapping("/student")
@RequiredArgsConstructor
public class StudentController {

  private final StudentService studentService;
  private final UserService userService;

  @PreAuthorize("hasAnyRole('STUDENT', 'MONITOR')")
  @GetMapping("/dashboard")
  public StudentDashboardResponse dashboard() {
    String currentUserId = userService.requireCurrentUserId();
    return studentService.getDashboard(currentUserId);
  }

  @PreAuthorize("hasAnyRole('STUDENT', 'MONITOR')")
  @GetMapping("/events")
  public List<UpcomingEventItem> upcomingEvents() {
    String currentUserId = userService.requireCurrentUserId();
    return studentService.getUpcomingEvents(currentUserId);
  }

  @PreAuthorize("hasAnyRole('STUDENT', 'MONITOR')")
  @GetMapping("/attendance")
  public List<AttendedEventItem> attendance() {
    String currentUserId = userService.requireCurrentUserId();
    return studentService.getAttendedEvents(currentUserId);
  }

}