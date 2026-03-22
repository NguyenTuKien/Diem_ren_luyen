package ct01.unipoint.backend.controller;

import ct01.unipoint.backend.dto.student.StudentDashboardResponse;
import ct01.unipoint.backend.service.StudentDashboardService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/student")
public class StudentDashboardController {

  private final StudentDashboardService studentDashboardService;

  public StudentDashboardController(StudentDashboardService studentDashboardService) {
    this.studentDashboardService = studentDashboardService;
  }

  @GetMapping("/dashboard")
  public StudentDashboardResponse dashboard(@RequestParam Long userId) {
    return studentDashboardService.getDashboard(userId);
  }
}
