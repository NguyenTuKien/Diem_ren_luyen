package ct01.unipoint.backend.controller;

import ct01.unipoint.backend.dto.monitor.MonitorClassListResponse;
import ct01.unipoint.backend.service.MonitorClassService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/monitor")
public class MonitorController {

  private final MonitorClassService monitorClassService;

  public MonitorController(MonitorClassService monitorClassService) {
    this.monitorClassService = monitorClassService;
  }

  @GetMapping("/class-members")
  public MonitorClassListResponse classMembers(@RequestParam Long monitorUserId) {
    return monitorClassService.getManagedClassMembers(monitorUserId);
  }
}
