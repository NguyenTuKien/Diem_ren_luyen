package ct01.unipoint.backend.controller;

import ct01.unipoint.backend.dto.student.StudentDashboardResponse;
import ct01.unipoint.backend.entity.UserEntity;
import ct01.unipoint.backend.exception.ApiException;
import ct01.unipoint.backend.repository.UserRepository;
import ct01.unipoint.backend.service.StudentDashboardService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/student")
public class StudentDashboardController {

  private final StudentDashboardService studentDashboardService;
  private final UserRepository userRepository;

  public StudentDashboardController(
      StudentDashboardService studentDashboardService,
      UserRepository userRepository
  ) {
    this.studentDashboardService = studentDashboardService;
    this.userRepository = userRepository;
  }

  @GetMapping("/dashboard")
  public StudentDashboardResponse dashboard(@RequestParam(required = false) Long userId) {
    Long currentUserId = resolveCurrentUserId();
    return studentDashboardService.getDashboard(currentUserId);
  }

  private Long resolveCurrentUserId() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    if (authentication == null || !authentication.isAuthenticated()) {
      throw new ApiException(HttpStatus.UNAUTHORIZED, "Chưa xác thực.");
    }

    String principal = authentication.getName();
    UserEntity user = userRepository.findByUsernameIgnoreCase(principal)
        .or(() -> userRepository.findByEmailIgnoreCase(principal))
        .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Phiên đăng nhập không hợp lệ."));

    return user.getId();
  }
}