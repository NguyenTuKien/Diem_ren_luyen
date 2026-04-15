package ct01.n06.backend.controller;

import ct01.n06.backend.dto.student.StudentActivityHistoryResponse;
import ct01.n06.backend.dto.student.StudentScoreTrendResponse;
import ct01.n06.backend.service.StudentService;
import ct01.n06.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/student")
@RequiredArgsConstructor
public class StudentAnalyticsController {

  private final StudentService studentService;
  private final UserService userService;

  @PreAuthorize("hasAnyRole('STUDENT', 'MONITOR')")
  @GetMapping("/activity-history")
  public StudentActivityHistoryResponse getActivityHistory(
      @RequestParam(required = false) Long semesterId,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size
  ) {
    return studentService.getActivityHistory(userService.requireCurrentUserId(), semesterId, page, size);
  }

  @PreAuthorize("hasAnyRole('STUDENT', 'MONITOR')")
  @GetMapping("/score-trend")
  public StudentScoreTrendResponse getScoreTrend() {
    return studentService.getScoreTrend(userService.requireCurrentUserId());
  }
}
