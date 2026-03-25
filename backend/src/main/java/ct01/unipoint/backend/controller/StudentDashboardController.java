package ct01.unipoint.backend.controller;

import ct01.unipoint.backend.dto.student.StudentDashboardResponse;
import ct01.unipoint.backend.dao.UserDao;
import ct01.unipoint.backend.entity.UserEntity;
import ct01.unipoint.backend.exception.ApiException;
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
  private final UserDao userDao;

  public StudentDashboardController(
      StudentDashboardService studentDashboardService,
      UserDao userDao
  ) {
    this.studentDashboardService = studentDashboardService;
    this.userDao = userDao;
  }

  @GetMapping("/dashboard")
  public StudentDashboardResponse dashboard(@RequestParam(required = false) String userId) {
    String currentUserId = resolveCurrentUserId();
    return studentDashboardService.getDashboard(currentUserId);
  }

  private String resolveCurrentUserId() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    if (authentication == null || !authentication.isAuthenticated()) {
      throw new ApiException(HttpStatus.UNAUTHORIZED, "Chưa xác thực.");
    }

    String principal = authentication.getName();
    UserEntity user = userDao.findByUsernameIgnoreCase(principal)
        .or(() -> userDao.findByEmailIgnoreCase(principal))
        .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Phiên đăng nhập không hợp lệ."));

    return user.getId();
  }
}