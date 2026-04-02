package ct01.unipoint.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import ct01.unipoint.backend.dto.student.StudentDashboardResponse;
import ct01.unipoint.backend.service.CurrentUserService;
import ct01.unipoint.backend.service.StudentService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/student")
@RequiredArgsConstructor
public class StudentController {

  private final StudentService studentService;
  private final CurrentUserService currentUserService;


  @GetMapping("/dashboard")
  public StudentDashboardResponse dashboard() {
    Long currentUserId = currentUserService.requireCurrentUserId();
    return studentService.getDashboard(currentUserId);
  }
}