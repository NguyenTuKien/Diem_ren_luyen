package ct01.unipoint.backend.controller;

import ct01.unipoint.backend.dto.monitor.MonitorClassListResponse;
import ct01.unipoint.backend.service.MonitorService;
import ct01.unipoint.backend.service.CurrentUserService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/monitor")
public class MonitorController {

  private final MonitorService monitorService;
  private final CurrentUserService currentUserService;

  public MonitorController(MonitorService monitorService, CurrentUserService currentUserService) {
    this.monitorService = monitorService;
    this.currentUserService = currentUserService;
  }

  @GetMapping("/class-members")
  public MonitorClassListResponse classMembers(@RequestParam(required = false) Long monitorUserId) {
    Long currentUserId = currentUserService.requireCurrentUserId();
    return monitorService.getManagedClassMembers(currentUserId);
  }
}