package ct01.unipoint.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import ct01.unipoint.backend.dto.student.StudentDashboardResponse;
import ct01.unipoint.backend.service.CurrentUserService;
import ct01.unipoint.backend.service.StudentService;

@RestController
@RequestMapping("/student")
public class StudentController {

  private final StudentService studentService;
  private final CurrentUserService currentUserService;

  public StudentController(
      StudentService studentService,
      CurrentUserService currentUserService
  ) {
    this.studentService = studentService;
    this.currentUserService = currentUserService;
  }

  @GetMapping("/dashboard")
  public StudentDashboardResponse dashboard(@RequestParam(required = false) Long userId) {
    Long currentUserId = currentUserService.requireCurrentUserId();
    return studentService.getDashboard(currentUserId);
  }
}