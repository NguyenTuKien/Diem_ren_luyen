package ct01.unipoint.backend.controller;

import ct01.unipoint.backend.dto.monitor.MonitorClassListResponse;
import ct01.unipoint.backend.entity.UserEntity;
import ct01.unipoint.backend.exception.ApiException;
import ct01.unipoint.backend.repository.UserRepository;
import ct01.unipoint.backend.service.MonitorClassService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/monitor")
public class MonitorController {

  private final MonitorClassService monitorClassService;
  private final UserRepository userRepository;

  public MonitorController(MonitorClassService monitorClassService, UserRepository userRepository) {
    this.monitorClassService = monitorClassService;
    this.userRepository = userRepository;
  }

  @GetMapping("/class-members")
  public MonitorClassListResponse classMembers(@RequestParam(required = false) Long monitorUserId) {
    Long currentUserId = resolveCurrentUserId();
    return monitorClassService.getManagedClassMembers(currentUserId);
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