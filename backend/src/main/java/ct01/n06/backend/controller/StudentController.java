package ct01.n06.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import ct01.n06.backend.dto.student.StudentDashboardResponse;
import ct01.n06.backend.service.StudentService;
import ct01.n06.backend.service.UserService;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/student")
@RequiredArgsConstructor
public class StudentController {

  private final StudentService studentService;
  private final UserService userService;


  @GetMapping("/dashboard")
  public StudentDashboardResponse dashboard() {
    String currentUserId = userService.requireCurrentUserId();
    return studentService.getDashboard(currentUserId);
  }
}