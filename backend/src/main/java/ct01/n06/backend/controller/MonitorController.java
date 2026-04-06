package ct01.n06.backend.controller;

import ct01.n06.backend.dto.monitor.MonitorClassListResponse;
import ct01.n06.backend.service.MonitorService;
import ct01.n06.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/monitor")
@RequiredArgsConstructor
public class MonitorController {

  private final MonitorService monitorService;
  private final UserService userService;


  @GetMapping("/class-members")
  public MonitorClassListResponse classMembers() {
    String currentUserId = userService.requireCurrentUserId();
    return monitorService.getManagedClassMembers(currentUserId);
  }
}